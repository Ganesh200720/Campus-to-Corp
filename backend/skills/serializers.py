from rest_framework import serializers
from .models import Skill, StudentSkill, AssessmentQuestion, AssessmentResult


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
