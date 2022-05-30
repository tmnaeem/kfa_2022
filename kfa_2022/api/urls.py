from django.urls import path
from .views import TeamItemViews, TournamentsItemViews, MatchItemViews, TeamRegisteredItemViews
from . import views

urlpatterns = [
    # available teams related
    path('edit_teams/', TeamItemViews.as_view()),

    # available tournaments related
    path('edit_tournaments/', TournamentsItemViews.as_view()),
    
    # match related
    path('get_match/', MatchItemViews.as_view()),
    path('edit_match/', MatchItemViews.as_view()),
    path('delete_match/', MatchItemViews.as_view()),

    path('get_team_registered_representative/', TeamRegisteredItemViews.as_view()),
    path('extract_data_from_file/', views.extract_data_from_file),
]