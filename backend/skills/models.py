from django.db import models
from accounts.models import User


class Skill(models.Model):
    class Category(models.TextChoices):
        TECHNICAL = 'technical', 'Technical'
        SOFT = 'soft', 'Soft Skill'

    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.TECHNICAL)

    def __str__(self):
        return self.name


class StudentSkill(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skill_scores')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    score = models.FloatField(default=0)  # 0-100
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'skill')

    def __str__(self):
        return f"{self.student.username} - {self.skill.name}: {self.score}"


class AssessmentQuestion(models.Model):
    DIFFICULTY_CHOICES = [('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')]
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    option_a = models.CharField(max_length=300)
    option_b = models.CharField(max_length=300)
    option_c = models.CharField(max_length=300)
    option_d = models.CharField(max_length=300)
    correct_option = models.CharField(max_length=1, choices=[('a', 'A'), ('b', 'B'), ('c', 'C'), ('d', 'D')])
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')

    def __str__(self):
        return self.text[:60]


class AssessmentResult(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assessment_results')
    taken_at = models.DateTimeField(auto_now_add=True)
    overall_score = models.FloatField(default=0)
    category_scores = models.JSONField(default=dict)  # {skill_name: score}
    strong_skills = models.JSONField(default=list)
    weak_skills = models.JSONField(default=list)
    total_questions = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.student.username} - {self.overall_score}"


class AssessmentAnswer(models.Model):
    result = models.ForeignKey(AssessmentResult, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(AssessmentQuestion, on_delete=models.CASCADE)
    selected_option = models.CharField(max_length=1)
    is_correct = models.BooleanField(default=False)
