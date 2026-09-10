from django.urls import path
from . import views

urlpatterns = [
    path('projects/', views.ProjectListCreateView.as_view()),
    path('certifications/', views.CertificationListCreateView.as_view()),
    path('achievements/', views.AchievementListCreateView.as_view()),
    path('me/', views.PortfolioView.as_view()),
    path('student/<int:student_id>/', views.PortfolioView.as_view()),
]
