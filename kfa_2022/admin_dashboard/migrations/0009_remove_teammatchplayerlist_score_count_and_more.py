# Generated by Django 4.0.4 on 2022-05-29 15:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('admin_dashboard', '0008_matchinformations_weather'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='teammatchplayerlist',
            name='SCORE_COUNT',
        ),
        migrations.AddField(
            model_name='teammatchplayerlist',
            name='SCORE_LIST',
            field=models.JSONField(blank=True, db_column='SCORE_LIST', default=dict, null=True),
        ),
        migrations.AlterField(
            model_name='teammatchplayerlist',
            name='PENALTY_CARDS',
            field=models.JSONField(blank=True, db_column='PENALTY_CARDS', default=dict, null=True),
        ),
    ]