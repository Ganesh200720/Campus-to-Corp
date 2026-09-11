from django.urls import path
from . import views
from . import industry_assessment_views as iav


urlpatterns = [
    # ============================================================
    # SKILLS
    # ============================================================

    path(
        'skills/',
        views.SkillListView.as_view()
    ),

    path(
        'my-scores/',
        views.MySkillScoresView.as_view()
    ),


    # ============================================================
    # GFG-STYLE STUDENT SKILL ASSESSMENT
    # ============================================================

    path(
        'assessment/structure/',
        views.AssessmentStructureView.as_view()
    ),

    # Topic assessment
    path(
        'assessment/topic/<int:topic_id>/questions/',
        views.TopicAssessmentQuestionsView.as_view()
    ),

    path(
        'assessment/topic/<int:topic_id>/submit/',
        views.TopicAssessmentSubmitView.as_view()
    ),

    # Module assessment
    path(
        'assessment/module/<int:module_id>/questions/',
        views.ModuleAssessmentQuestionsView.as_view()
    ),

    path(
        'assessment/module/<int:module_id>/submit/',
        views.ModuleAssessmentSubmitView.as_view()
    ),

    # Final skill assessment
    path(
        'assessment/skill/<int:skill_id>/questions/',
        views.SkillAssessmentQuestionsView.as_view()
    ),

    path(
        'assessment/skill/<int:skill_id>/submit/',
        views.SkillAssessmentSubmitView.as_view()
    ),

    # Old assessment endpoints
    path(
        'assessment/questions/',
        views.AssessmentQuestionsView.as_view()
    ),

    path(
        'assessment/submit/',
        views.AssessmentSubmitView.as_view()
    ),

    path(
        'assessment/history/',
        views.AssessmentHistoryView.as_view()
    ),


    # ============================================================
    # SKILL GAP / RECOMMENDATIONS
    # ============================================================

    path(
        'gap/<str:role_name>/',
        views.SkillGapView.as_view()
    ),

    path(
        'recommend-roles/',
        views.RoleRecommendationsView.as_view()
    ),

    path(
        'placement-readiness/',
        views.PlacementReadinessView.as_view()
    ),

    path(
        'roles/',
        views.RoleListView.as_view()
    ),

    path(
        'demand/',
        views.IndustryDemandView.as_view()
    ),


    # ============================================================
    # INDUSTRY ASSESSMENT
    # ============================================================

    # Industry admin: list/create assessments
    path(
        'industry/assessments/',
        iav.IndustryAssessmentListCreateView.as_view()
    ),

    # Industry admin: assessment detail
    path(
        'industry/assessments/<int:pk>/',
        iav.IndustryAssessmentDetailView.as_view()
    ),

    # Industry admin: questions
    path(
        'industry/assessments/<int:assessment_id>/questions/',
        iav.IndustryAssessmentQuestionListCreateView.as_view()
    ),

    # Industry admin: question detail
    path(
        'industry/assessment-questions/<int:pk>/',
        iav.IndustryAssessmentQuestionDetailView.as_view()
    ),

    # Industry admin: student attempts/results
    path(
        'industry/assessments/<int:pk>/attempts/',
        iav.IndustryAssessmentAttemptsView.as_view()
    ),


    # ============================================================
    # COMPANY ASSESSMENT
    # STUDENT FRONTEND ROUTES
    # ============================================================

    # Browse company assessments
    path(
        'company-assessments/',
        iav.CompanyAssessmentListView.as_view()
    ),

    # Take a company assessment - get questions
    path(
        'company-assessments/<int:pk>/questions/',
        iav.CompanyAssessmentQuestionsView.as_view()
    ),

    # Submit company assessment
    path(
        'company-assessments/<int:pk>/submit/',
        iav.CompanyAssessmentSubmitView.as_view()
    ),

    # Student's company assessment results
    path(
        'company-assessments/results/',
        iav.MyCompanyAssessmentResultsView.as_view()
    ),


    # ============================================================
    # COMPANY ASSESSMENT
    # OLD / ALTERNATE ROUTES KEPT FOR COMPATIBILITY
    # ============================================================

    path(
        'industry/company-assessments/',
        iav.CompanyAssessmentListView.as_view()
    ),

    path(
        'industry/company-assessments/<int:pk>/questions/',
        iav.CompanyAssessmentQuestionsView.as_view()
    ),

    path(
        'industry/company-assessments/<int:pk>/submit/',
        iav.CompanyAssessmentSubmitView.as_view()
    ),

    path(
        'industry/company-assessment-results/',
        iav.MyCompanyAssessmentResultsView.as_view()
    ),
]