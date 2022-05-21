from django.urls import path
from .views import TeamItemViews

urlpatterns = [
    path('add_teams/', TeamItemViews.as_view())
]