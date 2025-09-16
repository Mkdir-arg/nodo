# Generated migration for layout fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('plantillas', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='plantilla',
            name='layout_json',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name='plantilla',
            name='layout_version',
            field=models.PositiveIntegerField(default=1),
        ),
    ]