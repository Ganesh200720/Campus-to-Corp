from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg
from accounts.models import User, StudentProfile
from skills.models import AssessmentResult, StudentSkill
from opportunities.models import Application
from skills import services


def get_institution_students(request):
    if request.user.role != 'admin':
        return StudentProfile.objects.none()

    try:
        institution_name = request.user.institution_profile.institution_name
    except Exception:
        return StudentProfile.objects.none()

    return StudentProfile.objects.filter(
        college__iexact=institution_name
    )


class InstitutionOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        department = request.query_params.get('department')
        year = request.query_params.get('year')

        students = get_institution_students(request)

        if department:
            students = students.filter(branch__iexact=department)

        if year:
            students = students.filter(year=year)

        total_students = students.count()
        student_users = User.objects.filter(student_profile__in=students)

        assessed_ids = AssessmentResult.objects.filter(
            student__in=student_users
        ).values_list('student_id', flat=True).distinct()

        students_assessed = len(set(assessed_ids))

        avg_skill = StudentSkill.objects.filter(
            student__in=student_users
        ).aggregate(avg=Avg('score'))['avg'] or 0

        readiness_scores = []

        for u in student_users:
            r = services.compute_placement_readiness(u)
            readiness_scores.append(r['readiness_score'])

        avg_readiness = (
            round(sum(readiness_scores) / len(readiness_scores), 1)
            if readiness_scores else 0
        )

        internship_participants = Application.objects.filter(
            student__in=student_users,
            internship__isnull=False
        ).values_list('student_id', flat=True).distinct().count()

        internship_participation_rate = (
            round((internship_participants / total_students) * 100, 1)
            if total_students else 0
        )

        placed = Application.objects.filter(
            student__in=student_users,
            status='selected'
        ).values_list('student_id', flat=True).distinct().count()

        placement_rate = (
            round((placed / total_students) * 100, 1)
            if total_students else 0
        )

        top_skills = list(
            StudentSkill.objects.filter(
                student__in=student_users
            ).values('skill__name').annotate(
                avg_score=Avg('score')
            ).order_by('-avg_score')[:8]
        )

        top_skills = [
            {
                "skill": s['skill__name'],
                "avg_score": round(s['avg_score'], 1)
            }
            for s in top_skills
        ]

        demand = services.industry_skill_demand()

        student_skill_avg = {
            s['skill__name']: s['avg_score']
            for s in StudentSkill.objects.filter(
                student__in=student_users
            ).values('skill__name').annotate(
                avg_score=Avg('score')
            )
        }

        skill_gaps = []

        for d in demand[:8]:
            student_level = round(
                student_skill_avg.get(d['skill'], 0), 1
            )

            skill_gaps.append({
                "skill": d['skill'],
                "industry_demand": d['demand_percent'],
                "student_average": student_level,
                "gap": round(
                    max(d['demand_percent'] - student_level, 0), 1
                ),
            })

        skill_gaps.sort(key=lambda x: -x['gap'])

        dept_data = {}

        for u in student_users.select_related('student_profile'):
            branch = u.student_profile.branch or 'Unspecified'
            r = services.compute_placement_readiness(u)['readiness_score']

            dept_data.setdefault(branch, []).append(r)

        department_wise_readiness = [
            {
                "department": k,
                "avg_readiness": round(sum(v) / len(v), 1),
                "student_count": len(v)
            }
            for k, v in dept_data.items()
        ]

        return Response({
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


class InstitutionStudentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        students = get_institution_students(request)

        result = []

        for student in students.select_related('user'):
            user = student.user

            skills = list(
                StudentSkill.objects.filter(
                    student=user
                ).values(
                    'skill__name',
                    'score'
                ).order_by('-score')
            )

            internship_count = Application.objects.filter(
                student=user,
                internship__isnull=False
            ).count()

            placement_count = Application.objects.filter(
                student=user,
                status='selected'
            ).count()

            readiness = services.compute_placement_readiness(user)

            result.append({
                "id": user.id,
                "full_name": student.full_name,
                "email": user.email,
                "college": student.college,
                "degree": student.degree,
                "branch": student.branch,
                "year": student.year,
                "cgpa": student.cgpa,
                "location": student.location,
                "bio": student.bio,
                "career_interest": student.career_interest,
                "github_url": student.github_url,
                "linkedin_url": student.linkedin_url,
                "portfolio_url": student.portfolio_url,
                "profile_completion": student.profile_completion,
                "skills": [
                    {
                        "name": s["skill__name"],
                        "score": round(s["score"], 1)
                    }
                    for s in skills
                ],
                "internship_count": internship_count,
                "placement_count": placement_count,
                "placement_readiness": readiness["readiness_score"],
            })

        return Response(result)