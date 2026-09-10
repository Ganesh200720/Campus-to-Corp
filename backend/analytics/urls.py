from django.urls import path
from . import views

urlpatterns = [
    path('overview/', views.InstitutionOverviewView.as_view()),
]
