from django.urls import URLPattern, path
from . import views

urlpatterns = [
    path('', views.user_landing_page, name='user_landing_page'),
    path('', views.user_landing_page, name='user_landing_page'),
    path('tournament_report/', views.tournament_report, name='tournament_report'),
    path('about_us/', views.about_us, name='about_us'),
]