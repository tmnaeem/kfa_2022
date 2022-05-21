from django.db import models

class AvailableTeams(models.Model):
    PID = models.AutoField(db_column='PID', primary_key=True)
    TEAM_ID = models.UUIDField(db_column='TEAM_ID', unique=True)
    TEAM = models.CharField(db_column='TEAM', max_length=100, unique=True)
    LOGO_PATH = models.TextField(db_column='LOGO_PATH', blank=True, null=True)
    SECRET_KEY = models.UUIDField(db_column='SECRET_KEY', unique=True)
    IS_REGISTERED = models.BooleanField(db_column='IS_REGISTERED', default=False)

class AvailableTournaments(models.Model):   
    PID = models.AutoField(db_column='PID', primary_key=True) 
    TOURNAMENT_ID = models.UUIDField(db_column='TOURNAMENT_ID', unique=True)
    TOURNAMENT_TITLE = models.CharField(db_column='TOURNAMENT_TITLE', max_length=255)
    START_TIME = models.DateField(db_column='START_TIME')
    END_TIME = models.DateField(db_column='END_TIME')
    POSTER_PATH = models.TextField(db_column='POSTER_PATH', blank=True, null=True)

class MatchInformations(models.Model):
    PID = models.AutoField(db_column='PID', primary_key=True) 
    MATCH_ID = models.UUIDField(db_column='MATCH_ID', unique=True)
    TOURNAMENT_ID = models.ForeignKey('AvailableTournaments', db_column='TOURNAMENT_ID', on_delete=models.CASCADE)
    MATCH_NUM = models.IntegerField(db_column='MATCH_NUM', default=0, unique=True)
    START_TIME = models.DateTimeField(db_column='START_TIME', blank=True, null=True)
    END_TIME = models.DateTimeField(db_column='END_TIME', blank=True, null=True)
    MATCH_VENUE = models.CharField(db_column='MATCH_VENUE', max_length=255, blank=True, null=True)
    TEMPERATURE = models.FloatField(db_column='TEMPERATURE', blank=True, null=True)

class TeamMatchGeneralInformation(models.Model):
    PID = models.AutoField(db_column='PID', primary_key=True) 
    TEAM_ID = models.ForeignKey('AvailableTeams', db_column='TEAM_ID', on_delete=models.CASCADE)
    IS_AWAY = models.BooleanField(db_column='IS_AWAY', default=False)
    MATCH_ID = models.ForeignKey('MatchInformations', db_column='MATCH_ID', on_delete=models.CASCADE)
    JERSEY_COLOR = models.JSONField(db_column='JERSEY_COLOR', default=dict)

class TeamMatchOfficialList(models.Model):
    PID = models.AutoField(db_column='PID', primary_key=True)
    MATCH_ID = models.ForeignKey('MatchInformations', db_column='MATCH_ID', on_delete=models.CASCADE)
    TEAM_ID = models.ForeignKey('AvailableTeams', db_column='TEAM_ID', on_delete=models.CASCADE)
    IDENTITY_NUM = models.ForeignKey('client_dashboard.TeamRegistered', db_column='IDENTITY_NUM', on_delete=models.CASCADE)
    ATTENDANCE = models.BooleanField(db_column='ATTENDANCE', default=False)

class TeamMatchPlayerList(models.Model):
    PID = models.AutoField(db_column='PID', primary_key=True)
    MATCH_ID = models.ForeignKey('MatchInformations', db_column='MATCH_ID', on_delete=models.CASCADE)
    TEAM_ID = models.ForeignKey('AvailableTeams', db_column='TEAM_ID', on_delete=models.CASCADE)
    IDENTITY_NUM = models.ForeignKey('client_dashboard.TeamRegistered', db_column='IDENTITY_NUM', on_delete=models.CASCADE)
    ATTENDANCE = models.BooleanField(db_column='ATTENDANCE', default=False)
    IS_FIRST_ELEVEN = models.BooleanField(db_column='IS_FIRST_ELEVEN', default=False)
    IS_SUBSTITUTE = models.BooleanField(db_column='IS_SUBSTITUTE', default=True)
    SCORE_COUNT = models.IntegerField(db_column='SCORE_COUNT', default=0, blank=True, null=True)
    PENALTY_CARDS = models.JSONField(db_column='PENALTY_CARDS', default=dict)
    IS_CAPTAIN = models.BooleanField(db_column='IS_CAPTAIN', default=False)

class MatchDelegatesList(models.Model):
    PID = models.AutoField(db_column='PID', primary_key=True)
    NAME = models.CharField(db_column='NAME', max_length=100)
    DESIGNATION = models.CharField(db_column='DESIGNATION', max_length=100)
    MATCH_ID = models.ForeignKey('MatchInformations', db_column='MATCH_ID', on_delete=models.CASCADE)


