from django.urls import path

from . import views

urlpatterns = [
    path('internships/', views.InternshipListView.as_view()),
    path('internships/<int:pk>/', views.InternshipDetailView.as_view()),
    path('jobs/', views.JobListView.as_view()),
    path('jobs/<int:pk>/', views.JobDetailView.as_view()),

    # Student applications
    path('apply/', views.ApplyView.as_view()),
    path('my-applications/', views.MyApplicationsView.as_view()),
    path('my-applications/<int:pk>/respond/', views.RespondToInvitationView.as_view()),

    # Learning
    path('learning-programs/', views.LearningProgramListView.as_view()),

    # Industry opportunities
    path('industry/internships/', views.MyInternshipsView.as_view()),
    path('industry/internships/<int:pk>/', views.MyInternshipsView.as_view()),
    path('industry/jobs/', views.MyJobsView.as_view()),
    path('industry/jobs/<int:pk>/', views.MyJobsView.as_view()),

    # Industry applications and candidate matching
    path('industry/applications/', views.IndustryApplicationsView.as_view()),
    path('applications/<int:pk>/status/', views.UpdateApplicationStatusView.as_view()),
    path('candidate-matches/', views.CandidateMatchesView.as_view()),
    path('candidate-matches/invite/', views.InviteCandidateView.as_view()),
]