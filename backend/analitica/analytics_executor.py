"""Traduce el DSL analitico a ORM; sirve para ejecutar consultas seguras."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Mapping, Optional, Sequence, Tuple

from django.db.models import Q
from django.db.models import F
from django.db.models import Count
from django.db.models.fields.json import KeyTextTransform
from django.db.models.functions import Cast
from django.db.models import FloatField

from .analytics_dsl import DSLValidationError, normalize_field_type

SYSTEM_FIELD_MAP = {
    "id": "id",
    "plantilla_id": "plantilla_id",
    "created_at": "created_at",
    "updated_at": "updated_at",
    "search_document": "search_document",
}


@dataclass(frozen=True)
class ResolvedField:
    """Campo resuelto para filtros/orden; sirve para centralizar metadatos."""

    name: str
    lookup: str
    field_type: str
    is_system: bool
    json_path: Sequence[str]


def apply_list_query(
    queryset,
    dsl: Mapping[str, Any],
    allowed_fields: Mapping[str, Dict[str, Any]],
    *,
    default_order: Optional[Sequence[str]] = None,
) -> Tuple[Any, int]:
    """Aplica DSL list a un queryset; sirve para filtrar/ordenar/paginar."""
    if dsl.get("mode") != "list":
        raise DSLValidationError("only list mode is supported in executor v0")

    filters = dsl.get("filters")
    if filters is not None:
        queryset = queryset.filter(build_filter_q(filters, allowed_fields))

    order = dsl.get("order")
    if order:
        queryset = apply_ordering(queryset, order, allowed_fields)
    else:
        # Orden estable evita drift entre paginas; sirve para consistencia de paginado.
        queryset = queryset.order_by(*(default_order or ("-created_at",)))

    total = queryset.count()
    limit = dsl.get("limit")
    offset = dsl.get("offset", 0)
    if limit is not None:
        queryset = queryset[offset : offset + limit]

    return queryset, total


def apply_aggregate_query(
    queryset,
    dsl: Mapping[str, Any],
    allowed_fields: Mapping[str, Dict[str, Any]],
    *,
    default_order: Optional[Sequence[str]] = None,
) -> Tuple[List[Dict[str, Any]], int]:
    """Aplica DSL aggregate; sirve para devolver grupos y metricas."""
    if dsl.get("mode") != "aggregate":
        raise DSLValidationError("only aggregate mode is supported in executor v0")

    filters = dsl.get("filters")
    if filters is not None:
        queryset = queryset.filter(build_filter_q(filters, allowed_fields))

    group_by = dsl.get("group_by") or []
    if not group_by:
        raise DSLValidationError("group_by is required for aggregate mode")

    group_annotations: Dict[str, Any] = {}
    group_keys: List[str] = []
    group_aliases: Dict[str, str] = {}

    for idx, field in enumerate(group_by):
        resolved = resolve_field(field, allowed_fields)
        if resolved.field_type == "list":
            raise DSLValidationError("group_by does not support list fields in v0")
        if resolved.is_system:
            group_keys.append(resolved.lookup)
            group_aliases[field] = resolved.lookup
            continue

        alias = f"_group_{idx}"
        group_annotations[alias] = build_group_expr(resolved)
        group_keys.append(alias)
        group_aliases[field] = alias

    metric_annotations: Dict[str, Any] = {}
    metric_aliases: List[str] = []
    reserved_names = set(group_by) | set(group_aliases.values())
    for idx, metric in enumerate(dsl.get("metrics") or []):
        op = metric.get("op")
        if op != "count":
            raise DSLValidationError("metric.op only supports count in v0")
        field = metric.get("field")
        if field not in (None, "*"):
            raise DSLValidationError("metric.field not supported in executor v0")
        alias = metric.get("as") or "count"
        if alias in metric_annotations or alias in reserved_names:
            raise DSLValidationError("metric.as must be unique and not collide with group_by")
        metric_annotations[alias] = Count("id")
        metric_aliases.append(alias)

    if group_annotations:
        queryset = queryset.annotate(**group_annotations)
    queryset = queryset.values(*group_keys).annotate(**metric_annotations)

    order = dsl.get("order")
    if order:
        queryset = apply_aggregate_ordering(queryset, order, group_aliases, metric_aliases)
    else:
        order_fields = list(default_order or group_keys[:1])
        if order_fields:
            queryset = queryset.order_by(*order_fields)

    total = queryset.count()
    limit = dsl.get("limit")
    offset = dsl.get("offset", 0)
    if limit is not None:
        queryset = queryset[offset : offset + limit]

    raw_results = list(queryset)
    results = [_rename_group_keys(row, group_aliases) for row in raw_results]
    return results, total


def build_filter_q(expr: Mapping[str, Any], allowed_fields: Mapping[str, Dict[str, Any]]) -> Q:
    """Construye Q() desde filtros; sirve para componer condiciones seguras."""
    if "and" in expr or "or" in expr:
        key = "and" if "and" in expr else "or"
        items = expr.get(key) or []
        compound = Q()
        for item in items:
            child = build_filter_q(item, allowed_fields)
            compound = compound & child if key == "and" else compound | child
        return compound

    if "not" in expr:
        return ~build_filter_q(expr.get("not"), allowed_fields)

    return build_leaf_filter_q(expr, allowed_fields)


def build_leaf_filter_q(
    expr: Mapping[str, Any], allowed_fields: Mapping[str, Dict[str, Any]]
) -> Q:
    """Construye Q() para un filtro hoja; sirve para aplicar op/valor."""
    field = expr.get("field")
    op = expr.get("op")
    value = expr.get("value", None)
    resolved = resolve_field(field, allowed_fields)

    if op == "eq":
        return Q(**{resolved.lookup: value})
    if op == "ne":
        return ~Q(**{resolved.lookup: value})
    if op == "in":
        return _build_in_filter(resolved, value, negate=False)
    if op == "nin":
        return _build_in_filter(resolved, value, negate=True)
    if op in {"gt", "gte", "lt", "lte"}:
        return Q(**{f"{resolved.lookup}__{op}": value})
    if op == "contains":
        return _build_contains_filter(resolved, value)

    raise DSLValidationError("unsupported filter op in executor")


def apply_ordering(
    queryset,
    order: Iterable[Mapping[str, Any]],
    allowed_fields: Mapping[str, Dict[str, Any]],
) -> Any:
    """Aplica ordenamiento; sirve para respetar el DSL sin exponer SQL."""
    order_by_fields: List[str] = []
    annotations: Dict[str, Any] = {}

    for idx, item in enumerate(order):
        field = item.get("field")
        direction = item.get("dir", "asc")
        resolved = resolve_field(field, allowed_fields)

        if resolved.is_system:
            order_by_fields.append(
                f"-{resolved.lookup}" if direction == "desc" else resolved.lookup
            )
            continue

        alias = f"_order_{idx}"
        annotations[alias] = build_json_order_expr(resolved)
        order_by_fields.append(f"-{alias}" if direction == "desc" else alias)

    if annotations:
        queryset = queryset.annotate(**annotations)

    return queryset.order_by(*order_by_fields)


def build_json_order_expr(resolved: ResolvedField):
    """Crea expresion para ordenar JSON; sirve para ordenar campos dinamicos."""
    transform = _build_json_transform(resolved.json_path)
    if resolved.field_type == "numeric":
        return Cast(transform, output_field=FloatField())
    return transform


def build_group_expr(resolved: ResolvedField):
    """Crea expresion de grupo para JSON; sirve para agrupar por campos dinamicos."""
    transform = _build_json_transform(resolved.json_path)
    if resolved.field_type == "numeric":
        return Cast(transform, output_field=FloatField())
    return transform


def resolve_field(
    field: Any, allowed_fields: Mapping[str, Dict[str, Any]]
) -> ResolvedField:
    """Resuelve un campo DSL a lookup ORM; sirve para usar whitelists."""
    if not isinstance(field, str) or not field:
        raise DSLValidationError("field must be a string")

    meta = allowed_fields.get(field)
    if meta is None:
        raise DSLValidationError(f"field not allowed: {field}")

    if field in SYSTEM_FIELD_MAP:
        return ResolvedField(
            name=field,
            lookup=SYSTEM_FIELD_MAP[field],
            field_type=normalize_field_type(meta.get("type")),
            is_system=True,
            json_path=(),
        )

    json_path = tuple(part for part in field.split(".") if part)
    if not json_path:
        raise DSLValidationError("invalid field path")

    lookup = "grid_values__" + "__".join(json_path)
    return ResolvedField(
        name=field,
        lookup=lookup,
        field_type=normalize_field_type(meta.get("type")),
        is_system=False,
        json_path=json_path,
    )


def _build_json_transform(path: Sequence[str]):
    """Crea KeyTextTransform encadenado; sirve para claves JSON anidadas."""
    transform = KeyTextTransform(path[0], F("grid_values"))
    for key in path[1:]:
        transform = KeyTextTransform(key, transform)
    return transform


def _build_in_filter(resolved: ResolvedField, value: Any, *, negate: bool) -> Q:
    """Construye IN/NIN; sirve para listas y valores simples."""
    if resolved.field_type == "list":
        return _build_list_membership_filter(resolved, value, negate=negate)
    clause = Q(**{f"{resolved.lookup}__in": value})
    return ~clause if negate else clause


def _build_list_membership_filter(
    resolved: ResolvedField, value: Any, *, negate: bool
) -> Q:
    """Construye membership en listas; sirve para JSON arrays."""
    if not isinstance(value, list):
        value = [value]
    clauses = Q()
    for item in value:
        clauses |= Q(**{f"{resolved.lookup}__contains": [item]})
    return ~clauses if negate else clauses


def _build_contains_filter(resolved: ResolvedField, value: Any) -> Q:
    """Construye contains; sirve para strings o listas."""
    if resolved.field_type == "list":
        return Q(**{f"{resolved.lookup}__contains": [value]})
    return Q(**{f"{resolved.lookup}__icontains": value})


def apply_aggregate_ordering(
    queryset,
    order: Iterable[Mapping[str, Any]],
    group_aliases: Mapping[str, str],
    metric_aliases: Iterable[str],
) -> Any:
    """Aplica ordenamiento en aggregate; sirve para ordenar grupos/metricas."""
    metric_set = set(metric_aliases)
    order_by_fields: List[str] = []

    for item in order:
        field = item.get("field")
        direction = item.get("dir", "asc")

        if field in group_aliases:
            alias = group_aliases[field]
        elif field in metric_set:
            alias = field
        else:
            raise DSLValidationError(f"order field not allowed in aggregate: {field}")

        order_by_fields.append(f"-{alias}" if direction == "desc" else alias)

    return queryset.order_by(*order_by_fields)


def _rename_group_keys(row: Mapping[str, Any], group_aliases: Mapping[str, str]) -> Dict[str, Any]:
    """Renombra claves de grupo; sirve para devolver keys originales en respuesta."""
    result = dict(row)
    for original, alias in group_aliases.items():
        if alias == original:
            continue
        if alias in result:
            result[original] = result.pop(alias)
    return result
