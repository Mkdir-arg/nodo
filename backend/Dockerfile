FROM mcr.microsoft.com/devcontainers/python:3.11

WORKDIR /app
RUN apt-get update && apt-get install -y \
    build-essential \
    default-libmysqlclient-dev \
    pkg-config \
    curl \
    && rm -rf /var/lib/apt/lists/*
COPY requirements/ /app/requirements/
RUN pip install -r requirements/base.txt
COPY . /app
EXPOSE 8000
