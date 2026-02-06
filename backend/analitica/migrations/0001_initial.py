from django.db import migrations, models


class Migration(migrations.Migration):
    """Migracion inicial de analitica; sirve para registrar permisos."""

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="AnaliticaAccess",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
            ],
            options={
                "verbose_name": "Acceso analitica",
                "verbose_name_plural": "Accesos analitica",
                "permissions": [("use_analitica", "Can use analytics")],
                "default_permissions": (),
            },
        ),
    ]
