#!/bin/sh
python manage.py makemigrations --noinput
python manage.py migrate --noinput
python manage.py setup_initial_data
python manage.py collectstatic --noinput
exec "$@"
