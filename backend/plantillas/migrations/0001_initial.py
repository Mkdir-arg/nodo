from django.db import migrations, models
import uuid
from django.db.models.functions import Lower


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Plantilla',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('nombre', models.CharField(max_length=255)),
                ('descripcion', models.TextField(null=True, blank=True)),
                ('schema', models.JSONField()),
                ('version', models.PositiveIntegerField(default=1)),
                ('estado', models.CharField(choices=[('ACTIVO', 'ACTIVO'), ('INACTIVO', 'INACTIVO')], default='ACTIVO', max_length=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={'ordering': ['-updated_at']},
        ),
        migrations.AddConstraint(
            model_name='plantilla',
            constraint=models.UniqueConstraint(Lower('nombre'), name='uq_plantilla_nombre_ci'),
        ),
    ]
