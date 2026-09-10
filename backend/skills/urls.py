from django.urls import path
from . import views
from . import industry_assessment_views as iav

urlpatterns = [
    path('skills/', views.SkillListView.as_view()),
    path('my-scores/', views.MySkillScoresView.as_view()),
    path('assessment/questions/', views.AssessmentQuestionsView.as_view()),
    path('assessment/submit/', views.AssessmentSubmitView.as_view()),
    path('assessment/history/', views.AssessmentHistoryView.as_view()),
    path('gap/<str:role_name>/', views.SkillGapView.as_view()),
    path('recommend-roles/', views.RoleRecommendationsView.as_view()),
    path('placement-readiness/', views.PlacementReadinessView.as_view()),
    path('roles/', views.RoleListView.as_view()),
    path('demand/', views.IndustryDemandView.as_view()),

    # ---- Industry: create & manage company assessments ----
    path('industry/assessments/', iav.IndustryAssessmentListCreateView.as_view()),
    path('industry/assessments/<int:pk>/', iav.IndustryAssessmentDetailView.as_view()),
    path('industry/assessments/<int:pk>/questions/', iav.IndustryAssessmentQuestionListCreateView.as_view()),
    path('industry/assessments/<int:pk>/questions/<int:qid>/', iav.IndustryAssessmentQuestionDetailView.as_view()),
    path('industry/assessments/<int:pk>/attempts/', iav.IndustryAssessmentAttemptsView.as_view()),

    # ---- Student: discover, take, and track company assessments ----
    path('company-assessments/', iav.CompanyAssessmentListView.as_view()),
    path('company-assessments/<int:pk>/questions/', iav.CompanyAssessmentQuestionsView.as_view()),
    path('company-assessments/<int:pk>/submit/', iav.CompanyAssessmentSubmitView.as_view()),
    path('company-assessments/results/', iav.MyCompanyAssessmentResultsView.as_view()),
]
