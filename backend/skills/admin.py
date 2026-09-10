from django.contrib import admin
from .models import (Skill, StudentSkill, AssessmentQuestion, AssessmentResult,
                      IndustryAssessment, IndustryAssessmentQuestion, IndustryAssessmentAttempt)

admin.site.register(Skill)
admin.site.register(StudentSkill)
admin.site.register(AssessmentQuestion)
admin.site.register(AssessmentResult)
admin.site.register(IndustryAssessment)
admin.site.register(IndustryAssessmentQuestion)
admin.site.register(IndustryAssessmentAttempt)
