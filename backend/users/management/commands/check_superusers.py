from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = "Muestra superusuarios en la DB actual"

    def handle(self, *args, **opts):
        User = get_user_model()
        su = User.objects.filter(is_superuser=True).values(
            'id', 'username', 'email', 'is_active'
        )
        count = su.count()
        self.stdout.write(self.style.SUCCESS(f"Superusers: {count}"))
        for row in su:
            self.stdout.write(f"- {row}")
