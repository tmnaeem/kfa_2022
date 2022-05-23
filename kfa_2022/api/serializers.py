from rest_framework import serializers
from admin_dashboard.models import AvailableTeams, AvailableTournaments

class TeamItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailableTeams
        fields = ('__all__')

class TournamentItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailableTournaments
        fields = ('__all__')