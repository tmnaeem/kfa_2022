from rest_framework import serializers
from admin_dashboard.models import AvailableTeams

class TeamItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailableTeams
        fields = ('__all__')