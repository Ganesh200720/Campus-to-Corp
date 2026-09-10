from django.contrib import admin
from .models import User, StudentProfile, IndustryProfile, FacultyProfile, InstitutionProfile

admin.site.register(User)
admin.site.register(StudentProfile)
admin.site.register(IndustryProfile)
admin.site.register(FacultyProfile)
admin.site.register(InstitutionProfile)
