from rest_framework import serializers
from .models import InterviewQuestion, MockInterview, InterviewAnswer


class InterviewQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewQuestion
        fields = ['id', 'role', 'difficulty', 'text']


class MockInterviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = MockInterview
        fields = '__all__'
