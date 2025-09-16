import os

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = "Crea/asegura un superusuario a partir de envs DJANGO_SUPERUSER_*"

    def handle(self, *args, **opts):
        from django.db import DatabaseError
        
        User = get_user_model()
        username = os.getenv('DJANGO_SUPERUSER_USERNAME')
        email = os.getenv('DJANGO_SUPERUSER_EMAIL')
        password = os.getenv('DJANGO_SUPERUSER_PASSWORD')

        if not username or not email or not password:
            self.stdout.write(
                self.style.ERROR(
                    "Missing required environment variables: "
                    "DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_EMAIL, DJANGO_SUPERUSER_PASSWORD"
                )
            )
            return

        # Validate minimum security requirements
        if len(password) < 8:
            self.stdout.write(
                self.style.ERROR("Password must be at least 8 characters long")
            )
            return
        
        # Sanitize inputs
        username = username.strip()
        email = email.strip()
        
        # Additional validation
        if '@' not in email or len(email) < 5:
            self.stdout.write(
                self.style.ERROR("Invalid email format")
            )
            return

        try:
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
                from django.contrib.auth.password_validation import validate_password
                try:
                    validate_password(password, obj)
                    obj.set_password(password)
                    obj.save()
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f"Password validation failed: {e}")
                    )
                    obj.delete()  # Clean up created user
                    return
                self.stdout.write(
                    self.style.SUCCESS(f"Superuser creado: {username} / {email}")
                )
            else:
                # Only update if user explicitly allows it via environment
                if os.getenv('DJANGO_SUPERUSER_UPDATE_EXISTING', '').lower() == 'true':
                    if not obj.is_superuser or not obj.is_staff or not obj.is_active:
                        obj.is_superuser = True
                        obj.is_staff = True
                        obj.is_active = True
                        obj.save()
                        self.stdout.write(
                            self.style.SUCCESS(f"Superuser actualizado: {username}")
                        )
                    else:
                        self.stdout.write(
                            self.style.WARNING(f"Superuser ya existía: {username}")
                        )
                else:
                    self.stdout.write(
                        self.style.WARNING(f"Superuser ya existe: {username}. Use DJANGO_SUPERUSER_UPDATE_EXISTING=true para actualizar.")
                    )
        except DatabaseError as e:
            self.stdout.write(
                self.style.ERROR(f"Database error: {e}")
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"Unexpected error: {e}")
            )
