from django.conf import settings
from numpy import identity
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import TeamItemSerializer, TournamentItemSerializer, TeamMatchGeneralInfoItemSerializer, TeamMatchPlayerListItemSerializer, TeamMatchOfficialsListItemSerializer, MatchDelegatesListItemSerializer, MatchInfoItemSerializer
import json
import os
import uuid
from django.db import transaction
from admin_dashboard.models import AvailableTeams, AvailableTournaments, MatchInformations, TeamMatchGeneralInformation, TeamMatchPlayerList, TeamMatchOfficialList, MatchDelegatesList
from client_dashboard.models import TeamRegistered
from api import utils
import shutil
import datetime
from django.utils.dateparse import parse_date
# TODO : separate delete and update

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
                
        new_response = []
        if len(data_create) != 0:
            serializer = TeamItemSerializer(data=data_create, many=True)
            if serializer.is_valid():
                serializer.save()
                new_response = json.loads(json.dumps(serializer.data)) 
            else:
                print(serializer.errors)
                return Response({"status": "error", "data": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

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
            print(match)
            match_teams = list(TeamMatchGeneralInformation.objects.filter(MATCH_ID=match['PID']).values('TEAM_ID__TEAM', 'IS_AWAY'))   
            print(match_teams)
            for team in match_teams:
                if team['IS_AWAY']:
                    match['away'] = team['TEAM_ID__TEAM'] 
                else:
                    match['home'] = team['TEAM_ID__TEAM'] 
            
            match['DATE_TIME'] = match['DATE_TIME'].strftime("%Y-%m-%d %I:%M %p") if match['DATE_TIME'] else ''
            match['vs'] = f"{match['home']} VS {match['away']}"

        return Response({"status": "success", "data": match_data}, status=status.HTTP_200_OK)

    def post(self, request):      
        match_status = request.data['match_status']        
        general_data = request.data['general_data']
        home_team_data = request.data['home_team_data']
        home_officials_data = request.data['home_officials_data']
        home_team_colors_data = request.data['home_team_colors_data']
        away_team_data = request.data['away_team_data']
        away_officials_data = request.data['away_officials_data']
        away_team_colors_data = request.data['away_team_colors_data']
        delegates_data = request.data['delegates_data']
        deleted_delegates_data = request.data['deleted_delegates_data']

        # delete teams first before proceed on saving
        if len(deleted_delegates_data) != 0:
            try:
                with transaction.atomic():
                    target_delegates = MatchDelegatesList.objects.filter(PID__in=deleted_delegates_data)
                    target_delegates.delete()
            except Exception as e:
                return Response({"status": "error", "data": e}, status=status.HTTP_400_BAD_REQUEST)

        if match_status == 'new_match' :
            # save general data
            if len(general_data) != 0:
                general_data = general_data[0]
                new_data = {}
                new_data['MATCH_ID'] = uuid.uuid4()
                new_data['DATE_TIME'] = datetime.datetime.strptime(general_data['DATE_TIME'], "%Y-%m-%d %I:%M %p") if general_data['DATE_TIME'] else None
                new_data['TOURNAMENT_ID'] = general_data['TOURNAMENT_ID']
                new_data['MATCH_NUM'] = general_data['MATCH_NUM']
                new_data['MATCH_VENUE'] = general_data['MATCH_VENUE']
                new_data['TEMPERATURE'] = general_data['TEMPERATURE']
                new_data['DURATION'] = general_data['DURATION']
                new_data['ATTENDANCE'] = general_data['ATTENDANCE']
                match_id = new_data['MATCH_ID']
                
                match_general_serializer = MatchInfoItemSerializer(data=new_data)
                if match_general_serializer.is_valid():
                    match_general_serializer.save()
                else:
                    return Response({"status": "error", "data": match_general_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
            
            match_info = MatchInformations.objects.get(MATCH_ID=match_id)
            
            # save players data
            team_colors = {}
            is_away = 'HOME'
            for team_data in [home_team_data, away_team_data]:
                if len(team_data) != 0:
                    new_data = []
                    for player in team_data:
                        data = {}
                        data['MATCH_ID'] = match_info.PID
                        data['TEAM_ID'] = player['TEAM_ID']
                        data['IDENTITY_NUM'] = TeamRegistered.objects.get(IDENTITY_NUM=player['IDENTITY_NUM']).PID
                        data['IS_FIRST_ELEVEN'] = bool(player['IS_FIRST_ELEVEN'])
                        data['IS_SUBSTITUDE'] = bool(player['IS_SUBSTITUTE'])
                        data['SCORE_LIST'] = json.dumps(player['scoreTime'].split(','))
                        data['PENALTY_CARDS'] = json.dumps({ 'yellow': player['yellowCard'].split(','), 'red': player['redCard'].split(',') })
                        data['SUBS_TIME'] = player['subTime']
                        data['IS_CAPTAIN'] = player['IS_CAPTAIN']
                        data['IS_PLAYING'] = bool(player['IS_PLAYING'])
                        data['IS_ELIGIBLE'] = bool(player['IS_ELIGIBLE'])

                        new_data.append(data)
                        team_colors[f'TEAM_ID_{is_away}'] = data['TEAM_ID']

                    match_team_serializer = TeamMatchPlayerListItemSerializer(data=new_data, many=True)
                    if match_team_serializer.is_valid():
                        match_team_serializer.save()
                    else:
                        return Response({"status": "error", "data": match_team_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

                is_away = 'AWAY'

            is_away = 'HOME'
            for team_colors_data in [home_team_colors_data, away_team_colors_data]:
                if team_colors_data and f'TEAM_ID_{is_away}' in team_colors:
                    team_colors_data = team_colors_data[0]
                    team_colors['TEAM_ID'] = team_colors[f'TEAM_ID_{is_away}']
                    del team_colors[f'TEAM_ID_{is_away}']
                    team_colors['IS_AWAY'] = not is_away == 'HOME'
                    team_colors['MATCH_ID'] = match_info.PID
                    team_colors['JERSEY_COLOR'] = json.dumps(team_colors_data)

                    match_team_general_info_serializer = TeamMatchGeneralInfoItemSerializer(data=team_colors)
                    if match_team_general_info_serializer.is_valid():
                        match_team_general_info_serializer.save()
                    else:
                        return Response({"status": "error", "data": match_team_general_info_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

                is_away = 'AWAY'

            for officials_data in [home_officials_data, away_officials_data]:
                if len(officials_data) != 0:
                    new_data = []
                    for official in officials_data:
                        data = {}
                        data['MATCH_ID'] = match_info.PID
                        data['TEAM_ID'] = official['TEAM_ID']
                        data['IDENTITY_NUM'] = TeamRegistered.objects.get(IDENTITY_NUM=official['IDENTITY_NUM']).PID
                        data['ATTENDANCE'] = bool(official['ATTENDANCE'])

                        new_data.append(data)

                    match_officials_serializer = TeamMatchOfficialsListItemSerializer(data=new_data, many=True)
                    if match_officials_serializer.is_valid():
                        match_officials_serializer.save()
                    else:
                        return Response({"status": "error", "data": match_officials_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        else:  
            # delegates_data = request.data['delegates_data']
            # deleted_delegates_data = request.data['deleted_delegates_data']
            match_info = MatchInformations.objects.get(MATCH_ID=match_status)

            if len(general_data) != 0:
                try:
                    with transaction.atomic():
                        general_data = general_data[0]
                        match_id = general_data['MATCH_ID']
                        curr_match = MatchInformations.objects.get(MATCH_ID=match_id)  
                        curr_match.MATCH_VENUE = general_data['MATCH_VENUE']
                        curr_match.TEMPERATURE = general_data['TEMPERATURE'] 
                        curr_match.DATE_TIME = datetime.datetime.strptime(general_data['DATE_TIME'], "%Y-%m-%d %I:%M %p") if general_data['DATE_TIME'] else None
                        curr_match.WEATHER = general_data['WEATHER']
                        curr_match.ATTENDANCE = general_data['ATTENDANCE']
                        curr_match.DURATION = general_data['DURATION']

                        curr_match.save()
                except Exception as e:
                    return Response({"status": "error", "data": e}, status=status.HTTP_400_BAD_REQUEST)

            for team_data in [home_team_data, away_team_data]:
                if len(team_data) != 0 :
                    try:
                        with transaction.atomic():
                            team_id = team_data[0]['TEAM_ID']
                            identities_num = [ int(data['IDENTITY_NUM']) for data in team_data ]
                            identities_pid = TeamRegistered.objects.filter(IDENTITY_NUM__in=identities_num).values_list('PID')
                            curr_team = TeamMatchPlayerList.objects.filter(TEAM_ID=team_id, MATCH_ID=match_info.PID, IDENTITY_NUM__in=identities_pid)
                            
                            for curr_data, new_data in zip(curr_team, team_data):
                                curr_data.IS_FIRST_ELEVEN = bool(new_data['IS_FIRST_ELEVEN'])
                                curr_data.IS_SUBSTITUTE = bool(new_data['IS_SUBSTITUTE'])
                                curr_data.SCORE_LIST = json.dumps(new_data['scoreTime'].split(','))
                                curr_data.PENALTY_CARDS = json.dumps({ 'yellow': new_data['yellowCard'].split(','), 'red': new_data['redCard'].split(',') })
                                curr_data.SUBS_TIME = new_data['subTime']
                                curr_data.IS_CAPTAIN = bool(new_data['IS_CAPTAIN'])
                                curr_data.IS_PLAYING = bool(new_data['IS_PLAYING'])
                                curr_data.IS_ELIGIBLE = bool(new_data['IS_ELIGIBLE'])

                            TeamMatchPlayerList.objects.bulk_update(curr_team, fields=['IS_FIRST_ELEVEN', 'IS_SUBSTITUTE', 'SCORE_LIST', 'PENALTY_CARDS', 'SUBS_TIME', 'IS_CAPTAIN', 'IS_PLAYING', 'IS_ELIGIBLE']) 
                    except Exception as e:
                        return Response({"status": "error", "data": e}, status=status.HTTP_400_BAD_REQUEST)

            for official_data in [home_officials_data, away_officials_data]:
                if len(official_data) != 0:
                    try:
                        with transaction.atomic():
                            team_id = official_data[0]['TEAM_ID']
                            identities_num = [ int(data['IDENTITY_NUM']) for data in official_data ]
                            identities_pid = TeamRegistered.objects.filter(IDENTITY_NUM__in=identities_num).values_list('PID')
                            curr_officials = TeamMatchOfficialList.objects.filter(TEAM_ID=team_id, MATCH_ID=match_info.PID, IDENTITY_NUM__in=identities_pid)
                            
                            for curr_data, new_data in zip(curr_officials, official_data):
                                curr_data.ATTENDANCE = bool(new_data['ATTENDANCE'])

                            TeamMatchOfficialList.objects.bulk_update(curr_officials, fields=['ATTENDANCE']) 
                    except Exception as e:
                        return Response({"status": "error", "data": e}, status=status.HTTP_400_BAD_REQUEST)

            for team_colors_data in [home_team_colors_data, away_team_colors_data]:     
                if len(team_colors_data) != 0:
                    try:
                        with transaction.atomic():
                            team_colors_data = team_colors_data[0]
                            del team_colors_data['saveStatus']
                            curr_color_info = TeamMatchGeneralInformation.objects.get(MATCH_ID=match_info.PID, IS_AWAY=False)
                            curr_color_info.JERSEY_COLOR = json.dumps(team_colors_data)
                            curr_color_info.save()

                    except Exception as e:
                        return Response({"status": "error", "data": e}, status=status.HTTP_400_BAD_REQUEST)
        
        # save delegate data
        if len(delegates_data) != 0:
            new_data = []
            update_data = []
            for delegate in delegates_data:
                if delegate['PID'] == '':
                    data = {}
                    data['NAME'] = delegate['NAME']
                    data['DESIGNATION'] = delegate['DESIGNATION']
                    data['MATCH_ID'] = match_info.PID
                    new_data.append(data)
                else:
                    update_data.append(delegate)

            if len(new_data) != 0:
                match_delegates_serializer = MatchDelegatesListItemSerializer(data=new_data, many=True)
                if match_delegates_serializer.is_valid():
                    match_delegates_serializer.save()
                else:
                    return Response({"status": "error", "data": match_delegates_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

            if len(update_data) != 0:
                try:
                    with transaction.atomic():
                        delegates_pid = [ delegate['PID'] for delegate in update_data ]
                        delegate_data = MatchDelegatesList.objects.filter(PID__in=delegates_pid)
                
                        for curr_delegate, new_delegate in zip(delegate_data, update_data):
                            curr_delegate.NAME = new_delegate['NAME']
                            curr_delegate.DESIGNATION = new_delegate['DESIGNATION']

                        MatchDelegatesList.objects.bulk_update(delegate_data, fields=['NAME', 'DESIGNATION']) 
                except Exception as e:
                    return Response({"status": "error", "data": e}, status=status.HTTP_400_BAD_REQUEST)

        # TODO: temporary solution
        return Response({"status": "success", "data": match_info.MATCH_ID}, status=status.HTTP_200_OK)

    def delete(self, request):
        deleted_matches = request.data['deleted_matches']

        # delete teams first before proceed on saving
        if len(deleted_matches) != 0:
            try:
                with transaction.atomic():
                    target_matches = MatchInformations.objects.filter(MATCH_ID__in=deleted_matches)
                    target_matches.delete()
            except Exception as e:
                return Response({"status": "error", "data": e}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(status=status.HTTP_204_NO_CONTENT)

class TeamRegisteredItemViews(APIView):
    def get(self, request):
        team_id = request.GET.get('team_id', None)
        match_id = request.GET.get('match_id', None)
        team_data = list(TeamRegistered.objects.filter(TEAM_ID=AvailableTeams.objects.get(TEAM_ID=team_id)).values('PID', 'NAME', 'IDENTITY_NUM', 'DESIGNATION', 'POSITION', 'TEAM_ID'))
        
        server_data = { 'team_data' : team_data }
        if match_id != 'new_match':
            match_info = MatchInformations.objects.get(MATCH_ID=match_id)
            for team in team_data:
                if TeamRegistered.TeamDesignationChoices.PLAYER == team['DESIGNATION']:
                    detailed_data = TeamMatchPlayerList.objects.filter(IDENTITY_NUM=team['PID'], MATCH_ID=match_info.PID).values()[0]
                    team_id_pid = team['TEAM_ID']

                    team['IS_CAPTAIN'] = int(detailed_data['IS_CAPTAIN'])
                    team['IS_FIRST_ELEVEN'] = int(detailed_data['IS_FIRST_ELEVEN'])
                    team['IS_SUBSTITUTE'] = int(detailed_data['IS_SUBSTITUTE'])
                    team['scoreTime'] = ",".join(json.loads(detailed_data['SCORE_LIST']))
                    team['IS_CAPTAIN'] = int(detailed_data['IS_CAPTAIN'])
                    team['IS_PLAYING'] = int(detailed_data['IS_PLAYING'])
                    team['IS_ELIGIBLE'] = int(detailed_data['IS_ELIGIBLE'])

                    penalty_cards = json.loads(detailed_data['PENALTY_CARDS'])
                    team['yellowCard'] = ",".join(penalty_cards['yellow'])
                    team['redCard'] = ",".join(penalty_cards['red'])
                    team['subTime'] = detailed_data['SUBS_TIME'] if detailed_data['SUBS_TIME'] else ''

                elif TeamRegistered.TeamDesignationChoices.OFFICIAL == team['DESIGNATION']:
                    detailed_data = TeamMatchOfficialList.objects.filter(IDENTITY_NUM=team['PID'], MATCH_ID=match_info.PID).values()[0]
                    team['ATTENDANCE'] = int(detailed_data['ATTENDANCE'])

            colors_data = TeamMatchGeneralInformation.objects.filter(TEAM_ID=team_id_pid, MATCH_ID=match_info.PID).values('JERSEY_COLOR')[0]
            colors_data = json.loads(colors_data['JERSEY_COLOR']) 
            server_data['colors_data'] = colors_data
            
        return Response({"status": "success", "data": server_data}, status=status.HTTP_200_OK)