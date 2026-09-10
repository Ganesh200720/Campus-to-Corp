from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Internship, Job, LearningProgram, Application
from .serializers import InternshipSerializer, JobSerializer, LearningProgramSerializer, ApplicationSerializer
from skills import services


def _student_cgpa(user):
    if hasattr(user, 'student_profile'):
        return user.student_profile.cgpa
    return 0


def _student_interest(user):
    if hasattr(user, 'student_profile'):
        return user.student_profile.career_interest or ''
    return ''


class InternshipListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Internship.objects.filter(active=True).select_related('company').prefetch_related('required_skills')
        search = request.query_params.get('search')
        mode = request.query_params.get('mode')
        location = request.query_params.get('location')
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(company__company_name__icontains=search))
        if mode:
            qs = qs.filter(mode=mode)
        if location:
            qs = qs.filter(location__icontains=location)

        match_scores = {}
        if request.user.role == 'student':
            cgpa = _student_cgpa(request.user)
            interest = _student_interest(request.user)
            for i in qs:
                skill_names = [s.name for s in i.required_skills.all()]
                m = services.compute_opportunity_match(request.user, skill_names, i.min_cgpa, cgpa, interest, i.title)
                match_scores[i.id] = m['match_percent']

        ordering = request.query_params.get('sort')
        items = list(qs)
        if request.user.role == 'student' and (ordering == 'match' or not ordering):
            items.sort(key=lambda x: -match_scores.get(x.id, 0))
        serializer = InternshipSerializer(items, many=True, context={'match_scores': match_scores})
        return Response(serializer.data)


class InternshipDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        internship = get_object_or_404(Internship, pk=pk)
        match_scores = {}
        explanation = None
        if request.user.role == 'student':
            cgpa = _student_cgpa(request.user)
            interest = _student_interest(request.user)
            skill_names = [s.name for s in internship.required_skills.all()]
            m = services.compute_opportunity_match(request.user, skill_names, internship.min_cgpa, cgpa, interest, internship.title)
            match_scores[internship.id] = m['match_percent']
            explanation = m
        data = InternshipSerializer(internship, context={'match_scores': match_scores}).data
        data['match_explanation'] = explanation
        return Response(data)


class JobListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Job.objects.filter(active=True).select_related('company').prefetch_related('required_skills')
        search = request.query_params.get('search')
        location = request.query_params.get('location')
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(company__company_name__icontains=search))
        if location:
            qs = qs.filter(location__icontains=location)

        match_scores = {}
        if request.user.role == 'student':
            cgpa = _student_cgpa(request.user)
            interest = _student_interest(request.user)
            for j in qs:
                skill_names = [s.name for s in j.required_skills.all()]
                m = services.compute_opportunity_match(request.user, skill_names, j.min_cgpa, cgpa, interest, j.title)
                match_scores[j.id] = m['match_percent']

        items = list(qs)
        if request.user.role == 'student':
            items.sort(key=lambda x: -match_scores.get(x.id, 0))
        serializer = JobSerializer(items, many=True, context={'match_scores': match_scores})
        return Response(serializer.data)


class JobDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        job = get_object_or_404(Job, pk=pk)
        match_scores = {}
        explanation = None
        if request.user.role == 'student':
            cgpa = _student_cgpa(request.user)
            interest = _student_interest(request.user)
            skill_names = [s.name for s in job.required_skills.all()]
            m = services.compute_opportunity_match(request.user, skill_names, job.min_cgpa, cgpa, interest, job.title)
            match_scores[job.id] = m['match_percent']
            explanation = m
        data = JobSerializer(job, context={'match_scores': match_scores}).data
        data['match_explanation'] = explanation
        return Response(data)


class ApplyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        internship_id = request.data.get('internship_id')
        job_id = request.data.get('job_id')
        cgpa = _student_cgpa(request.user)
        interest = _student_interest(request.user)

        if internship_id:
            internship = get_object_or_404(Internship, pk=internship_id)
            if Application.objects.filter(student=request.user, internship=internship).exists():
                return Response({"detail": "Already applied."}, status=400)
            skill_names = [s.name for s in internship.required_skills.all()]
            m = services.compute_opportunity_match(request.user, skill_names, internship.min_cgpa, cgpa, interest, internship.title)
            app = Application.objects.create(student=request.user, internship=internship, match_score=m['match_percent'])
        elif job_id:
            job = get_object_or_404(Job, pk=job_id)
            if Application.objects.filter(student=request.user, job=job).exists():
                return Response({"detail": "Already applied."}, status=400)
            skill_names = [s.name for s in job.required_skills.all()]
            m = services.compute_opportunity_match(request.user, skill_names, job.min_cgpa, cgpa, interest, job.title)
            app = Application.objects.create(student=request.user, job=job, match_score=m['match_percent'])
        else:
            return Response({"detail": "internship_id or job_id required."}, status=400)

        return Response(ApplicationSerializer(app).data, status=201)


class MyApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(student=self.request.user).select_related(
            'internship', 'internship__company', 'job', 'job__company').order_by('-applied_at')


class LearningProgramListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = LearningProgram.objects.select_related('skill').all()
        personalized = request.query_params.get('personalized')
        result = []
        if personalized and request.user.role == 'student':
            scores = services.get_student_skill_map(request.user)
            for p in qs:
                current = scores.get(p.skill.name, 0)
                if current < 60:
                    reason = f"{p.skill.name} proficiency is below the level required by most matched roles."
                    result.append({**LearningProgramSerializer(p).data, "reason": reason, "current_score": current})
            result.sort(key=lambda x: x['current_score'])
        else:
            result = LearningProgramSerializer(qs, many=True).data
        return Response(result)


# ---------------- Industry side ----------------

class MyInternshipsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Internship.objects.filter(company__user=request.user).prefetch_related('required_skills')
        return Response(InternshipSerializer(qs, many=True).data)

    def post(self, request):
        profile = request.user.industry_profile
        data = request.data
        internship = Internship.objects.create(
            company=profile, title=data['title'], description=data.get('description', ''),
            location=data.get('location', ''), mode=data.get('mode', 'hybrid'),
            duration=data.get('duration', '3 months'), stipend=data.get('stipend', 'Unpaid'),
            min_cgpa=data.get('min_cgpa', 6.0), deadline=data.get('deadline'),
        )
        skill_ids = data.get('required_skills', [])
        if skill_ids:
            internship.required_skills.set(skill_ids)
        return Response(InternshipSerializer(internship).data, status=201)


class MyJobsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Job.objects.filter(company__user=request.user).prefetch_related('required_skills')
        return Response(JobSerializer(qs, many=True).data)

    def post(self, request):
        profile = request.user.industry_profile
        data = request.data
        job = Job.objects.create(
            company=profile, title=data['title'], description=data.get('description', ''),
            location=data.get('location', ''), experience_required=data.get('experience_required', '0-1 years'),
            salary=data.get('salary', 'As per industry standards'), min_cgpa=data.get('min_cgpa', 6.0),
            deadline=data.get('deadline'),
        )
        skill_ids = data.get('required_skills', [])
        if skill_ids:
            job.required_skills.set(skill_ids)
        return Response(JobSerializer(job).data, status=201)


class IndustryApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(
            Q(internship__company__user=self.request.user) | Q(job__company__user=self.request.user)
        ).select_related('student', 'student__student_profile', 'internship', 'job').order_by('-applied_at')


class UpdateApplicationStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        app = get_object_or_404(Application, pk=pk)
        owner = app.internship.company.user if app.internship else app.job.company.user
        if owner != request.user:
            return Response({"detail": "Not authorized."}, status=403)
        status_val = request.data.get('status')
        if status_val not in dict(Application.STATUS_CHOICES):
            return Response({"detail": "Invalid status."}, status=400)
        app.status = status_val
        app.save()
        return Response(ApplicationSerializer(app).data)


class CandidateMatchesView(APIView):
    """Rank all students against a given internship or job's required skills."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        internship_id = request.query_params.get('internship_id')
        job_id = request.query_params.get('job_id')
        from accounts.models import User

        if internship_id:
            target = get_object_or_404(Internship, pk=internship_id)
            skill_names = [s.name for s in target.required_skills.all()]
            min_cgpa = target.min_cgpa
            role_hint = target.title
        elif job_id:
            target = get_object_or_404(Job, pk=job_id)
            skill_names = [s.name for s in target.required_skills.all()]
            min_cgpa = target.min_cgpa
            role_hint = target.title
        else:
            return Response({"detail": "internship_id or job_id required."}, status=400)

        students = User.objects.filter(role='student').select_related('student_profile')
        ranked = []

        for s in students:
            if not hasattr(s, 'student_profile'):
                continue

            profile = s.student_profile
            cgpa = profile.cgpa
            interest = profile.career_interest or ''
            m = services.compute_opportunity_match(
                s, skill_names, min_cgpa, cgpa, interest, role_hint
            )

            ranked.append({
                "student_id": s.id,
                "name": profile.full_name,
                "college": profile.college,
                "degree": profile.degree,
                "branch": profile.branch,
                "year": profile.year,
                "cgpa": cgpa,
                "location": profile.location,
                "bio": profile.bio,
                "career_interest": profile.career_interest,
                "resume_uploaded": profile.resume_uploaded,
                "profile_completion": profile.profile_completion,
                "skills": services.get_student_skill_map(s),
                "match_percent": m['match_percent'],
                "matched_skills": m['matched_skills'],
                "skill_gaps": m['skill_gaps'],
                "cgpa_eligible": m['cgpa_eligible'],
                "github_url": s.student_profile.github_url,
                "linkedin_url": s.student_profile.linkedin_url,
                "portfolio_url": s.student_profile.portfolio_url,
            })

        ranked.sort(key=lambda x: -x['match_percent'])
        return Response(ranked[:20])