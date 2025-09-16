#!/bin/sh
python manage.py makemigrations --noinput
python manage.py migrate --noinput
python manage.py create_superuser
python manage.py collectstatic --noinput
exec "$@"
