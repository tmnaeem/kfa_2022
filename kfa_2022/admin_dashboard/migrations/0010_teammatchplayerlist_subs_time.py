# Generated by Django 4.0.4 on 2022-05-29 17:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('admin_dashboard', '0009_remove_teammatchplayerlist_score_count_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='teammatchplayerlist',
            name='SUBS_TIME',
            field=models.CharField(blank=True, db_column='SUBS_TIME', max_length=255, null=True),
        ),
    ]
