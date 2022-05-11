from django.urls import URLPattern, path
from . import views

urlpatterns = [
    path('home', views.user_landing_page, name='user_landing_page'),
]