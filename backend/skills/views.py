import random
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from django.shortcuts import get_object_or_404

from .models import Skill, StudentSkill, AssessmentQuestion, AssessmentResult, AssessmentAnswer
from .serializers import (SkillSerializer, StudentSkillSerializer, AssessmentQuestionSerializer,
                           AssessmentResultSerializer)
from . import services


class SkillListView(generics.ListAPIView):
    queryset = Skill.objects.all().order_by('category', 'name')
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]


class MySkillScoresView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        scores = StudentSkill.objects.filter(student=request.user).select_related('skill')
        return Response(StudentSkillSerializer(scores, many=True).data)


class AssessmentQuestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        all_qs = list(AssessmentQuestion.objects.select_related('skill').all())
        random.shuffle(all_qs)
        chosen = all_qs[:20] if len(all_qs) > 20 else all_qs
        return Response(AssessmentQuestionSerializer(chosen, many=True).data)


class AssessmentSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        answers = request.data.get('answers', [])  # [{question_id, selected_option}]
        if not answers:
            return Response({"detail": "No answers submitted."}, status=400)

        result = AssessmentResult.objects.create(student=request.user, total_questions=len(answers))
        skill_totals = {}  # skill_name -> [correct, total]
        correct_count = 0

        for ans in answers:
            q = get_object_or_404(AssessmentQuestion, id=ans.get('question_id'))
            selected = ans.get('selected_option', '')
            is_correct = selected == q.correct_option
            if is_correct:
                correct_count += 1
            AssessmentAnswer.objects.create(result=result, question=q, selected_option=selected, is_correct=is_correct)
            bucket = skill_totals.setdefault(q.skill.name, [0, 0])
            bucket[1] += 1
            if is_correct:
                bucket[0] += 1

        category_scores = {}
        for skill_name, (c, t) in skill_totals.items():
            pct = round((c / t) * 100, 1) if t else 0
            category_scores[skill_name] = pct
            skill_obj, _ = Skill.objects.get_or_create(name=skill_name, defaults={'category': 'technical'})
            existing, created = StudentSkill.objects.get_or_create(student=request.user, skill=skill_obj, defaults={'score': pct})
            if not created:
                # Blend new result with existing score (weighted average favouring latest attempt)
                existing.score = round(existing.score * 0.4 + pct * 0.6, 1)
                existing.save()

        overall = round((correct_count / len(answers)) * 100, 1) if answers else 0
        strong = [k for k, v in category_scores.items() if v >= 70]
        weak = [k for k, v in category_scores.items() if v < 50]

        result.overall_score = overall
        result.category_scores = category_scores
        result.strong_skills = strong
        result.weak_skills = weak
        result.correct_answers = correct_count
        result.save()

        return Response(AssessmentResultSerializer(result).data, status=201)


class AssessmentHistoryView(generics.ListAPIView):
    serializer_class = AssessmentResultSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AssessmentResult.objects.filter(student=self.request.user).order_by('-taken_at')


class SkillGapView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, role_name):
        role_name = role_name.replace('-', ' ')
        matching_role = next((r for r in services.ROLE_PROFILES if r.lower() == role_name.lower()), None)
        if not matching_role:
            return Response({"detail": "Unknown role"}, status=404)
        gap = services.compute_skill_gap(request.user, matching_role)
        return Response({"role": matching_role, "gap_analysis": gap})


class RoleRecommendationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(services.recommend_roles(request.user))


class PlacementReadinessView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(services.compute_placement_readiness(request.user))


class RoleListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(list(services.ROLE_PROFILES.keys()))


class IndustryDemandView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(services.industry_skill_demand())
