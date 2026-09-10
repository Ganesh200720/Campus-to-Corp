from django.db import models
from accounts.models import User, IndustryProfile


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


# ---------------------------------------------------------------------------
# Industry-created assessments (Feature Group 1-4)
# These are distinct from the generic student AssessmentQuestion/Result above:
# an IndustryAssessment is authored by a specific company and can optionally be
# made a prerequisite for applying to that company's internships/jobs
# (see opportunities.models.Internship/Job.required_assessment).
# ---------------------------------------------------------------------------

class IndustryAssessment(models.Model):
    class AssessmentType(models.TextChoices):
        QUESTIONNAIRE = 'questionnaire', 'Questionnaire'
        APTITUDE = 'aptitude', 'Aptitude Test'

    company = models.ForeignKey(IndustryProfile, on_delete=models.CASCADE, related_name='assessments')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    assessment_type = models.CharField(max_length=20, choices=AssessmentType.choices, default=AssessmentType.QUESTIONNAIRE)
    duration_minutes = models.IntegerField(default=30)
    passing_score = models.FloatField(default=50)  # percentage required to "pass"
    max_attempts = models.IntegerField(default=1)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.company.company_name})"


class IndustryAssessmentQuestion(models.Model):
    class QuestionType(models.TextChoices):
        MCQ = 'mcq', 'Multiple Choice'
        TRUE_FALSE = 'true_false', 'True / False'

    class Category(models.TextChoices):
        TECHNICAL = 'technical', 'Technical'
        LOGICAL = 'logical', 'Logical Reasoning'
        QUANTITATIVE = 'quantitative', 'Quantitative Aptitude'
        VERBAL = 'verbal', 'Verbal Reasoning'
        NUMERICAL = 'numerical', 'Numerical Ability'
        PROBLEM_SOLVING = 'problem_solving', 'Problem Solving'

    assessment = models.ForeignKey(IndustryAssessment, on_delete=models.CASCADE, related_name='questions')
    question_type = models.CharField(max_length=20, choices=QuestionType.choices, default=QuestionType.MCQ)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.TECHNICAL)
    text = models.TextField()
    option_a = models.CharField(max_length=300, blank=True, default='')
    option_b = models.CharField(max_length=300, blank=True, default='')
    option_c = models.CharField(max_length=300, blank=True, default='')
    option_d = models.CharField(max_length=300, blank=True, default='')
    correct_option = models.CharField(max_length=1, choices=[('a', 'A'), ('b', 'B'), ('c', 'C'), ('d', 'D')])
    marks = models.FloatField(default=1)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.text[:60]


class IndustryAssessmentAttempt(models.Model):
    assessment = models.ForeignKey(IndustryAssessment, on_delete=models.CASCADE, related_name='attempts')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='industry_assessment_attempts')
    attempt_number = models.IntegerField(default=1)
    started_at = models.DateTimeField(auto_now_add=True)
    total_marks = models.FloatField(default=0)
    scored_marks = models.FloatField(default=0)
    percentage = models.FloatField(default=0)
    passed = models.BooleanField(default=False)
    category_breakdown = models.JSONField(default=dict)  # {category: {"correct": n, "total": n}}

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.student.username} -> {self.assessment.title}: {self.percentage}%"


class IndustryAssessmentAnswer(models.Model):
    attempt = models.ForeignKey(IndustryAssessmentAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(IndustryAssessmentQuestion, on_delete=models.CASCADE)
    selected_option = models.CharField(max_length=1, blank=True, default='')
    is_correct = models.BooleanField(default=False)
