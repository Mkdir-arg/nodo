#!/bin/bash

if [ "$SERVICE" = "backend" ]; then
    cd backend
    gunicorn --bind 0.0.0.0:$PORT config.wsgi:application
elif [ "$SERVICE" = "frontend" ]; then
    cd frontend
    npm start
fi