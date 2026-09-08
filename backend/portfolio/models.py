from django.db import models
from accounts.models import User


class Project(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    tech_stack = models.CharField(max_length=300, blank=True, default='')
    link = models.URLField(blank=True, default='')

    def __str__(self):
        return self.title


class Certification(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certifications')
    title = models.CharField(max_length=200)
    issuer = models.CharField(max_length=150)
    date_earned = models.DateField()
    verified = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class Achievement(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    date_earned = models.DateField()

    def __str__(self):
        return self.title
