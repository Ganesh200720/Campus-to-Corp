from rest_framework import serializers
from .models import (Skill, StudentSkill, AssessmentQuestion, AssessmentResult,
                      IndustryAssessment, IndustryAssessmentQuestion, IndustryAssessmentAttempt)


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'


class StudentSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    category = serializers.CharField(source='skill.category', read_only=True)

    class Meta:
        model = StudentSkill
        fields = ['id', 'skill', 'skill_name', 'category', 'score', 'updated_at']


class AssessmentQuestionSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)

    class Meta:
        model = AssessmentQuestion
        fields = ['id', 'skill', 'skill_name', 'text', 'option_a', 'option_b', 'option_c', 'option_d', 'difficulty']


class AssessmentResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentResult
        fields = '__all__'


# ---------------------------------------------------------------------------
# Industry assessments
# ---------------------------------------------------------------------------

class IndustryAssessmentQuestionSerializer(serializers.ModelSerializer):
    """Full serializer (industry side) — includes the correct answer."""
    class Meta:
        model = IndustryAssessmentQuestion
        fields = ['id', 'assessment', 'question_type', 'category', 'text',
                   'option_a', 'option_b', 'option_c', 'option_d', 'correct_option', 'marks', 'order']


class IndustryAssessmentQuestionSafeSerializer(serializers.ModelSerializer):
    """Student-facing serializer — never exposes correct_option."""
    class Meta:
        model = IndustryAssessmentQuestion
        fields = ['id', 'question_type', 'category', 'text', 'option_a', 'option_b', 'option_c', 'option_d', 'marks', 'order']


class IndustryAssessmentSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    question_count = serializers.SerializerMethodField()
    total_marks = serializers.SerializerMethodField()
    student_status = serializers.SerializerMethodField()
    linked_internships = serializers.SerializerMethodField()
    linked_jobs = serializers.SerializerMethodField()

    class Meta:
        model = IndustryAssessment
        fields = ['id', 'company', 'company_name', 'title', 'description', 'assessment_type',
                   'duration_minutes', 'passing_score', 'max_attempts', 'active', 'created_at',
                   'question_count', 'total_marks', 'student_status', 'linked_internships', 'linked_jobs']

    def get_question_count(self, obj):
        return obj.questions.count()

    def get_total_marks(self, obj):
        return sum(q.marks for q in obj.questions.all())

    def get_student_status(self, obj):
        request = self.context.get('request')
        if request and getattr(request.user, 'role', None) == 'student':
            from . import services
            return services.get_assessment_status(request.user, obj)
        return None

    def get_linked_internships(self, obj):
        return [{"id": i.id, "title": i.title} for i in obj.internships.all()]

    def get_linked_jobs(self, obj):
        return [{"id": j.id, "title": j.title} for j in obj.jobs.all()]


class IndustryAssessmentAttemptSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    assessment_title = serializers.CharField(source='assessment.title', read_only=True)
    company_name = serializers.CharField(source='assessment.company.company_name', read_only=True)

    class Meta:
        model = IndustryAssessmentAttempt
        fields = ['id', 'assessment', 'assessment_title', 'company_name', 'student', 'student_name',
                   'attempt_number', 'started_at', 'total_marks', 'scored_marks', 'percentage',
                   'passed', 'category_breakdown']

    def get_student_name(self, obj):
        if hasattr(obj.student, 'student_profile'):
            return obj.student.student_profile.full_name
        return obj.student.username
