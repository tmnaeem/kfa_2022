from dataclasses import field
from rest_framework import serializers
from admin_dashboard.models import AvailableTeams, AvailableTournaments, TeamMatchGeneralInformation, TeamMatchPlayerList, TeamMatchOfficialList, MatchDelegatesList, MatchInformations

class TeamItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailableTeams
        fields = ('__all__')

class TournamentItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailableTournaments
        fields = ('__all__')

class MatchInfoItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchInformations
        fields = ('__all__')

class TeamMatchGeneralInfoItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMatchGeneralInformation
        fields = ('__all__')

class TeamMatchPlayerListItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMatchPlayerList
        fields = ('__all__')

class TeamMatchOfficialsListItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMatchOfficialList
        fields = ('__all__')

class MatchDelegatesListItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchDelegatesList
        fields = ('__all__')