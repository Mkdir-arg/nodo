FROM python:3.11-slim

WORKDIR /app
COPY . /app
RUN apt-get update \
    && apt-get install -y build-essential default-libmysqlclient-dev pkg-config \
    && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir -r requirements/base.txt

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
