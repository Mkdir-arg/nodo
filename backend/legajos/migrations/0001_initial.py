from django.db import migrations, models
import uuid


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('plantillas', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Legajo',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('data', models.JSONField()),
                ('grid_values', models.JSONField(null=True, blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('plantilla', models.ForeignKey(on_delete=models.deletion.PROTECT, related_name='legajos', to='plantillas.plantilla')),
            ],
            options={'ordering': ['-created_at']},
        ),
    ]
