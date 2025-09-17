#!/bin/bash
export DJANGO_SETTINGS_MODULE=config.settings_prod
python manage.py migrate
python manage.py collectstatic --noinput
gunicorn --bind 0.0.0.0:$PORT config.wsgi:application