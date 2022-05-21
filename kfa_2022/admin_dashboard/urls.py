from django.urls import URLPattern, path
from . import views

urlpatterns = [
    path('team_config/', views.team_config_page, name='team_config_page'),
    path('team_config/team_profile/<str:team_name>/', views.team_profile_page, name='team_profile_page'),
]