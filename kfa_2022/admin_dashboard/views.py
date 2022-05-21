from django.shortcuts import render
from django.core import serializers
from django.contrib.auth import authenticate, login
from admin_dashboard.models import *
from client_dashboard.models import *
from django.db.models import TextField
from django.db.models.functions import Cast

def team_config_page(request):
    # TODO: save image using different way
    list_team = list(AvailableTeams.objects.values())
    for team in list_team:
        team['TEAM_ID'] = str(team['TEAM_ID'])
        team['SECRET_KEY'] = str(team['SECRET_KEY'])
        team['IS_REGISTERED'] = int(team['IS_REGISTERED'])
        team['LOGO_PATH'] = team['LOGO_PATH'].replace('\\', '/') if team['LOGO_PATH'] else ''

    context = {
        'title' : 'Konfigurasi Pasukan',
        'location' : 'team_config',
        'rowData' : list_team
    }
    return render(request, 'team_config.html', context)

def team_profile_page(request, team_name):
    selected_team = list(AvailableTeams.objects.filter(TEAM=team_name).values())[0]
    all_player = list(TeamRegistered.objects.filter(TEAM_ID=selected_team['TEAM_ID']))

    selected_team['TEAM_ID'] = str(selected_team['TEAM_ID'])
    selected_team['SECRET_KEY'] = str(selected_team['SECRET_KEY'])
    selected_team['IS_REGISTERED'] = int(selected_team['IS_REGISTERED'])
    
    context = {
        'title' : 'Profil Pasukan',
        'location' : 'team_profile',
        'team_data' : selected_team,
        'team_list' : all_player
    }
    return render(request, 'team_profile.html', context)