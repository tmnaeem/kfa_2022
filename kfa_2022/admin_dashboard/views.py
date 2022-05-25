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
    all_players = list(TeamRegistered.objects.filter(TEAM_ID=selected_team['PID']).values())
    
    selected_team['TEAM_ID'] = str(selected_team['TEAM_ID'])
    selected_team['SECRET_KEY'] = str(selected_team['SECRET_KEY'])
    selected_team['IS_REGISTERED'] = int(selected_team['IS_REGISTERED'])

    for player in all_players:
        player['PROFILE_PIC_PATH'] = '' if player['PROFILE_PIC_PATH'] is None else player['PROFILE_PIC_PATH']
        player['REGISTERED_BY'] = request.user.username if player['REGISTERED_BY'] is None else player['REGISTERED_BY']
        player['LICENSE_KEY'] = '' if player['LICENSE_KEY'] is None else player['LICENSE_KEY'] # TODO: temporary usage, will replace with valid license key
    
    context = {
        'title' : 'Profil Pasukan',
        'location' : 'team_profile',
        'team_data' : selected_team,
        'team_list' : all_players
    }
    return render(request, 'team_profile.html', context)

def tournament_config_page(request):
    list_tournament = list(AvailableTournaments.objects.values())
    for tournament in list_tournament:
        tournament['TOURNAMENT_ID'] = str(tournament['TOURNAMENT_ID'])
        tournament['START_TIME'] = str(tournament['START_TIME'])
        tournament['END_TIME'] = str(tournament['END_TIME'])
        
    context = {
        'title' : 'Konfigurasi Kejohanan',
        'location' : 'tournament_config',
        'list_tournament' : list_tournament,
    }
    return render(request, 'tournament_config.html', context)

def match_report_page(request, tournament_title, match_id):
    
    context = {
        'title' : 'Konfigurasi Perlawanan',
        'status' : 'new_match' if match_id == 'new' else match_id,
        'tournament_title' : tournament_title
    }

    return render(request, 'match_config.html', context)