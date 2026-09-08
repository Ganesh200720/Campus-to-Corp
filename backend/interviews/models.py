from django.db import models
from accounts.models import User


class InterviewQuestion(models.Model):
    DIFFICULTY_CHOICES = [('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced')]
    role = models.CharField(max_length=150)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='intermediate')
    text = models.TextField()
    expected_keywords = models.JSONField(default=list)  # list of keywords used for rule-based scoring

    def __str__(self):
        return self.text[:60]


class MockInterview(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mock_interviews')
    role = models.CharField(max_length=150)
    difficulty = models.CharField(max_length=20)
    taken_at = models.DateTimeField(auto_now_add=True)
    overall_score = models.FloatField(default=0)
    strengths = models.JSONField(default=list)
    improvements = models.JSONField(default=list)
    suggested_topics = models.JSONField(default=list)


class InterviewAnswer(models.Model):
    interview = models.ForeignKey(MockInterview, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(InterviewQuestion, on_delete=models.CASCADE)
    answer_text = models.TextField(blank=True, default='')
    score = models.FloatField(default=0)
