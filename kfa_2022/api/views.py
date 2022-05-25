from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import TeamItemSerializer, TournamentItemSerializer, TeamRegisteredItemSerializer
import json
import os
import uuid
from django.db import transaction
from admin_dashboard.models import AvailableTeams, AvailableTournaments, MatchInformations, TeamMatchGeneralInformation
from client_dashboard.models import TeamRegistered
from api import utils
import shutil
import datetime
from django.utils.dateparse import parse_date
from rest_framework.decorators import api_view
import pandas as pd
# TODO : separate delete and update

@api_view(['POST'])
def extract_data_from_file(request):
    teams_data = request.data['teams_data']
    try:
        df = pd.read_csv(teams_data)
    except:
        df = pd.read_excel(teams_data)

    df.loc[df.DESIGNATION == "PLAYER", "DESIGNATION"] = 1
    
    new_response = df.set_index('TEAM').groupby('TEAM').apply(lambda group: group.to_dict(orient='records')).to_dict()
    return Response({"status": "success", "data": new_response}, status=status.HTTP_200_OK)

class TeamItemViews(APIView):
    def post(self, request):
        teams_data = json.loads(request.data['teams_data'])
        deleted_teams_data = json.loads(request.data['deleted_teams_data'])
        
        # delete teams first before proceed on saving
        if len(deleted_teams_data) != 0:
            try:
                with transaction.atomic():
                    target_teams = AvailableTeams.objects.filter(SECRET_KEY__in=deleted_teams_data)
                    
                    for team in target_teams:
                        if team.LOGO_PATH : 
                            path = os.path.join(settings.MEDIA_ROOT, 'teams', str(team.SECRET_KEY))
                            shutil.rmtree(path)

                    target_teams.delete()
            except Exception as e:
                return Response({"status": "error", "data": e}, status=status.HTTP_400_BAD_REQUEST)

        data_create = []
        data_update = []
        data_player = [] # only applicable for data create 
        for data in teams_data:
            # PID TEAM_ID TEAM LOGO_PATH SECRET_KEY IS_REGISTERED 
            # preparing file saving if any
            new_path_image = ''
            if data['TEAM'] in request.data:
                image_file = request.data[data['TEAM']]
                if image_file: 
                    path = os.path.join(settings.MEDIA_ROOT, 'teams', data['SECRET_KEY'], data['TEAM'], 'logo')
                    utils.save_image_to_media(image_file, path)
                    new_path_image = os.path.join('media', 'teams', data['SECRET_KEY'], data['TEAM'], 'logo', image_file.name)
            else:
                new_path_image = data['LOGO_PATH']
                
            # preparing team id if any
            if not data['TEAM_ID']: data['TEAM_ID'] = uuid.uuid4()

            new_dict = {}
            new_dict['TEAM_ID'] = data['TEAM_ID']
            new_dict['SECRET_KEY'] = data['SECRET_KEY']
            new_dict['IS_REGISTERED'] = bool(data['IS_REGISTERED'])
            new_dict['TEAM'] = data['TEAM']
            new_dict['LOGO_PATH'] =  new_path_image

            data_update.append(new_dict) if AvailableTeams.objects.filter(TEAM_ID=data['TEAM_ID']).exists() else data_create.append(new_dict)

            if 'playersData' in data: 
                for row in data['playersData']:
                    row['TEAM_ID'] = data['TEAM_ID']

                data_player += data['playersData']
               
        new_response = []
        if len(data_create) != 0:
            team_serializer = TeamItemSerializer(data=data_create, many=True)
            if team_serializer.is_valid():
                team_serializer.save()
                new_response = json.loads(json.dumps(team_serializer.data)) 
            else:
                return Response({"status": "error", "data": team_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        if len(data_player) != 0:
            for data in data_player:
                existTeam = AvailableTeams.objects.get(TEAM_ID=data['TEAM_ID'])
                data['TEAM_ID'] = existTeam.PID

            player_serializer = TeamRegisteredItemSerializer(data=data_player, many=True)
            if player_serializer.is_valid():
                player_serializer.save()
            else:
                return Response({"status": "error", "data": player_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        if len(data_update) != 0:
            try:
                with transaction.atomic():
                    team_ids = [data['TEAM_ID'] for data in data_update]
                    curr_teams = AvailableTeams.objects.filter(TEAM_ID__in=team_ids)  

                    for curr_data, new_data in zip(curr_teams, data_update):
                        curr_data.TEAM = new_data['TEAM']
                        curr_data.LOGO_PATH = new_data['LOGO_PATH']

                    AvailableTeams.objects.bulk_update(curr_teams, fields=['TEAM', 'LOGO_PATH']) 
            except Exception as e:
                return Response({"status": "error", "data": e}, status=status.HTTP_400_BAD_REQUEST)

            new_response = new_response + data_update
        return Response({"status": "success", "data": new_response}, status=status.HTTP_200_OK)

class TournamentsItemViews(APIView):
    def post(self, request):
        teams_data = json.loads(request.data['tournaments_data'])
        deleted_teams_data = json.loads(request.data['deleted_tournaments_data'])
        
        # delete teams first before proceed on saving
        if len(deleted_teams_data) != 0:
            try:
                with transaction.atomic():
                    target_tournaments = AvailableTournaments.objects.filter(TOURNAMENT_ID__in=deleted_teams_data)
                    
                    for tournament in target_tournaments:
                        if tournament.POSTER_PATH : 
                            path = os.path.join(settings.MEDIA_ROOT, 'tournaments', str(tournament.TOURNAMENT_ID))
                            shutil.rmtree(path)

                    target_tournaments.delete()
            except Exception as e:
                return Response({"status": "error", "data": e}, status=status.HTTP_400_BAD_REQUEST)

        data_create = []
        data_update = []
        for data in teams_data:
            # preparing file saving if any
            new_path_image = ''
            if data['TOURNAMENT_ID'] in request.data:
                image_file = request.data[data['TOURNAMENT_ID']]
                if image_file: 
                    path = os.path.join(settings.MEDIA_ROOT, 'tournaments', data['TOURNAMENT_ID'], 'poster')
                    utils.save_image_to_media(image_file, path)
                    new_path_image = os.path.join('media', 'tournaments', data['TOURNAMENT_ID'], 'poster', image_file.name)
            else:
                new_path_image = data['POSTER_PATH']
                
            new_dict = {}
            new_dict['TOURNAMENT_TITLE'] = data['TOURNAMENT_TITLE']
            new_dict['TOURNAMENT_ID'] = data['TOURNAMENT_ID']
            new_dict['START_TIME'] = datetime.datetime.strptime(data['START_TIME'], "%Y-%m-%d").date() if data['START_TIME'] else None
            new_dict['END_TIME'] = datetime.datetime.strptime(data['END_TIME'], "%Y-%m-%d").date() if data['END_TIME'] else None
            new_dict['POSTER_PATH'] =  new_path_image
            print(new_dict)
            data_update.append(new_dict) if AvailableTournaments.objects.filter(TOURNAMENT_ID=data['TOURNAMENT_ID']).exists() else data_create.append(new_dict)
            
        new_response = []
        if len(data_create) != 0:
            serializer = TournamentItemSerializer(data=data_create, many=True)
            if serializer.is_valid():
                serializer.save()
                new_response = json.loads(json.dumps(serializer.data)) 
            else:
                return Response({"status": "error", "data": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        if len(data_update) != 0:
            try:
                with transaction.atomic():
                    tournament_ids = [data['TOURNAMENT_ID'] for data in data_update]
                    curr_tournament = AvailableTournaments.objects.filter(TOURNAMENT_ID__in=tournament_ids)  

                    for curr_data, new_data in zip(curr_tournament, data_update):
                        curr_data.TOURNAMENT_TITLE = new_data['TOURNAMENT_TITLE']
                        curr_data.POSTER_PATH = new_data['POSTER_PATH']
                        curr_data.START_TIME = new_data['START_TIME']
                        curr_data.END_TIME = new_data['END_TIME']

                    AvailableTournaments.objects.bulk_update(curr_tournament, fields=['TOURNAMENT_TITLE', 'POSTER_PATH', 'START_TIME', 'END_TIME']) 
            except Exception as e:
                return Response({"status": "error", "data": e}, status=status.HTTP_400_BAD_REQUEST)

            new_response = new_response + data_update
        return Response({"status": "success", "data": new_response}, status=status.HTTP_200_OK)

class MatchItemViews(APIView):
    def get(self, request):
        tournament_pid = request.GET.get('tournament_pid', None)
        match_data = list(MatchInformations.objects.filter(TOURNAMENT_ID=AvailableTournaments.objects.get(TOURNAMENT_ID=tournament_pid)).values())

        for match in match_data:
            match_teams = list(TeamMatchGeneralInformation.objects.filter(MATCH_ID=MatchInformations.objects.get(MATCH_ID=match['MATCH_ID'])).values('TEAM_ID__TEAM', 'IS_AWAY'))   
            for team in match_teams:
                if team['IS_AWAY']:
                    home_team = team['TEAM_ID__TEAM'] 
                else:
                    away_team = team['TEAM_ID__TEAM'] 
            
            match['vs'] = f'{home_team} VS {away_team}'
    
        return Response({"status": "success", "data": match_data}, status=status.HTTP_200_OK)
            