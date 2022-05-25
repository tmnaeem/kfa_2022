from rest_framework import serializers
from admin_dashboard.models import AvailableTeams, AvailableTournaments
from client_dashboard.models import TeamRegistered

class TeamItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailableTeams
        fields = ('__all__')

class TournamentItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailableTournaments
        fields = ('__all__')

class TeamRegisteredItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamRegistered
        fields = ('__all__')