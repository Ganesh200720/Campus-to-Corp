from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/skills/', include('skills.urls')),
    path('api/opportunities/', include('opportunities.urls')),
    path('api/portfolio/', include('portfolio.urls')),
    path('api/interviews/', include('interviews.urls')),
    path('api/analytics/', include('analytics.urls')),
    path(
        "api/collaborations/",
        include("collaborations.urls"),
    ),
]
