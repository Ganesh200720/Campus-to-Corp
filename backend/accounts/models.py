from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'student', 'Student'
        INDUSTRY = 'industry', 'Industry'
        FACULTY = 'faculty', 'Faculty'
        ADMIN = 'admin', 'Institution'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STUDENT)
    email = models.EmailField(unique=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    full_name = models.CharField(max_length=150)
    college = models.CharField(max_length=200, default='')
    degree = models.CharField(max_length=100, default='')
    branch = models.CharField(max_length=100, default='')
    year = models.IntegerField(default=1)
    cgpa = models.FloatField(default=0.0)
    location = models.CharField(max_length=150, default='')
    bio = models.TextField(blank=True, default='')
    career_interest = models.CharField(max_length=150, blank=True, default='')
    avatar_color = models.CharField(max_length=20, default='#6366f1')
    resume_uploaded = models.BooleanField(default=False)
    profile_completion = models.IntegerField(default=40)

    def __str__(self):
        return self.full_name


class IndustryProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='industry_profile')
    company_name = models.CharField(max_length=200)
    industry_type = models.CharField(max_length=150, default='Technology')
    location = models.CharField(max_length=150, default='')
    website = models.URLField(blank=True, default='')
    about = models.TextField(blank=True, default='')
    logo_color = models.CharField(max_length=20, default='#0ea5e9')

    def __str__(self):
        return self.company_name


class FacultyProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='faculty_profile')
    full_name = models.CharField(max_length=150)
    college = models.CharField(max_length=200, default='')
    department = models.CharField(max_length=150, default='')
    designation = models.CharField(max_length=150, default='Assistant Professor')
    research_interest = models.CharField(max_length=200, blank=True, default='')

    def __str__(self):
        return self.full_name


class InstitutionProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='institution_profile')
    institution_name = models.CharField(max_length=200)
    location = models.CharField(max_length=150, default='')

    def __str__(self):
        return self.institution_name
