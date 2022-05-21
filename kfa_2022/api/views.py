from turtle import settiltangle
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import TeamItemSerializer
import json
import os
import uuid
from django.db import transaction
from admin_dashboard.models import AvailableTeams
from api import utils
import shutil

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
                    path = utils.save_image_to_media(data, image_file)
                    new_path_image = os.path.join(path, image_file.name)
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