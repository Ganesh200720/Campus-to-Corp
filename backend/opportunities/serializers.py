from rest_framework import serializers
from .models import Internship, Job, LearningProgram, Application
from skills.serializers import SkillSerializer


class InternshipSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    required_skills_detail = SkillSerializer(source='required_skills', many=True, read_only=True)
    match_percent = serializers.SerializerMethodField()

    class Meta:
        model = Internship
        fields = ['id', 'company', 'company_name', 'title', 'description', 'location', 'mode', 'duration',
                   'stipend', 'required_skills', 'required_skills_detail', 'min_cgpa', 'deadline', 'posted_at',
                   'active', 'match_percent']

    def get_match_percent(self, obj):
        return self.context.get('match_scores', {}).get(obj.id)


class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    required_skills_detail = SkillSerializer(source='required_skills', many=True, read_only=True)
    match_percent = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = ['id', 'company', 'company_name', 'title', 'description', 'location', 'experience_required',
                   'salary', 'required_skills', 'required_skills_detail', 'min_cgpa', 'deadline', 'posted_at',
                   'active', 'match_percent']

    def get_match_percent(self, obj):
        return self.context.get('match_scores', {}).get(obj.id)


class LearningProgramSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)

    class Meta:
        model = LearningProgram
        fields = '__all__'


class ApplicationSerializer(serializers.ModelSerializer):
    internship_title = serializers.CharField(source='internship.title', read_only=True, default=None)
    job_title = serializers.CharField(source='job.title', read_only=True, default=None)
    company_name = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = ['id', 'student', 'internship', 'job', 'internship_title', 'job_title', 'company_name',
                   'student_name', 'status', 'applied_at', 'match_score']

    def get_company_name(self, obj):
        if obj.internship:
            return obj.internship.company.company_name
        if obj.job:
            return obj.job.company.company_name
        return None

    def get_student_name(self, obj):
        if hasattr(obj.student, 'student_profile'):
            return obj.student.student_profile.full_name
        return obj.student.username
