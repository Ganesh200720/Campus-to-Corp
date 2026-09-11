from rest_framework.permissions import BasePermission


class IsInstitutionUser(BasePermission):
    """Allows access only to users with the Institution role who have an
    InstitutionProfile set up. Keeps institution-only data (student rosters,
    analytics) away from students, industry partners and faculty."""

    message = "Only Institution accounts can access this resource."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated
            and user.role == 'admin'
            and hasattr(user, 'institution_profile')
        )
