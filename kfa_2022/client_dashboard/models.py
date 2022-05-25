from django.db import models

class TeamRegistered(models.Model):
    class TeamDesignationChoices(models.IntegerChoices):
        OFFICIAL = 0
        PLAYER = 1

    PID = models.AutoField(db_column='PID', primary_key=True)
    NAME = models.CharField(db_column='NAME', max_length=255)
    IDENTITY_NUM = models.CharField(db_column='IDENTITY_NUM', max_length=12, unique=True)
    PROFILE_PIC_PATH = models.TextField(db_column='PROFILE_PIC_PATH', blank=True, null=True)
    TEAM_ID = models.ForeignKey('admin_dashboard.AvailableTeams', db_column='TEAM_ID', on_delete=models.CASCADE)
    DESIGNATION = models.IntegerField(db_column='DESIGNATION', choices=TeamDesignationChoices.choices)
    POSITION = models.CharField(db_column='POSITION', blank=True, null=True, max_length=20) # TODO: Convert to selection
    JERSEY_NUM = models.IntegerField(db_column='JERSEY_NUM') 
    REGISTERED_BY = models.UUIDField(db_column='REGISTERED_BY', unique=True, null=True, blank=True)
    LICENSE_KEY = models.TextField(db_column='LICENSE_KEY', unique=True, null=True, blank=True)
