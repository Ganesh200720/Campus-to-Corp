from django.conf import settings
from django.db import models


class CollaborationOpportunity(models.Model):
    FACULTY_INTERNSHIP = "faculty_internship"
    INDUSTRIAL_TRAINING = "industrial_training"
    FDP = "fdp"
    CONSULTANCY = "consultancy"
    RESEARCH_PROJECT = "research_project"

    MENTORSHIP = "mentorship"
    WORKSHOP = "workshop"
    GUEST_LECTURE = "guest_lecture"
    INNOVATION_CHALLENGE = "innovation_challenge"
    LIVE_PROJECT = "live_project"

    COLLABORATION_TYPES = [
        (FACULTY_INTERNSHIP, "Faculty Internship"),
        (INDUSTRIAL_TRAINING, "Industrial Training"),
        (FDP, "Faculty Development Program"),
        (CONSULTANCY, "Consultancy"),
        (RESEARCH_PROJECT, "Research Project"),
        (MENTORSHIP, "Mentorship"),
        (WORKSHOP, "Workshop"),
        (GUEST_LECTURE, "Guest Lecture"),
        (INNOVATION_CHALLENGE, "Innovation Challenge"),
        (LIVE_PROJECT, "Live Industry Project"),
    ]

    FACULTY = "faculty"
    INSTITUTION = "institution"

    TARGET_TYPES = [
        (FACULTY, "Faculty"),
        (INSTITUTION, "Institution"),
    ]

    DRAFT = "draft"
    PUBLISHED = "published"
    CLOSED = "closed"

    STATUS_CHOICES = [
        (DRAFT, "Draft"),
        (PUBLISHED, "Published"),
        (CLOSED, "Closed"),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()

    collaboration_type = models.CharField(
        max_length=30,
        choices=COLLABORATION_TYPES,
    )

    target_type = models.CharField(
        max_length=20,
        choices=TARGET_TYPES,
    )

    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="collaboration_opportunities",
    )

    eligibility = models.TextField(blank=True)

    location = models.CharField(max_length=200, blank=True)

    MODE_CHOICES = [
        ("online", "Online"),
        ("offline", "Offline"),
        ("hybrid", "Hybrid"),
    ]

    mode = models.CharField(
        max_length=10,
        choices=MODE_CHOICES,
        default="online",
    )

    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    deadline = models.DateField(null=True, blank=True)

    skills_topics = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=DRAFT,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class CollaborationRequest(models.Model):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"

    STATUS_CHOICES = [
        (PENDING, "Pending"),
        (ACCEPTED, "Accepted"),
        (REJECTED, "Rejected"),
        (WITHDRAWN, "Withdrawn"),
    ]

    opportunity = models.ForeignKey(
        CollaborationOpportunity,
        on_delete=models.CASCADE,
        related_name="requests",
    )

    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="collaboration_requests",
    )

    message = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=PENDING,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["opportunity", "applicant"],
                name="unique_collaboration_request",
            )
        ]

    def __str__(self):
        return f"{self.applicant} - {self.opportunity}"