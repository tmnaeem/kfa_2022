from django.urls import URLPattern, path
from . import views

urlpatterns = [
    # team configuration
    path('team_config/', views.team_config_page, name='team_config_page'),
    path('team_config/team_profile/<str:team_name>/', views.team_profile_page, name='team_profile_page'),

    # tournament configuration
    path('tournament_config/', views.tournament_config_page, name='tournament_config_page'),
    path('tournament_config/match_report/<str:tournament_title>/<str:match_id>/', views.match_report_page, name='match_report_page'),
]