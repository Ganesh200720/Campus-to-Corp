from django.urls import path
from . import views

urlpatterns = [
    path('roles/', views.InterviewRolesView.as_view()),
    path('questions/', views.InterviewQuestionsView.as_view()),
    path('submit/', views.SubmitInterviewView.as_view()),
    path('history/', views.InterviewHistoryView.as_view()),
]
