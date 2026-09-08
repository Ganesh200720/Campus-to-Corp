from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, permissions
from .serializers import (MyTokenObtainPairSerializer, StudentProfileSerializer,
                           IndustryProfileSerializer, FacultyProfileSerializer, InstitutionProfileSerializer)
from .models import StudentProfile, IndustryProfile, FacultyProfile, InstitutionProfile


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {"id": user.id, "username": user.username, "email": user.email, "role": user.role}
        if user.role == 'student' and hasattr(user, 'student_profile'):
            data['profile'] = StudentProfileSerializer(user.student_profile).data
        elif user.role == 'industry' and hasattr(user, 'industry_profile'):
            data['profile'] = IndustryProfileSerializer(user.industry_profile).data
        elif user.role == 'faculty' and hasattr(user, 'faculty_profile'):
            data['profile'] = FacultyProfileSerializer(user.faculty_profile).data
        elif user.role == 'admin' and hasattr(user, 'institution_profile'):
            data['profile'] = InstitutionProfileSerializer(user.institution_profile).data
        return Response(data)


class StudentProfileDetail(generics.RetrieveUpdateAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.student_profile


class FacultyProfileDetail(generics.RetrieveUpdateAPIView):
    serializer_class = FacultyProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.faculty_profile


class IndustryProfileDetail(generics.RetrieveUpdateAPIView):
    serializer_class = IndustryProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.industry_profile
