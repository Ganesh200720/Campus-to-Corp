from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from django.db.models import Avg, Q
from accounts.models import User, StudentProfile
from skills.models import AssessmentResult, StudentSkill
from opportunities.models import Application
from portfolio.models import Project, Certification
from skills import services
from .permissions import IsInstitutionUser


def _institution_students(user):
    """Students that belong to the logged-in Institution user's own institution."""
    institution_name = user.institution_profile.institution_name
    return StudentProfile.objects.filter(college__iexact=institution_name)


class InstitutionOverviewView(APIView):
    permission_classes = [IsInstitutionUser]

    def get(self, request):
        department = request.query_params.get('department')
        year = request.query_params.get('year')

        students = _institution_students(request.user)
        if department:
            students = students.filter(branch__iexact=department)
        if year:
            students = students.filter(year=year)

        total_students = students.count()
        student_users = User.objects.filter(student_profile__in=students)

        assessed_ids = AssessmentResult.objects.filter(student__in=student_users).values_list('student_id', flat=True).distinct()
        students_assessed = len(set(assessed_ids))

        avg_skill = StudentSkill.objects.filter(student__in=student_users).aggregate(avg=Avg('score'))['avg'] or 0

        readiness_scores = []
        for u in student_users:
            r = services.compute_placement_readiness(u)
            readiness_scores.append(r['readiness_score'])
        avg_readiness = round(sum(readiness_scores) / len(readiness_scores), 1) if readiness_scores else 0

        internship_participants = Application.objects.filter(
            student__in=student_users, internship__isnull=False).values_list('student_id', flat=True).distinct().count()
        internship_participation_rate = round((internship_participants / total_students) * 100, 1) if total_students else 0

        placed = Application.objects.filter(student__in=student_users, status='selected').values_list('student_id', flat=True).distinct().count()
        placement_rate = round((placed / total_students) * 100, 1) if total_students else 0

        top_skills = list(StudentSkill.objects.filter(student__in=student_users).values('skill__name').annotate(
            avg_score=Avg('score')).order_by('-avg_score')[:8])
        top_skills = [{"skill": s['skill__name'], "avg_score": round(s['avg_score'], 1)} for s in top_skills]

        demand = services.industry_skill_demand()
        student_skill_avg = {s['skill__name']: s['avg_score'] for s in
                              StudentSkill.objects.filter(student__in=student_users).values('skill__name').annotate(avg_score=Avg('score'))}
        skill_gaps = []
        for d in demand[:8]:
            student_level = round(student_skill_avg.get(d['skill'], 0), 1)
            skill_gaps.append({
                "skill": d['skill'],
                "industry_demand": d['demand_percent'],
                "student_average": student_level,
                "gap": round(max(d['demand_percent'] - student_level, 0), 1),
            })
        skill_gaps.sort(key=lambda x: -x['gap'])

        dept_data = {}
        for u in student_users.select_related('student_profile'):
            branch = u.student_profile.branch or 'Unspecified'
            r = services.compute_placement_readiness(u)['readiness_score']
            dept_data.setdefault(branch, []).append(r)
        department_wise_readiness = [
            {"department": k, "avg_readiness": round(sum(v) / len(v), 1), "student_count": len(v)}
            for k, v in dept_data.items()
        ]

        return Response({
            "institution_name": request.user.institution_profile.institution_name,
            "total_students": total_students,
            "students_assessed": students_assessed,
            "average_skill_score": round(avg_skill, 1),
            "average_placement_readiness": avg_readiness,
            "internship_participation_rate": internship_participation_rate,
            "placement_rate": placement_rate,
            "top_skills": top_skills,
            "skill_gaps": skill_gaps,
            "department_wise_readiness": department_wise_readiness,
        })


class InstitutionStudentListView(APIView):
    """Roster of every student belonging to the logged-in institution, with
    at-a-glance progress so the institution can monitor skill development,
    internship participation and placement progress across the cohort."""
    permission_classes = [IsInstitutionUser]

    def get(self, request):
        department = request.query_params.get('department')
        year = request.query_params.get('year')
        search = request.query_params.get('search')
        placement_status = request.query_params.get('placement_status')  # 'placed' | 'not_placed'

        students = _institution_students(request.user).select_related('user')
        if department:
            students = students.filter(branch__iexact=department)
        if year:
            students = students.filter(year=year)
        if search:
            students = students.filter(Q(full_name__icontains=search) | Q(user__email__icontains=search))

        results = []
        for profile in students.order_by('full_name'):
            student_user = profile.user
            skill_avg = StudentSkill.objects.filter(student=student_user).aggregate(avg=Avg('score'))['avg'] or 0
            readiness = services.compute_placement_readiness(student_user)['readiness_score']
            internship_count = Application.objects.filter(student=student_user, internship__isnull=False).count()
            job_count = Application.objects.filter(student=student_user, job__isnull=False).count()
            is_placed = Application.objects.filter(student=student_user, status='selected').exists()

            if placement_status == 'placed' and not is_placed:
                continue
            if placement_status == 'not_placed' and is_placed:
                continue

            results.append({
                "id": student_user.id,
                "full_name": profile.full_name,
                "email": student_user.email,
                "branch": profile.branch,
                "year": profile.year,
                "cgpa": profile.cgpa,
                "career_interest": profile.career_interest,
                "avatar_color": profile.avatar_color,
                "profile_completion": profile.profile_completion,
                "resume_uploaded": profile.resume_uploaded,
                "average_skill_score": round(skill_avg, 1),
                "placement_readiness": readiness,
                "internship_applications": internship_count,
                "job_applications": job_count,
                "is_placed": is_placed,
                "assessments_taken": AssessmentResult.objects.filter(student=student_user).count(),
            })

        return Response({
            "institution_name": request.user.institution_profile.institution_name,
            "count": len(results),
            "students": results,
        })


class InstitutionStudentDetailView(APIView):
    """Full profile for a single student, scoped so an institution can only
    ever view students that actually belong to it."""
    permission_classes = [IsInstitutionUser]

    def get(self, request, pk):
        try:
            profile = _institution_students(request.user).select_related('user').get(user_id=pk)
        except StudentProfile.DoesNotExist:
            raise NotFound("Student not found in your institution.")

        student_user = profile.user

        skills_qs = StudentSkill.objects.filter(student=student_user).select_related('skill').order_by('-score')
        skills = [{"skill": s.skill.name, "category": s.skill.category, "score": s.score} for s in skills_qs]

        assessments_qs = AssessmentResult.objects.filter(student=student_user).order_by('-taken_at')
        assessments = [{
            "taken_at": a.taken_at,
            "overall_score": a.overall_score,
            "strong_skills": a.strong_skills,
            "weak_skills": a.weak_skills,
            "total_questions": a.total_questions,
            "correct_answers": a.correct_answers,
        } for a in assessments_qs]

        applications_qs = Application.objects.filter(student=student_user).select_related(
            'internship__company', 'job__company').order_by('-applied_at')
        applications = []
        for app in applications_qs:
            target = app.internship or app.job
            applications.append({
                "id": app.id,
                "type": "internship" if app.internship_id else "job",
                "title": target.title if target else None,
                "company": target.company.company_name if target else None,
                "status": app.status,
                "applied_at": app.applied_at,
                "match_score": app.match_score,
            })

        projects = list(Project.objects.filter(student=student_user).values(
            "title", "description", "tech_stack", "link"))
        certifications = list(Certification.objects.filter(student=student_user).values(
            "title", "issuer", "date_earned", "verified"))

        readiness = services.compute_placement_readiness(student_user)

        return Response({
            "id": student_user.id,
            "username": student_user.username,
            "email": student_user.email,
            "full_name": profile.full_name,
            "college": profile.college,
            "degree": profile.degree,
            "branch": profile.branch,
            "year": profile.year,
            "cgpa": profile.cgpa,
            "location": profile.location,
            "bio": profile.bio,
            "career_interest": profile.career_interest,
            "avatar_color": profile.avatar_color,
            "resume_uploaded": profile.resume_uploaded,
            "profile_completion": profile.profile_completion,
            "skills": skills,
            "assessments": assessments,
            "applications": applications,
            "projects": projects,
            "certifications": certifications,
            "placement_readiness": readiness,
        })
