from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import MyTokenObtainPairView, SignupView, MeView, StudentProfileDetail, FacultyProfileDetail, IndustryProfileDetail

urlpatterns = [
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('me/', MeView.as_view()),
    path('profile/student/', StudentProfileDetail.as_view()),
    path('profile/faculty/', FacultyProfileDetail.as_view()),
    path('profile/industry/', IndustryProfileDetail.as_view()),
]