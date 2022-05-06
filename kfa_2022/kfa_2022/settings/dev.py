from .base import * 

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []

# Database
# https://docs.djangoproject.com/en/4.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'kfa_db',
        'USER': 'kfa_admin',
        'PASSWORD': 'kfa_admin_oper',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}