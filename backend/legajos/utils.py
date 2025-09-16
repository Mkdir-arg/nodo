import json
from typing import Any, Dict, Iterable, Optional


def _as_iterable(value: Any) -> Iterable[Any]:
    if value is None:
        return []
    if isinstance(value, (list, tuple, set)):
        return value
    return [value]


def guess_legajo_display(
    data: Any, grid_values: Any, fallback: str
) -> Optional[str]:
    """Compute the display string for a legajo instance."""

    def pick_name(container: Dict[str, Any]) -> Optional[str]:
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
            if isinstance(container, dict):
                guess = pick_name(container)
                if guess:
                    return guess

        guess = pick_name(data)
        if guess:
            return guess

    return fallback


def build_search_document(data: Any, grid_values: Any, fallback: str) -> str:
    """Create the search document used for database level searches."""

    parts = []
    display = guess_legajo_display(data, grid_values, fallback)
    if display:
        parts.append(str(display))

    for source in (grid_values, data):
        if isinstance(source, dict):
            parts.append(json.dumps(source, ensure_ascii=False, sort_keys=True))
        elif isinstance(source, list):
            parts.append(json.dumps(source, ensure_ascii=False, sort_keys=True))

    return " ".join(filter(None, parts))

