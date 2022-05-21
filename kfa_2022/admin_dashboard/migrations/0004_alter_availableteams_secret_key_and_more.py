# Generated by Django 4.0.4 on 2022-05-20 03:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('admin_dashboard', '0003_alter_availableteams_logo_path_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='availableteams',
            name='SECRET_KEY',
            field=models.UUIDField(db_column='SECRET_KEY', unique=True),
        ),
        migrations.AlterField(
            model_name='availableteams',
            name='TEAM',
            field=models.CharField(db_column='TEAM', max_length=100, unique=True),
        ),
        migrations.AlterField(
            model_name='availableteams',
            name='TEAM_ID',
            field=models.UUIDField(db_column='TEAM_ID', unique=True),
        ),
        migrations.AlterField(
            model_name='availabletournaments',
            name='TOURNAMENT_ID',
            field=models.UUIDField(db_column='TOURNAMENT_ID', unique=True),
        ),
        migrations.AlterField(
            model_name='matchinformations',
            name='END_TIME',
            field=models.DateTimeField(blank=True, db_column='END_TIME', null=True),
        ),
        migrations.AlterField(
            model_name='matchinformations',
            name='MATCH_ID',
            field=models.UUIDField(db_column='MATCH_ID', unique=True),
        ),
        migrations.AlterField(
            model_name='matchinformations',
            name='MATCH_NUM',
            field=models.IntegerField(db_column='MATCH_NUM', default=0, unique=True),
        ),
        migrations.AlterField(
            model_name='matchinformations',
            name='MATCH_VENUE',
            field=models.CharField(blank=True, db_column='MATCH_VENUE', max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='matchinformations',
            name='START_TIME',
            field=models.DateTimeField(blank=True, db_column='START_TIME', null=True),
        ),
        migrations.AlterField(
            model_name='matchinformations',
            name='TEMPERATURE',
            field=models.FloatField(blank=True, db_column='TEMPERATURE', null=True),
        ),
        migrations.AlterField(
            model_name='teammatchplayerlist',
            name='SCORE_COUNT',
            field=models.IntegerField(blank=True, db_column='SCORE_COUNT', default=0, null=True),
        ),
    ]