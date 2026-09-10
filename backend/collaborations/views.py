from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CollaborationOpportunity, CollaborationRequest
from .serializers import (
    CollaborationOpportunitySerializer,
    CollaborationRequestSerializer,
)


class CollaborationOpportunityListCreateView(generics.ListCreateAPIView):
    serializer_class = CollaborationOpportunitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = CollaborationOpportunity.objects.filter(
            status=CollaborationOpportunity.PUBLISHED
        )

        collaboration_type = self.request.query_params.get("type")
        target_type = self.request.query_params.get("target")

        if collaboration_type:
            queryset = queryset.filter(
                collaboration_type=collaboration_type
            )

        if target_type:
            queryset = queryset.filter(target_type=target_type)

        return queryset.order_by("-created_at")

    def perform_create(self, serializer):
        if self.request.user.role != "industry":
            raise PermissionDenied(
                "Only industry users can create collaboration opportunities."
            )

        serializer.save(provider=self.request.user)


class CollaborationOpportunityDetailView(generics.RetrieveAPIView):
    serializer_class = CollaborationOpportunitySerializer
    queryset = CollaborationOpportunity.objects.all()


class CollaborationRequestCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, opportunity_id):
        try:
            opportunity = CollaborationOpportunity.objects.get(
                id=opportunity_id,
                status=CollaborationOpportunity.PUBLISHED,
            )
        except CollaborationOpportunity.DoesNotExist:
            return Response(
                {"detail": "Collaboration opportunity not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        user = request.user

        if user.role not in ["faculty", "admin"]:
            return Response(
                {
                    "detail": (
                        "Only faculty or institution users "
                        "can request collaboration."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if (
            opportunity.target_type == CollaborationOpportunity.FACULTY
            and user.role != "faculty"
        ):
            return Response(
                {
                    "detail": (
                        "This opportunity is available "
                        "only to faculty users."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if (
            opportunity.target_type == CollaborationOpportunity.INSTITUTION
            and user.role != "admin"
        ):
            return Response(
                {
                    "detail": (
                        "This opportunity is available "
                        "only to institution users."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if opportunity.provider == user:
            return Response(
                {
                    "detail": (
                        "You cannot request your own "
                        "collaboration opportunity."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if CollaborationRequest.objects.filter(
            opportunity=opportunity,
            applicant=user,
        ).exists():
            return Response(
                {
                    "detail": (
                        "You have already requested "
                        "this collaboration."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        collaboration_request = CollaborationRequest.objects.create(
            opportunity=opportunity,
            applicant=user,
            message=request.data.get("message", ""),
        )

        serializer = CollaborationRequestSerializer(
            collaboration_request
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )


class MyCollaborationRequestsView(generics.ListAPIView):
    serializer_class = CollaborationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CollaborationRequest.objects.filter(
            applicant=self.request.user
        ).select_related(
            "opportunity",
            "applicant",
        ).order_by("-created_at")


class IndustryCollaborationRequestsView(generics.ListAPIView):
    serializer_class = CollaborationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CollaborationRequest.objects.filter(
            opportunity__provider=self.request.user
        ).select_related(
            "opportunity",
            "applicant",
        ).order_by("-created_at")


class CollaborationRequestStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, request_id):
        try:
            collaboration_request = (
                CollaborationRequest.objects.select_related(
                    "opportunity"
                ).get(id=request_id)
            )
        except CollaborationRequest.DoesNotExist:
            return Response(
                {"detail": "Collaboration request not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if collaboration_request.opportunity.provider != request.user:
            return Response(
                {
                    "detail": (
                        "You are not allowed to modify "
                        "this request."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        new_status = request.data.get("status")

        allowed_statuses = [
            CollaborationRequest.ACCEPTED,
            CollaborationRequest.REJECTED,
        ]

        if new_status not in allowed_statuses:
            return Response(
                {
                    "detail": (
                        "Status must be either "
                        "'accepted' or 'rejected'."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        collaboration_request.status = new_status
        collaboration_request.save(
            update_fields=["status", "updated_at"]
        )

        serializer = CollaborationRequestSerializer(
            collaboration_request
        )

        return Response(serializer.data)


class IndustryMyOpportunitiesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != "industry":
            return Response(
                {"detail": "Only industry users can access this."},
                status=status.HTTP_403_FORBIDDEN,
            )

        opportunities = CollaborationOpportunity.objects.filter(
            provider=request.user
        ).order_by("-created_at")

        serializer = CollaborationOpportunitySerializer(
            opportunities,
            many=True,
        )

        data = serializer.data

        for opportunity in data:
            opportunity_id = opportunity["id"]

            requests = CollaborationRequest.objects.filter(
                opportunity_id=opportunity_id
            )

            opportunity["total_requests"] = requests.count()
            opportunity["pending_requests"] = requests.filter(
                status="pending"
            ).count()
            opportunity["accepted_requests"] = requests.filter(
                status="accepted"
            ).count()
            opportunity["rejected_requests"] = requests.filter(
                status="rejected"
            ).count()

        return Response(data)