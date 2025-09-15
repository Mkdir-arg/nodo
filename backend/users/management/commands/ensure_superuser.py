import os

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = "Crea/asegura un superusuario a partir de envs DJANGO_SUPERUSER_*"

    def handle(self, *args, **opts):
        User = get_user_model()
        username = os.getenv('DJANGO_SUPERUSER_USERNAME', 'admin')
        email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
        password = os.getenv('DJANGO_SUPERUSER_PASSWORD', 'admin123')

        obj, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            },
        )
        if created:
            obj.set_password(password)
            obj.save()
            self.stdout.write(
                self.style.SUCCESS(f"Superuser creado: {username} / {email}")
            )
        else:
            if not obj.is_superuser or not obj.is_staff or not obj.is_active:
                obj.is_superuser = True
                obj.is_staff = True
                obj.is_active = True
                obj.save()
            self.stdout.write(self.style.WARNING(f"Superuser ya existía: {username}"))
