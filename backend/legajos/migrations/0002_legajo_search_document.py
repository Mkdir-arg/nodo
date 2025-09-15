from django.db import migrations, models
import json


def _as_iterable(value):
    if value is None:
        return []
    if isinstance(value, (list, tuple, set)):
        return value
    return [value]


def _guess_display(data, grid_values, fallback):
    def pick_name(container):
        if not isinstance(container, dict):
            return None
        apellido = (
            container.get("apellido")
            or container.get("last_name")
            or container.get("apellidos")
        )
        nombre = (
            container.get("nombre")
            or container.get("first_name")
            or container.get("nombres")
        )
        if apellido and nombre:
            return f"{apellido}, {nombre}"
        if nombre:
            return str(nombre)
        if apellido:
            return str(apellido)
        return None

    for container in _as_iterable(grid_values):
        if isinstance(container, dict):
            display = container.get("display") or container.get("nombre")
            if display:
                return str(display)

    if isinstance(data, dict):
        display = data.get("display")
        if display:
            return str(display)

        for key in ("ciudadano", "persona", "titular"):
            container = data.get(key)
            guess = pick_name(container)
            if guess:
                return guess

        guess = pick_name(data)
        if guess:
            return guess

    return fallback


def _build_search_document(data, grid_values, fallback):
    parts = []
    display = _guess_display(data, grid_values, fallback)
    if display:
        parts.append(str(display))

    for source in (grid_values, data):
        if isinstance(source, dict):
            parts.append(json.dumps(source, ensure_ascii=False, sort_keys=True))
        elif isinstance(source, list):
            parts.append(json.dumps(source, ensure_ascii=False, sort_keys=True))

    return " ".join(filter(None, parts))


def populate_search_document(apps, schema_editor):
    Legajo = apps.get_model("legajos", "Legajo")
    for legajo in Legajo.objects.all().iterator():
        document = _build_search_document(
            getattr(legajo, "data", {}),
            getattr(legajo, "grid_values", {}),
            str(getattr(legajo, "id", "")),
        )
        Legajo.objects.filter(pk=legajo.pk).update(search_document=document)


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("legajos", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="legajo",
            name="search_document",
            field=models.TextField(blank=True, db_index=True, default=""),
        ),
        migrations.RunPython(populate_search_document, noop),
    ]
