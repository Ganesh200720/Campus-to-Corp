from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import (
    Skill,
    SkillModule,
    SkillTopic,
    StudentSkill,
    StudentTopicProgress,
    StudentModuleProgress,
    AssessmentQuestion,
    AssessmentResult,
    AssessmentAnswer,
)
from .serializers import (
    SkillSerializer,
    StudentSkillSerializer,
    AssessmentQuestionSerializer,
    AssessmentResultSerializer,
)
from . import services


class SkillListView(generics.ListAPIView):
    queryset = Skill.objects.all().order_by('category', 'name')
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]


class MySkillScoresView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        scores = (
            StudentSkill.objects
            .filter(student=request.user)
            .select_related('skill')
        )

        return Response(
            StudentSkillSerializer(scores, many=True).data
        )


# ------------------------------------------------------------------
# SKILL ASSESSMENT HIERARCHY
# ------------------------------------------------------------------

class AssessmentStructureView(APIView):
    """
    Returns the complete Skill -> Module -> Topic hierarchy.

    Each topic also contains the current student's progress.
    Each module contains module-level progress.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        skills = (
            Skill.objects
            .prefetch_related(
                'modules__topics'
            )
            .all()
            .order_by('category', 'name')
        )

        topic_progress = {
            progress.topic_id: progress
            for progress in StudentTopicProgress.objects.filter(
                student=request.user
            )
        }

        module_progress = {
            progress.module_id: progress
            for progress in StudentModuleProgress.objects.filter(
                student=request.user
            )
        }

        result = []

        for skill in skills:
            modules_data = []

            for module in skill.modules.all():
                module_prog = module_progress.get(module.id)

                topics_data = []

                for topic in module.topics.all():
                    topic_prog = topic_progress.get(topic.id)

                    question_count = AssessmentQuestion.objects.filter(
                        topic=topic
                    ).count()

                    topics_data.append({
                        "id": topic.id,
                        "title": topic.title,
                        "description": topic.description,
                        "order": topic.order,
                        "question_count": question_count,
                        "completed": (
                            topic_prog.completed
                            if topic_prog else False
                        ),
                        "score": (
                            topic_prog.score
                            if topic_prog else None
                        ),
                        "attempts": (
                            topic_prog.attempts
                            if topic_prog else 0
                        ),
                    })

                modules_data.append({
                    "id": module.id,
                    "title": module.title,
                    "description": module.description,
                    "order": module.order,
                    "completed": (
                        module_prog.completed
                        if module_prog else False
                    ),
                    "score": (
                        module_prog.score
                        if module_prog else None
                    ),
                    "attempts": (
                        module_prog.attempts
                        if module_prog else 0
                    ),
                    "topics": topics_data,
                })

            total_topics = sum(
                len(module["topics"])
                for module in modules_data
            )

            completed_topics = sum(
                1
                for module in modules_data
                for topic in module["topics"]
                if topic["completed"]
            )

            total_modules = len(modules_data)

            completed_modules = sum(
                1
                for module in modules_data
                if module["completed"]
            )

            total_questions = AssessmentQuestion.objects.filter(
                skill=skill
            ).count()

            result.append({
                "id": skill.id,
                "name": skill.name,
                "category": skill.category,
                "module_count": total_modules,
                "completed_modules": completed_modules,
                "total_topics": total_topics,
                "completed_topics": completed_topics,
                "total_questions": total_questions,
                "progress_percentage": (
                    round(
                        completed_topics / total_topics * 100,
                        1
                    )
                    if total_topics
                    else 0
                ),
                "modules": modules_data,
            })

        return Response(result)


# ------------------------------------------------------------------
# TOPIC ASSESSMENT
# ------------------------------------------------------------------

class TopicAssessmentQuestionsView(APIView):
    """
    Returns questions belonging only to one topic.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, topic_id):
        topic = get_object_or_404(
            SkillTopic.objects.select_related('module__skill'),
            id=topic_id,
        )

        questions = (
            AssessmentQuestion.objects
            .filter(topic=topic)
            .select_related('skill', 'topic')
            .order_by('id')
        )

        return Response({
            "assessment_type": "topic",
            "topic": {
                "id": topic.id,
                "title": topic.title,
                "description": topic.description,
            },
            "module": {
                "id": topic.module.id,
                "title": topic.module.title,
            },
            "skill": {
                "id": topic.module.skill.id,
                "name": topic.module.skill.name,
            },
            "questions": AssessmentQuestionSerializer(
                questions,
                many=True
            ).data,
        })


# ------------------------------------------------------------------
# MODULE ASSESSMENT
# ------------------------------------------------------------------

class ModuleAssessmentQuestionsView(APIView):
    """
    Returns all questions belonging to topics inside one module.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, module_id):
        module = get_object_or_404(
            SkillModule.objects.select_related('skill'),
            id=module_id,
        )

        questions = (
            AssessmentQuestion.objects
            .filter(topic__module=module)
            .select_related('skill', 'topic')
            .order_by('topic__order', 'id')
        )

        return Response({
            "assessment_type": "module",
            "module": {
                "id": module.id,
                "title": module.title,
                "description": module.description,
            },
            "skill": {
                "id": module.skill.id,
                "name": module.skill.name,
            },
            "questions": AssessmentQuestionSerializer(
                questions,
                many=True
            ).data,
        })


# ------------------------------------------------------------------
# FINAL SKILL ASSESSMENT
# ------------------------------------------------------------------

class SkillAssessmentQuestionsView(APIView):
    """
    Returns all questions belonging to a skill.

    This is the final assessment for the skill.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, skill_id):
        skill = get_object_or_404(Skill, id=skill_id)

        questions = (
            AssessmentQuestion.objects
            .filter(skill=skill)
            .select_related('skill', 'topic')
            .order_by(
                'topic__module__order',
                'topic__order',
                'id'
            )
        )

        return Response({
            "assessment_type": "skill",
            "skill": {
                "id": skill.id,
                "name": skill.name,
                "category": skill.category,
            },
            "questions": AssessmentQuestionSerializer(
                questions,
                many=True
            ).data,
        })


# ------------------------------------------------------------------
# GENERIC SUBMISSION LOGIC
# ------------------------------------------------------------------

class BaseAssessmentSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    assessment_type = None

    def calculate_result(self, request, questions, answers):
        if not answers:
            return None, Response(
                {"detail": "No answers submitted."},
                status=400
            )

        question_map = {
            question.id: question
            for question in questions
        }

        correct_count = 0
        valid_answers = []

        for answer in answers:
            question_id = answer.get("question_id")

            if not question_id:
                continue

            question = question_map.get(int(question_id))

            if not question:
                continue

            selected = answer.get(
                "selected_option",
                ""
            )

            is_correct = (
                selected == question.correct_option
            )

            if is_correct:
                correct_count += 1

            valid_answers.append({
                "question": question,
                "selected_option": selected,
                "is_correct": is_correct,
            })

        if not valid_answers:
            return None, Response(
                {"detail": "No valid answers submitted."},
                status=400
            )

        total_questions = len(valid_answers)

        overall = round(
            (correct_count / total_questions) * 100,
            1
        )

        result = AssessmentResult.objects.create(
            student=request.user,
            total_questions=total_questions,
            correct_answers=correct_count,
            overall_score=overall,
        )

        skill_totals = {}

        for answer in valid_answers:
            question = answer["question"]

            AssessmentAnswer.objects.create(
                result=result,
                question=question,
                selected_option=answer["selected_option"],
                is_correct=answer["is_correct"],
            )

            bucket = skill_totals.setdefault(
                question.skill.name,
                [0, 0]
            )

            bucket[1] += 1

            if answer["is_correct"]:
                bucket[0] += 1

        category_scores = {}

        for skill_name, (correct, total) in skill_totals.items():
            category_scores[skill_name] = round(
                (correct / total) * 100,
                1
            )

        strong_skills = [
            name
            for name, score in category_scores.items()
            if score >= 70
        ]

        weak_skills = [
            name
            for name, score in category_scores.items()
            if score < 50
        ]

        result.category_scores = category_scores
        result.strong_skills = strong_skills
        result.weak_skills = weak_skills
        result.save()

        return result, None


# ------------------------------------------------------------------
# TOPIC SUBMISSION
# ------------------------------------------------------------------

class TopicAssessmentSubmitView(BaseAssessmentSubmitView):
    assessment_type = "topic"

    def post(self, request, topic_id):
        topic = get_object_or_404(
            SkillTopic.objects.select_related('module__skill'),
            id=topic_id
        )

        questions = list(
            AssessmentQuestion.objects.filter(
                topic=topic
            )
        )

        result, error = self.calculate_result(
            request,
            questions,
            request.data.get("answers", [])
        )

        if error:
            return error

        score = result.overall_score

        progress, created = StudentTopicProgress.objects.get_or_create(
            student=request.user,
            topic=topic,
        )

        progress.completed = True
        progress.score = score
        progress.attempts += 1
        progress.last_attempt_at = timezone.now()
        progress.save()

        self._update_module_progress(
            request.user,
            topic.module
        )

        self._update_skill_score(
            request.user,
            topic.module.skill
        )

        return Response({
            "assessment_type": "topic",
            "topic_id": topic.id,
            "topic_title": topic.title,
            "score": score,
            "correct_answers": result.correct_answers,
            "total_questions": result.total_questions,
            "result": AssessmentResultSerializer(result).data,
        }, status=201)

    def _update_module_progress(self, student, module):
        topics = list(
            SkillTopic.objects.filter(module=module)
        )

        progress_rows = list(
            StudentTopicProgress.objects.filter(
                student=student,
                topic__module=module
            )
        )

        progress_map = {
            row.topic_id: row
            for row in progress_rows
        }

        completed_topics = [
            row
            for row in progress_rows
            if row.completed
        ]

        total_topics = len(topics)

        if not total_topics:
            return

        completed_count = len(completed_topics)

        completed = (
            completed_count == total_topics
        )

        scores = [
            row.score
            for row in completed_topics
            if row.score is not None
        ]

        average_score = (
            round(sum(scores) / len(scores), 1)
            if scores
            else 0
        )

        module_progress, _ = StudentModuleProgress.objects.get_or_create(
            student=student,
            module=module,
        )

        module_progress.completed = completed
        module_progress.score = average_score
        module_progress.attempts += 1
        module_progress.last_attempt_at = timezone.now()
        module_progress.save()

    def _update_skill_score(self, student, skill):
        module_progress = StudentModuleProgress.objects.filter(
            student=student,
            module__skill=skill,
            completed=True,
        )

        scores = [
            row.score
            for row in module_progress
            if row.score is not None
        ]

        if not scores:
            return

        average_score = round(
            sum(scores) / len(scores),
            1
        )

        student_skill, created = StudentSkill.objects.get_or_create(
            student=student,
            skill=skill,
            defaults={"score": average_score},
        )

        if not created:
            student_skill.score = average_score
            student_skill.save()


# ------------------------------------------------------------------
# MODULE SUBMISSION
# ------------------------------------------------------------------

class ModuleAssessmentSubmitView(BaseAssessmentSubmitView):
    assessment_type = "module"

    def post(self, request, module_id):
        module = get_object_or_404(
            SkillModule.objects.select_related('skill'),
            id=module_id
        )

        questions = list(
            AssessmentQuestion.objects.filter(
                topic__module=module
            )
        )

        result, error = self.calculate_result(
            request,
            questions,
            request.data.get("answers", [])
        )

        if error:
            return error

        score = result.overall_score

        progress, _ = StudentModuleProgress.objects.get_or_create(
            student=request.user,
            module=module,
        )

        progress.completed = True
        progress.score = score
        progress.attempts += 1
        progress.last_attempt_at = timezone.now()
        progress.save()

        return Response({
            "assessment_type": "module",
            "module_id": module.id,
            "module_title": module.title,
            "score": score,
            "correct_answers": result.correct_answers,
            "total_questions": result.total_questions,
            "result": AssessmentResultSerializer(result).data,
        }, status=201)


# ------------------------------------------------------------------
# FINAL SKILL SUBMISSION
# ------------------------------------------------------------------

class SkillAssessmentSubmitView(BaseAssessmentSubmitView):
    assessment_type = "skill"

    def post(self, request, skill_id):
        skill = get_object_or_404(
            Skill,
            id=skill_id
        )

        questions = list(
            AssessmentQuestion.objects.filter(
                skill=skill
            )
        )

        result, error = self.calculate_result(
            request,
            questions,
            request.data.get("answers", [])
        )

        if error:
            return error

        score = result.overall_score

        student_skill, created = StudentSkill.objects.get_or_create(
            student=request.user,
            skill=skill,
            defaults={"score": score},
        )

        if not created:
            student_skill.score = score
            student_skill.save()

        return Response({
            "assessment_type": "skill",
            "skill_id": skill.id,
            "skill_name": skill.name,
            "score": score,
            "correct_answers": result.correct_answers,
            "total_questions": result.total_questions,
            "result": AssessmentResultSerializer(result).data,
        }, status=201)


# ------------------------------------------------------------------
# OLD ASSESSMENT ENDPOINT
#
# Kept temporarily so other parts of the project don't break.
# It now returns the full question bank instead of randomising.
# The new frontend should use the hierarchy endpoints above.
# ------------------------------------------------------------------

class AssessmentQuestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        questions = (
            AssessmentQuestion.objects
            .select_related('skill', 'topic')
            .all()
            .order_by(
                'skill__category',
                'skill__name',
                'topic__module__order',
                'topic__order',
                'id',
            )
        )

        return Response(
            AssessmentQuestionSerializer(
                questions,
                many=True
            ).data
        )


class AssessmentSubmitView(BaseAssessmentSubmitView):
    """
    Compatibility endpoint for the old assessment page.
    """

    def post(self, request):
        questions = list(
            AssessmentQuestion.objects.all()
        )

        result, error = self.calculate_result(
            request,
            questions,
            request.data.get("answers", [])
        )

        if error:
            return error

        return Response(
            AssessmentResultSerializer(result).data,
            status=201
        )


# ------------------------------------------------------------------
# ASSESSMENT HISTORY
# ------------------------------------------------------------------

class AssessmentHistoryView(generics.ListAPIView):
    serializer_class = AssessmentResultSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            AssessmentResult.objects
            .filter(student=self.request.user)
            .order_by('-taken_at')
        )


# ------------------------------------------------------------------
# EXISTING SKILL / CAREER APIs
# ------------------------------------------------------------------

class SkillGapView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, role_name):
        role_name = role_name.replace('-', ' ')

        matching_role = next(
            (
                r
                for r in services.ROLE_PROFILES
                if r.lower() == role_name.lower()
            ),
            None
        )

        if not matching_role:
            return Response(
                {"detail": "Unknown role"},
                status=404
            )

        gap = services.compute_skill_gap(
            request.user,
            matching_role
        )

        return Response({
            "role": matching_role,
            "gap_analysis": gap
        })


class RoleRecommendationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            services.recommend_roles(request.user)
        )


class PlacementReadinessView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            services.compute_placement_readiness(request.user)
        )


class RoleListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            list(services.ROLE_PROFILES.keys())
        )


class IndustryDemandView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            services.industry_skill_demand()
        )