from django.urls import path

from .views import (
    CollaborationOpportunityListCreateView,
    CollaborationOpportunityDetailView,
    CollaborationRequestCreateView,
    MyCollaborationRequestsView,
    IndustryCollaborationRequestsView,
    CollaborationRequestStatusView,
    IndustryMyOpportunitiesView,
)



urlpatterns = [
    path(
        "",
        CollaborationOpportunityListCreateView.as_view(),
        name="collaboration-list-create",
    ),
    path(
        "<int:pk>/",
        CollaborationOpportunityDetailView.as_view(),
        name="collaboration-detail",
    ),
    path(
        "<int:opportunity_id>/request/",
        CollaborationRequestCreateView.as_view(),
        name="collaboration-request",
    ),
    path(
        "my-requests/",
        MyCollaborationRequestsView.as_view(),
        name="my-collaboration-requests",
    ),
    path(
        "industry/requests/",
        IndustryCollaborationRequestsView.as_view(),
        name="industry-collaboration-requests",
    ),
    path(
        "requests/<int:request_id>/status/",
        CollaborationRequestStatusView.as_view(),
        name="collaboration-request-status",
    ),
    path(
        "industry/my-opportunities/",
        IndustryMyOpportunitiesView.as_view(),
    ),
]