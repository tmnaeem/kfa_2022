# Generated by Django 4.0.4 on 2022-05-06 17:52

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('admin_dashboard', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='TeamRegistered',
            fields=[
                ('PID', models.AutoField(db_column='PID', primary_key=True, serialize=False)),
                ('NAME', models.CharField(db_column='NAME', max_length=255)),
                ('IDENTITY_NUM', models.CharField(db_column='IDENTITY_NUM', max_length=12)),
                ('PROFILE_PIC_PATH', models.ImageField(blank=True, db_column='PROFILE_PIC_PATH', upload_to='')),
                ('DESIGNATION', models.IntegerField(choices=[(0, 'Official'), (1, 'Player')], db_column='DESIGNATION')),
                ('POSITION', models.CharField(blank=True, db_column='POSITION', max_length=20)),
                ('JERSEY_NUM', models.IntegerField(db_column='JERSEY_NUM')),
                ('REGISTERED_BY', models.UUIDField(db_column='REGISTERED_BY')),
                ('TEAM_ID', models.ForeignKey(db_column='TEAM_ID', on_delete=django.db.models.deletion.CASCADE, to='admin_dashboard.availableteams')),
            ],
        ),
    ]
