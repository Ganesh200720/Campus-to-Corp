from django.contrib import admin
from .models import Skill, StudentSkill, AssessmentQuestion, AssessmentResult

admin.site.register(Skill)
admin.site.register(StudentSkill)
admin.site.register(AssessmentQuestion)
admin.site.register(AssessmentResult)
