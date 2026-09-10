from django.contrib import admin
from .models import Internship, Job, LearningProgram, Application

admin.site.register(Internship)
admin.site.register(Job)
admin.site.register(LearningProgram)
admin.site.register(Application)
