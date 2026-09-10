from rest_framework import serializers

from .models import CollaborationOpportunity, CollaborationRequest


class CollaborationOpportunitySerializer(serializers.ModelSerializer):
    provider_name = serializers.SerializerMethodField()

    class Meta:
        model = CollaborationOpportunity
        fields = [
            "id",
            "title",
            "description",
            "collaboration_type",
            "target_type",
            "provider",
            "provider_name",
            "eligibility",
            "location",
            "mode",
            "start_date",
            "end_date",
            "deadline",
            "skills_topics",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "provider",
            "created_at",
            "updated_at",
        ]

    def get_provider_name(self, obj):
        if hasattr(obj.provider, "industry_profile"):
            return obj.provider.industry_profile.company_name

        return obj.provider.get_full_name() or obj.provider.username


class CollaborationRequestSerializer(serializers.ModelSerializer):
    applicant_name = serializers.SerializerMethodField()
    opportunity_title = serializers.CharField(
        source="opportunity.title",
        read_only=True,
    )

    class Meta:
        model = CollaborationRequest
        fields = [
            "id",
            "opportunity",
            "opportunity_title",
            "applicant",
            "applicant_name",
            "message",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "applicant",
            "status",
            "created_at",
            "updated_at",
        ]

    def get_applicant_name(self, obj):
        return obj.applicant.get_full_name() or obj.applicant.username