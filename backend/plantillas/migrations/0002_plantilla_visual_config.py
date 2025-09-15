from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("plantillas", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="plantilla",
            name="visual_config",
            field=models.JSONField(default=dict, blank=True),
        ),
    ]
