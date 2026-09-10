from django.db import models
from accounts.models import User, IndustryProfile
from skills.models import Skill


class RequiredSkill(models.Model):
    """Generic through model linking an opportunity (internship/job/role) to a required skill with weight."""
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    weight = models.FloatField(default=1.0)  # importance 0-1
    min_score = models.FloatField(default=50)  # required proficiency 0-100

    class Meta:
        abstract = True


class Internship(models.Model):
    MODE_CHOICES = [('remote', 'Remote'), ('hybrid', 'Hybrid'), ('onsite', 'On-site')]
    company = models.ForeignKey(IndustryProfile, on_delete=models.CASCADE, related_name='internships')
    title = models.CharField(max_length=200)
    description = models.TextField()
    location = models.CharField(max_length=150)
    mode = models.CharField(max_length=10, choices=MODE_CHOICES, default='hybrid')
    duration = models.CharField(max_length=50, default='3 months')
    stipend = models.CharField(max_length=50, default='Unpaid')
    required_skills = models.ManyToManyField(Skill, related_name='internships', blank=True)
    min_cgpa = models.FloatField(default=6.0)
    deadline = models.DateField()
    posted_at = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True)
    required_assessment = models.ForeignKey(
        'skills.IndustryAssessment', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='internships',
        help_text="If set, a student must pass this assessment before they can apply.")

    def __str__(self):
        return f"{self.title} @ {self.company.company_name}"


class Job(models.Model):
    company = models.ForeignKey(IndustryProfile, on_delete=models.CASCADE, related_name='jobs')
    title = models.CharField(max_length=200)
    description = models.TextField()
    location = models.CharField(max_length=150)
    experience_required = models.CharField(max_length=50, default='0-1 years')
    salary = models.CharField(max_length=50, default='As per industry standards')
    required_skills = models.ManyToManyField(Skill, related_name='jobs', blank=True)
    min_cgpa = models.FloatField(default=6.0)
    deadline = models.DateField()
    posted_at = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True)
    required_assessment = models.ForeignKey(
        'skills.IndustryAssessment', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='jobs',
        help_text="If set, a student must pass this assessment before they can apply.")

    def __str__(self):
        return f"{self.title} @ {self.company.company_name}"


class LearningProgram(models.Model):
    TYPE_CHOICES = [('course', 'Course'), ('certification', 'Certification'), ('workshop', 'Workshop'), ('mentorship', 'Mentorship')]
    title = models.CharField(max_length=200)
    provider = models.CharField(max_length=150)
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='learning_programs')
    description = models.TextField(blank=True, default='')
    duration = models.CharField(max_length=50, default='4 weeks')
    program_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='course')

    def __str__(self):
        return self.title


class Application(models.Model):
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('under_review', 'Under Review'),
        ('shortlisted', 'Shortlisted'),
        ('interview', 'Interview'),
        ('selected', 'Selected'),
        ('rejected', 'Rejected'),
    ]
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    internship = models.ForeignKey(Internship, on_delete=models.CASCADE, null=True, blank=True, related_name='applications')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, null=True, blank=True, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    applied_at = models.DateTimeField(auto_now_add=True)
    match_score = models.FloatField(default=0)

    def __str__(self):
        target = self.internship or self.job
        return f"{self.student.username} -> {target}"
