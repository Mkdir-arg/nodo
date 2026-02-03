"""Servicios para catalogo analitico y cache; sirven para evitar recomputar esquemas."""

from __future__ import annotations

from typing import Any, Dict, Mapping

from django.core.cache import cache

from plantillas.models import Plantilla

from .analytics_dsl import allowed_ops_for_type, collect_queryable_fields

DEFAULT_CATALOG_TTL_SECONDS = 60 * 30
SENSITIVE_FIELDS = {"search_document"}


def build_catalog(
    schema: Mapping[str, Any],
    *,
    only_grid: bool = True,
    include_system_fields: bool = True,
    include_sensitive: bool = False,
) -> Dict[str, Any]:
    """Construye el catalogo consultable; sirve para exponer campos y operadores permitidos."""
    fields = collect_queryable_fields(
        schema,
        only_grid=only_grid,
        include_system_fields=include_system_fields,
    )

    if not include_sensitive:
        for key in list(fields.keys()):
            if key in SENSITIVE_FIELDS:
                fields.pop(key)

    catalog_fields = []
    for key, meta in fields.items():
        catalog_fields.append(
            {
                "key": key,
                "type": meta.get("type") or "string",
                "label": meta.get("label"),
                "ops": list(allowed_ops_for_type(meta.get("type"))),
                "system": bool(meta.get("system")),
                "group": bool(meta.get("group")),
                "sensitive": key in SENSITIVE_FIELDS,
            }
        )

    catalog_fields.sort(key=lambda item: item["key"])

    return {
        "version": 0,
        "entity": "legajos",
        "fields": catalog_fields,
        "meta": {
            "only_grid": only_grid,
            "include_system_fields": include_system_fields,
            "include_sensitive": include_sensitive,
        },
    }


def get_catalog_for_plantilla(
    plantilla: Plantilla,
    *,
    only_grid: bool = True,
    include_system_fields: bool = True,
    include_sensitive: bool = False,
) -> Dict[str, Any]:
    """Devuelve catalogo cacheado por plantilla; sirve para eficiencia y consistencia."""
    cache_key = _catalog_cache_key(
        plantilla,
        only_grid=only_grid,
        include_system_fields=include_system_fields,
        include_sensitive=include_sensitive,
    )
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    catalog = build_catalog(
        plantilla.schema,
        only_grid=only_grid,
        include_system_fields=include_system_fields,
        include_sensitive=include_sensitive,
    )
    cache.set(cache_key, catalog, DEFAULT_CATALOG_TTL_SECONDS)
    return catalog


def _catalog_cache_key(
    plantilla: Plantilla,
    *,
    only_grid: bool,
    include_system_fields: bool,
    include_sensitive: bool,
) -> str:
    """Construye la clave de cache; sirve para invalidar cuando cambia la plantilla."""
    updated_at = plantilla.updated_at.isoformat() if plantilla.updated_at else ""
    flags = f"og{int(only_grid)}-is{int(include_system_fields)}-sen{int(include_sensitive)}"
    # updated_at fuerza invalidacion cuando cambia la plantilla; sirve para coherencia.
    return f"analytics:catalog:{plantilla.id}:{updated_at}:{flags}"
