from django.urls import path
from .views import TeamItemViews, TournamentsItemViews, MatchItemViews

urlpatterns = [
    path('edit_teams/', TeamItemViews.as_view()),
    path('edit_tournaments/', TournamentsItemViews.as_view()),
    path('get_match/', MatchItemViews.as_view()),
]