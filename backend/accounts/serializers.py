from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, StudentProfile, IndustryProfile, FacultyProfile, InstitutionProfile


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['username'] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.role
        data['username'] = self.user.username
        data['user_id'] = self.user.id
        name = self.user.username
        if self.user.role == 'student' and hasattr(self.user, 'student_profile'):
            name = self.user.student_profile.full_name
        elif self.user.role == 'industry' and hasattr(self.user, 'industry_profile'):
            name = self.user.industry_profile.company_name
        elif self.user.role == 'faculty' and hasattr(self.user, 'faculty_profile'):
            name = self.user.faculty_profile.full_name
        elif self.user.role == 'admin' and hasattr(self.user, 'institution_profile'):
            name = self.user.institution_profile.institution_name
        data['display_name'] = name
        return data


class StudentProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = StudentProfile
        fields = '__all__'


class IndustryProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = IndustryProfile
        fields = '__all__'


class FacultyProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = FacultyProfile
        fields = '__all__'


class InstitutionProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = InstitutionProfile
        fields = '__all__'


class SignupSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password', 'full_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({'username': 'Username already exists.'})
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({'email': 'Email already exists.'})
        return attrs

    def create(self, validated_data):
        full_name = validated_data.pop('full_name')
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            password=password,
            role='student',
            **validated_data
        )
        StudentProfile.objects.create(
            user=user,
            full_name=full_name
        )
        return user