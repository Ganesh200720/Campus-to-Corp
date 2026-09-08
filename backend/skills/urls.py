from django.urls import path
from . import views

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
]
