from django.urls import path
from . import views

urlpatterns = [
    path('overview/', views.InstitutionOverviewView.as_view()),
    path('students/', views.InstitutionStudentListView.as_view()),
    path('students/<int:pk>/', views.InstitutionStudentDetailView.as_view()),
]
