# Generated by Django 4.0.4 on 2022-05-29 11:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('admin_dashboard', '0007_teammatchplayerlist_is_eligible_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='matchinformations',
            name='WEATHER',
            field=models.CharField(blank=True, db_column='WEATHER', max_length=255, null=True),
        ),
    ]
