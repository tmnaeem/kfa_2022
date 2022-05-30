from django.shortcuts import render
from django.core import serializers
from django.contrib.auth import authenticate, login
from admin_dashboard.models import *
import json

def user_landing_page(request):
    tournaments_list = AvailableTournaments.objects.all().values('TOURNAMENT_TITLE')
    tournaments_list = [ tournaments['TOURNAMENT_TITLE'] for tournaments in tournaments_list ]
    context = {
        'title' : 'Widad K-League',
        'year' : 2022,
        'location' : 'home',
        'tournaments_list' : tournaments_list
    }
    return render(request, 'landing_page/landing_page.html', context)

def tournament_report(request):
    tournaments_list = AvailableTournaments.objects.all().values('TOURNAMENT_TITLE')
    tournaments_list = [ tournaments['TOURNAMENT_TITLE'] for tournaments in tournaments_list ]
    context = {
        'title' : 'Widad K-League',
        'year' : 2022,
        'location' : 'home_tournament_report',
        'tournaments_list' : tournaments_list
    }
    return render(request, 'landing_page/tournament_result.html', context)

def about_us(request):
    tournaments_list = AvailableTournaments.objects.all().values('TOURNAMENT_TITLE')
    tournaments_list = [ tournaments['TOURNAMENT_TITLE'] for tournaments in tournaments_list ]
    context = {
        'title' : 'Widad K-League',
        'year' : 2022,
        'location' : 'home_about_us',
        'tournaments_list' : tournaments_list
    }
    return render(request, 'landing_page/about_us.html', context)