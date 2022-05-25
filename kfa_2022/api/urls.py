from django.urls import path
from .views import TeamItemViews, TournamentsItemViews, MatchItemViews
from . import views

urlpatterns = [
    path('edit_teams/', TeamItemViews.as_view()),
    path('edit_tournaments/', TournamentsItemViews.as_view()),
    path('get_match/', MatchItemViews.as_view()),

    path('extract_data_from_file/', views.extract_data_from_file),
]