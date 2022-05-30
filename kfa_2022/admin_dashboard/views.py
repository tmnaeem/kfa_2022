from django.shortcuts import render
from django.core import serializers
from django.contrib.auth import authenticate, login
from admin_dashboard.models import *
from client_dashboard.models import *
from django.db.models import TextField
from django.db.models.functions import Cast
import json

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
    tournament_related = AvailableTournaments.objects.get(TOURNAMENT_TITLE=tournament_title)

    context = {
        'title' : 'Konfigurasi Perlawanan',
        'location' : 'match_config',
        'match_id' : 'new_match' if match_id == 'new' else match_id,
        'tournament_title' : tournament_title,
    }

    server_data = {}
    if match_id == 'new_match' :
        all_match = list(MatchInformations.objects.all().values())
        server_data['MATCH_NUM'] = len(all_match) + 1
        server_data['TOURNAMENT_ID'] = tournament_related.PID
        
        teams_data = list(AvailableTeams.objects.all().values())
        for team in teams_data:
            team['TEAM_ID'] = str(team['TEAM_ID'])
            team['SECRET_KEY'] = str(team['SECRET_KEY'])
            team['IS_REGISTERED'] = int(team['IS_REGISTERED'])
      
        context['server_data'] = server_data
        context['teams_data'] = teams_data
        context['delegatesData'] = []
    else:
        match_info = list(MatchInformations.objects.filter(MATCH_ID=match_id).values())[0]
        match_info['MATCH_ID'] = str(match_info['MATCH_ID'])
        match_info['DATE_TIME'] = match_info['DATE_TIME'].strftime("%Y-%m-%d %I:%M %p") if match_info['DATE_TIME'] else ''
        match_info['MATCH_VENUE'] = match_info['MATCH_VENUE'] if match_info['MATCH_VENUE'] else ''
        match_info['TEMPERATURE'] = match_info['TEMPERATURE'] if match_info['TEMPERATURE'] else ''
        match_info['WEATHER'] = match_info['WEATHER'] if match_info['WEATHER'] else ''
        match_info['DURATION'] = match_info['DURATION'] if match_info['DURATION'] else ''
        match_info['ATTENDANCE'] = match_info['ATTENDANCE'] if match_info['ATTENDANCE'] else ''
        
        teams_data = list(TeamMatchGeneralInformation.objects.filter(MATCH_ID=match_info['PID']).values('TEAM_ID__TEAM', 'IS_AWAY', 'TEAM_ID__TEAM_ID')) 
        for team in teams_data:
            team['IS_AWAY'] = int(team['IS_AWAY'])
            team['TEAM_ID'] = str(team['TEAM_ID__TEAM_ID'])
            del team['TEAM_ID__TEAM_ID']
            
        delegates_data = list(MatchDelegatesList.objects.filter(MATCH_ID=match_info['PID']).values())

        context['server_data'] = match_info
        context['teams_data'] = teams_data
        context['delegatesData'] = delegates_data
   
    return render(request, 'match_config.html', context)