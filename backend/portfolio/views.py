from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Project, Certification, Achievement
from .serializers import ProjectSerializer, CertificationSerializer, AchievementSerializer
from skills import services


class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


class CertificationListCreateView(generics.ListCreateAPIView):
    serializer_class = CertificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Certification.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


class AchievementListCreateView(generics.ListCreateAPIView):
    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Achievement.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


class PortfolioView(APIView):
    """Combined public-style portfolio view for a student (self or by id for recruiters)."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, student_id=None):
        from accounts.models import User
        target = request.user if not student_id else User.objects.get(pk=student_id)
        profile = getattr(target, 'student_profile', None)
        readiness = services.compute_placement_readiness(target)
        skills = services.get_student_skill_map(target)
        data = {
            "profile": {
                "full_name": profile.full_name if profile else target.username,
                "college": profile.college if profile else '',
                "degree": profile.degree if profile else '',
                "branch": profile.branch if profile else '',
                "year": profile.year if profile else None,
                "cgpa": profile.cgpa if profile else None,
                "bio": profile.bio if profile else '',
                "career_interest": profile.career_interest if profile else '',
            },
            "skills": skills,
            "projects": ProjectSerializer(Project.objects.filter(student=target), many=True).data,
            "certifications": CertificationSerializer(Certification.objects.filter(student=target), many=True).data,
            "achievements": AchievementSerializer(Achievement.objects.filter(student=target), many=True).data,
            "placement_readiness": readiness,
        }
        return Response(data)
