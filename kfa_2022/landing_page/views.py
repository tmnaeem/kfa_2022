from django.shortcuts import render
from django.core import serializers
from django.contrib.auth import authenticate, login
import json

def user_landing_page(request):
    context = {
        'title' : 'Widad K-League',
        'year' : 2022,
        'location' : 'home',
    }
    return render(request, 'landing_page/landing_page.html', context)