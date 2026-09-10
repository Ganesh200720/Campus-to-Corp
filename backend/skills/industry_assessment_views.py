from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import IndustryAssessment, IndustryAssessmentQuestion, IndustryAssessmentAttempt, IndustryAssessmentAnswer
from .serializers import (IndustryAssessmentSerializer, IndustryAssessmentQuestionSerializer,
                           IndustryAssessmentQuestionSafeSerializer, IndustryAssessmentAttemptSerializer)
from . import services


def _is_owner(request, assessment):
    return hasattr(request.user, 'industry_profile') and assessment.company_id == request.user.industry_profile.id


# ============================================================
# INDUSTRY SIDE — create & manage assessments
# ============================================================

class IndustryAssessmentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'industry':
            return Response({"detail": "Industry access only."}, status=403)
        qs = IndustryAssessment.objects.filter(company=request.user.industry_profile)
        return Response(IndustryAssessmentSerializer(qs, many=True, context={'request': request}).data)

    def post(self, request):
        if request.user.role != 'industry':
            return Response({"detail": "Industry access only."}, status=403)
        data = request.data
        if not data.get('title'):
            return Response({"detail": "Title is required."}, status=400)
        assessment = IndustryAssessment.objects.create(
            company=request.user.industry_profile,
            title=data['title'],
            description=data.get('description', ''),
            assessment_type=data.get('assessment_type', 'questionnaire'),
            duration_minutes=data.get('duration_minutes', 30),
            passing_score=data.get('passing_score', 50),
            max_attempts=data.get('max_attempts', 1),
            active=data.get('active', True),
        )
        return Response(IndustryAssessmentSerializer(assessment, context={'request': request}).data, status=201)


class IndustryAssessmentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        assessment = get_object_or_404(IndustryAssessment, pk=pk)
        if request.user.role == 'industry' and not _is_owner(request, assessment):
            return Response({"detail": "Not authorized."}, status=403)
        data = IndustryAssessmentSerializer(assessment, context={'request': request}).data
        if request.user.role == 'industry':
            data['questions'] = IndustryAssessmentQuestionSerializer(assessment.questions.all(), many=True).data
        return Response(data)

    def patch(self, request, pk):
        assessment = get_object_or_404(IndustryAssessment, pk=pk)
        if not _is_owner(request, assessment):
            return Response({"detail": "Not authorized."}, status=403)
        data = request.data
        for field in ['title', 'description', 'assessment_type', 'duration_minutes',
                       'passing_score', 'max_attempts', 'active']:
            if field in data:
                setattr(assessment, field, data[field])
        assessment.save()
        return Response(IndustryAssessmentSerializer(assessment, context={'request': request}).data)

    def delete(self, request, pk):
        assessment = get_object_or_404(IndustryAssessment, pk=pk)
        if not _is_owner(request, assessment):
            return Response({"detail": "Not authorized."}, status=403)
        assessment.delete()
        return Response(status=204)


class IndustryAssessmentQuestionListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        assessment = get_object_or_404(IndustryAssessment, pk=pk)
        if not _is_owner(request, assessment):
            return Response({"detail": "Not authorized."}, status=403)
        return Response(IndustryAssessmentQuestionSerializer(assessment.questions.all(), many=True).data)

    def post(self, request, pk):
        assessment = get_object_or_404(IndustryAssessment, pk=pk)
        if not _is_owner(request, assessment):
            return Response({"detail": "Not authorized."}, status=403)
        data = request.data
        if not data.get('text') or not data.get('correct_option'):
            return Response({"detail": "Question text and correct_option are required."}, status=400)
        question = IndustryAssessmentQuestion.objects.create(
            assessment=assessment,
            question_type=data.get('question_type', 'mcq'),
            category=data.get('category', 'technical'),
            text=data['text'],
            option_a=data.get('option_a', ''), option_b=data.get('option_b', ''),
            option_c=data.get('option_c', ''), option_d=data.get('option_d', ''),
            correct_option=data['correct_option'],
            marks=data.get('marks', 1),
            order=assessment.questions.count(),
        )
        return Response(IndustryAssessmentQuestionSerializer(question).data, status=201)


class IndustryAssessmentQuestionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk, qid):
        assessment = get_object_or_404(IndustryAssessment, pk=pk)
        if not _is_owner(request, assessment):
            return Response({"detail": "Not authorized."}, status=403)
        question = get_object_or_404(IndustryAssessmentQuestion, pk=qid, assessment=assessment)
        data = request.data
        for field in ['question_type', 'category', 'text', 'option_a', 'option_b', 'option_c',
                       'option_d', 'correct_option', 'marks', 'order']:
            if field in data:
                setattr(question, field, data[field])
        question.save()
        return Response(IndustryAssessmentQuestionSerializer(question).data)

    def delete(self, request, pk, qid):
        assessment = get_object_or_404(IndustryAssessment, pk=pk)
        if not _is_owner(request, assessment):
            return Response({"detail": "Not authorized."}, status=403)
        question = get_object_or_404(IndustryAssessmentQuestion, pk=qid, assessment=assessment)
        question.delete()
        return Response(status=204)


class IndustryAssessmentAttemptsView(APIView):
    """Industry: view student participation/results for one of its assessments."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        assessment = get_object_or_404(IndustryAssessment, pk=pk)
        if not _is_owner(request, assessment):
            return Response({"detail": "Not authorized."}, status=403)
        attempts = IndustryAssessmentAttempt.objects.filter(assessment=assessment).select_related(
            'student', 'student__student_profile').order_by('-started_at')
        return Response(IndustryAssessmentAttemptSerializer(attempts, many=True).data)


# ============================================================
# STUDENT SIDE — discover, take, and track company assessments
# ============================================================

class CompanyAssessmentListView(APIView):
    """All active company assessments, each annotated with this student's status."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = IndustryAssessment.objects.filter(active=True).select_related('company')
        return Response(IndustryAssessmentSerializer(qs, many=True, context={'request': request}).data)


class CompanyAssessmentQuestionsView(APIView):
    """Returns the question set (answers hidden) for a student about to attempt an assessment."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        assessment = get_object_or_404(IndustryAssessment, pk=pk, active=True)
        status_info = services.get_assessment_status(request.user, assessment)
        if status_info['attempts_used'] >= assessment.max_attempts:
            return Response({"detail": "You have used all allowed attempts for this assessment.",
                              "code": "MAX_ATTEMPTS_REACHED"}, status=400)
        questions = assessment.questions.all()
        return Response({
            "assessment": IndustryAssessmentSerializer(assessment, context={'request': request}).data,
            "questions": IndustryAssessmentQuestionSafeSerializer(questions, many=True).data,
        })


class CompanyAssessmentSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        assessment = get_object_or_404(IndustryAssessment, pk=pk, active=True)
        status_info = services.get_assessment_status(request.user, assessment)
        if status_info['attempts_used'] >= assessment.max_attempts:
            return Response({"detail": "You have used all allowed attempts for this assessment.",
                              "code": "MAX_ATTEMPTS_REACHED"}, status=400)

        answers = request.data.get('answers', [])  # [{question_id, selected_option}]
        if not answers:
            return Response({"detail": "No answers submitted."}, status=400)

        attempt = IndustryAssessmentAttempt.objects.create(
            assessment=assessment, student=request.user,
            attempt_number=status_info['attempts_used'] + 1,
        )
        total_marks = 0
        scored_marks = 0
        category_totals = {}

        for ans in answers:
            question = get_object_or_404(IndustryAssessmentQuestion, id=ans.get('question_id'), assessment=assessment)
            selected = ans.get('selected_option', '')
            is_correct = selected == question.correct_option
            IndustryAssessmentAnswer.objects.create(
                attempt=attempt, question=question, selected_option=selected, is_correct=is_correct)
            total_marks += question.marks
            if is_correct:
                scored_marks += question.marks
            bucket = category_totals.setdefault(question.category, {"correct": 0, "total": 0})
            bucket['total'] += 1
            if is_correct:
                bucket['correct'] += 1

        percentage = round((scored_marks / total_marks) * 100, 1) if total_marks else 0
        attempt.total_marks = total_marks
        attempt.scored_marks = scored_marks
        attempt.percentage = percentage
        attempt.passed = percentage >= assessment.passing_score
        attempt.category_breakdown = category_totals
        attempt.save()

        return Response(IndustryAssessmentAttemptSerializer(attempt).data, status=201)


class MyCompanyAssessmentResultsView(APIView):
    """Student's own results across every company assessment they've attempted."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        attempts = IndustryAssessmentAttempt.objects.filter(student=request.user).select_related(
            'assessment', 'assessment__company').order_by('-started_at')
        return Response(IndustryAssessmentAttemptSerializer(attempts, many=True).data)
