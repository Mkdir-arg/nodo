from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group


class Command(BaseCommand):
    help = 'Setup initial system data: superuser and groups'

    def handle(self, *args, **options):
        # Crear superusuario
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@test.com', 'admin123')
            self.stdout.write(self.style.SUCCESS('✓ Superuser created: admin'))
        else:
            self.stdout.write(self.style.WARNING('- Superuser already exists: admin'))

        # Crear grupos del sistema
        groups = [
            'Administradores',
            'Usuarios',
            'Editores',
            'Supervisores',
        ]

        for group_name in groups:
            group, created = Group.objects.get_or_create(name=group_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Group created: {group_name}'))
            else:
                self.stdout.write(self.style.WARNING(f'- Group already exists: {group_name}'))

        self.stdout.write(self.style.SUCCESS('Initial data setup completed'))