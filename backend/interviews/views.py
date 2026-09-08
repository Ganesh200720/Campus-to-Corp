import random
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from django.shortcuts import get_object_or_404

from .models import InterviewQuestion, MockInterview, InterviewAnswer
from .serializers import InterviewQuestionSerializer, MockInterviewSerializer


class InterviewRolesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        roles = list(InterviewQuestion.objects.values_list('role', flat=True).distinct())
        return Response(roles)


class InterviewQuestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = request.query_params.get('role')
        difficulty = request.query_params.get('difficulty', 'intermediate')
        qs = InterviewQuestion.objects.filter(role=role, difficulty=difficulty)
        questions = list(qs)
        random.shuffle(questions)
        questions = questions[:5]
        return Response(InterviewQuestionSerializer(questions, many=True).data)


def _score_answer(answer_text, expected_keywords):
    if not answer_text or not answer_text.strip():
        return 0
    text = answer_text.lower()
    hits = sum(1 for kw in expected_keywords if kw.lower() in text)
    keyword_score = (hits / len(expected_keywords)) * 70 if expected_keywords else 40
    length_score = min(len(answer_text.split()) / 40, 1) * 30
    return round(min(keyword_score + length_score, 100), 1)


class SubmitInterviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        role = request.data.get('role')
        difficulty = request.data.get('difficulty', 'intermediate')
        answers = request.data.get('answers', [])  # [{question_id, answer_text}]

        interview = MockInterview.objects.create(student=request.user, role=role, difficulty=difficulty)
        scores = []
        weak_topics = []
        strong_topics = []
        for a in answers:
            q = get_object_or_404(InterviewQuestion, id=a.get('question_id'))
            score = _score_answer(a.get('answer_text', ''), q.expected_keywords)
            InterviewAnswer.objects.create(interview=interview, question=q, answer_text=a.get('answer_text', ''), score=score)
            scores.append(score)
            if score < 50:
                weak_topics.append(q.text[:60])
            elif score >= 75:
                strong_topics.append(q.text[:60])

        overall = round(sum(scores) / len(scores), 1) if scores else 0
        interview.overall_score = overall
        interview.strengths = strong_topics[:3] or ["Clear structure in responses"]
        interview.improvements = weak_topics[:3] or ["Add more specific examples to strengthen answers"]
        interview.suggested_topics = [q.text[:60] for q in InterviewQuestion.objects.filter(role=role).exclude(
            id__in=[a.get('question_id') for a in answers])[:3]]
        interview.save()

        return Response(MockInterviewSerializer(interview).data, status=201)


class InterviewHistoryView(generics.ListAPIView):
    serializer_class = MockInterviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MockInterview.objects.filter(student=self.request.user).order_by('-taken_at')
