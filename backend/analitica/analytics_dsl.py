"""Validadores y utilidades del DSL analitico; sirven para asegurar contratos seguros."""

from __future__ import annotations

from typing import Any, Dict, Iterable, Mapping, MutableMapping, Optional, Sequence


class DSLValidationError(ValueError):
    """Error del DSL; sirve para reportar validaciones fallidas de manera consistente."""


VALID_OPS = {"eq", "ne", "in", "nin", "gt", "gte", "lt", "lte", "contains"}

STRING_TYPES = {
    "text",
    "textarea",
    "email",
    "phone",
    "cuit_razon_social",
    "document",
    "image",
    "url",
    "color",
    "password",
    "code",
    "tag",
    "select",
    "dropdown",
    "radio",
    "select_with_filter",
}
NUMERIC_TYPES = {"number", "sum", "currency", "slider", "rating"}
DATE_TYPES = {"date", "time", "datetime"}
BOOLEAN_TYPES = {"checkbox", "switch", "boolean"}
LIST_TYPES = {"multiselect"}

UI_ONLY_TYPES = {"info"}

SYSTEM_FIELDS: Dict[str, Dict[str, Any]] = {
    "id": {"type": "uuid", "system": True},
    "plantilla_id": {"type": "uuid", "system": True},
    "created_at": {"type": "datetime", "system": True},
    "updated_at": {"type": "datetime", "system": True},
    "search_document": {"type": "text", "system": True},
}

DEFAULT_MAX_LIMIT = 100
DEFAULT_MAX_DEPTH = 5
DEFAULT_MAX_FILTERS = 50
DEFAULT_MAX_ORDER_FIELDS = 3
DEFAULT_MAX_GROUP_BY_FIELDS = 3
DEFAULT_MAX_METRICS = 5
DEFAULT_MAX_LIST_LENGTH = 50
DEFAULT_MAX_STRING_LENGTH = 500
DEFAULT_LIMIT = 50
DEFAULT_OFFSET = 0


def allowed_ops_for_type(field_type: Optional[str]) -> Sequence[str]:
    """Devuelve operadores permitidos por tipo; sirve para alinear catalogo y validacion."""
    normalized = normalize_field_type(field_type)
    if normalized == "numeric":
        return ("eq", "ne", "gt", "gte", "lt", "lte", "in", "nin")
    if normalized == "date":
        return ("eq", "ne", "gt", "gte", "lt", "lte", "in", "nin")
    if normalized == "boolean":
        return ("eq", "ne")
    if normalized == "list":
        return ("contains", "in", "nin")
    return ("eq", "ne", "contains", "in", "nin")


def collect_queryable_fields(
    schema: Mapping[str, Any],
    *,
    only_grid: bool = True,
    include_groups: bool = False,
    include_system_fields: bool = True,
) -> Dict[str, Dict[str, Any]]:
    """Recolecta campos consultables del schema; sirve para construir el catalogo permitido."""
    fields: Dict[str, Dict[str, Any]] = {}
    if include_system_fields:
        fields.update(SYSTEM_FIELDS)

    if not isinstance(schema, Mapping):
        return fields

    def should_include(node: Mapping[str, Any]) -> bool:
        """Decide si un nodo es consultable; sirve para excluir UI y campos no visibles."""
        if node.get("type") in UI_ONLY_TYPES:
            return False
        if isinstance(node.get("type"), str) and node.get("type").startswith("ui:"):
            return False
        if only_grid and not node.get("seMuestraEnGrilla"):
            return False
        return True

    def visit(nodes: Iterable[Any], parent_group: Optional[str] = None) -> None:
        """Recorre nodos y recolecta campos; sirve para armar el set consultable."""
        for node in nodes or []:
            if not isinstance(node, Mapping):
                continue
            node_type = node.get("type")
            if node_type == "section":
                visit(node.get("children", []), parent_group)
                continue
            if node_type == "group":
                if include_groups:
                    group_key = node.get("key")
                    visit(node.get("children", []), group_key)
                continue

            key = node.get("key")
            if not key or not should_include(node):
                continue

            full_key = f"{parent_group}.{key}" if parent_group else key
            if full_key in fields:
                continue

            fields[full_key] = {
                "type": node.get("type"),
                "label": node.get("label"),
                "group": bool(parent_group),
                "system": False,
            }

    visit(schema.get("nodes", []))
    return fields


def normalize_dsl(
    payload: Mapping[str, Any],
    *,
    default_limit: int = DEFAULT_LIMIT,
    default_offset: int = DEFAULT_OFFSET,
    max_limit: int = DEFAULT_MAX_LIMIT,
) -> Dict[str, Any]:
    """Normaliza el DSL con defaults; sirve para ejecucion consistente."""
    if not isinstance(payload, Mapping):
        raise DSLValidationError("dsl must be an object")

    normalized: Dict[str, Any] = {
        "entity": payload.get("entity"),
        "mode": payload.get("mode"),
    }

    for key in ("filters", "order", "group_by", "metrics"):
        if key in payload:
            normalized[key] = payload.get(key)

    if "limit" in payload:
        normalized["limit"] = payload.get("limit")
    else:
        normalized["limit"] = min(default_limit, max_limit)

    if "offset" in payload:
        normalized["offset"] = payload.get("offset")
    else:
        normalized["offset"] = default_offset

    return normalized


def validate_query_dsl(
    payload: Mapping[str, Any],
    allowed_fields: Optional[Mapping[str, Dict[str, Any]]] = None,
    *,
    max_limit: int = DEFAULT_MAX_LIMIT,
    max_depth: int = DEFAULT_MAX_DEPTH,
    max_filters: int = DEFAULT_MAX_FILTERS,
    max_order_fields: int = DEFAULT_MAX_ORDER_FIELDS,
    max_group_by_fields: int = DEFAULT_MAX_GROUP_BY_FIELDS,
    max_metrics: int = DEFAULT_MAX_METRICS,
    max_list_length: int = DEFAULT_MAX_LIST_LENGTH,
    max_string_length: int = DEFAULT_MAX_STRING_LENGTH,
    allow_unlisted_fields: bool = False,
    strict: bool = True,
) -> None:
    """Valida un DSL analitico; sirve para bloquear consultas invalidas o peligrosas."""
    if not isinstance(payload, Mapping):
        raise DSLValidationError("dsl must be an object")

    allowed_fields = _normalize_allowed_fields(allowed_fields)

    allowed_top_keys = {
        "entity",
        "mode",
        "filters",
        "limit",
        "offset",
        "order",
        "group_by",
        "metrics",
    }
    if strict:
        extra_keys = set(payload.keys()) - allowed_top_keys
        if extra_keys:
            raise DSLValidationError(f"unknown top-level keys: {sorted(extra_keys)}")

    entity = payload.get("entity")
    if entity != "legajos":
        raise DSLValidationError("dsl.entity must be 'legajos'")

    mode = payload.get("mode")
    if mode not in {"list", "aggregate"}:
        raise DSLValidationError("dsl.mode must be 'list' or 'aggregate'")

    filters = payload.get("filters")
    if filters is not None:
        counter = {"count": 0}
        _validate_filter_expr(
            filters,
            allowed_fields,
            counter,
            depth=0,
            max_depth=max_depth,
            max_filters=max_filters,
            max_list_length=max_list_length,
            max_string_length=max_string_length,
            allow_unlisted_fields=allow_unlisted_fields,
        )

    limit = payload.get("limit")
    if limit is not None:
        if not isinstance(limit, int):
            raise DSLValidationError("dsl.limit must be an integer")
        if limit < 1 or limit > max_limit:
            raise DSLValidationError("dsl.limit out of range")

    offset = payload.get("offset")
    if offset is not None:
        if not isinstance(offset, int):
            raise DSLValidationError("dsl.offset must be an integer")
        if offset < 0:
            raise DSLValidationError("dsl.offset must be >= 0")

    order = payload.get("order")
    if order is not None:
        _validate_order(order, allowed_fields, max_order_fields, allow_unlisted_fields)

    if mode == "list":
        if payload.get("group_by") is not None or payload.get("metrics") is not None:
            raise DSLValidationError("dsl.group_by/metrics only allowed in aggregate mode")
        return

    group_by = payload.get("group_by")
    if group_by is not None:
        _validate_group_by(group_by, allowed_fields, max_group_by_fields, allow_unlisted_fields)

    metrics = payload.get("metrics")
    if metrics is None:
        raise DSLValidationError("dsl.metrics required for aggregate mode")
    reserved_names = group_by if isinstance(group_by, list) else None
    _validate_metrics(
        metrics,
        allowed_fields,
        max_metrics,
        allow_unlisted_fields,
        reserved_names=reserved_names,
    )


def _normalize_allowed_fields(
    allowed_fields: Optional[Mapping[str, Dict[str, Any]]]
) -> Dict[str, Dict[str, Any]]:
    """Normaliza allowed_fields; sirve para evitar tipos inesperados."""
    if allowed_fields is None:
        return {}
    if isinstance(allowed_fields, Mapping):
        return dict(allowed_fields)
    return {}


def _validate_filter_expr(
    expr: Mapping[str, Any],
    allowed_fields: Mapping[str, Dict[str, Any]],
    counter: MutableMapping[str, int],
    *,
    depth: int,
    max_depth: int,
    max_filters: int,
    max_list_length: int,
    max_string_length: int,
    allow_unlisted_fields: bool,
) -> None:
    """Valida el arbol de filtros; sirve para controlar profundidad y forma."""
    if depth > max_depth:
        raise DSLValidationError("filters nested too deep")
    if not isinstance(expr, Mapping):
        raise DSLValidationError("filter expression must be an object")

    if "and" in expr or "or" in expr:
        key = "and" if "and" in expr else "or"
        items = expr.get(key)
        if not isinstance(items, list) or not items:
            raise DSLValidationError(f"filter.{key} must be a non-empty list")
        for item in items:
            _validate_filter_expr(
                item,
                allowed_fields,
                counter,
                depth=depth + 1,
                max_depth=max_depth,
                max_filters=max_filters,
                max_list_length=max_list_length,
                max_string_length=max_string_length,
                allow_unlisted_fields=allow_unlisted_fields,
            )
        return

    if "not" in expr:
        item = expr.get("not")
        if not isinstance(item, Mapping):
            raise DSLValidationError("filter.not must be an object")
        _validate_filter_expr(
            item,
            allowed_fields,
            counter,
            depth=depth + 1,
            max_depth=max_depth,
            max_filters=max_filters,
            max_list_length=max_list_length,
            max_string_length=max_string_length,
            allow_unlisted_fields=allow_unlisted_fields,
        )
        return

    _validate_leaf_filter(
        expr,
        allowed_fields,
        counter,
        max_filters,
        max_list_length,
        max_string_length,
        allow_unlisted_fields,
    )


def _validate_leaf_filter(
    expr: Mapping[str, Any],
    allowed_fields: Mapping[str, Dict[str, Any]],
    counter: MutableMapping[str, int],
    max_filters: int,
    max_list_length: int,
    max_string_length: int,
    allow_unlisted_fields: bool,
) -> None:
    """Valida un filtro hoja; sirve para asegurar campo/op/valor coherentes."""
    field = expr.get("field")
    op = expr.get("op")

    if not isinstance(field, str) or not field:
        raise DSLValidationError("filter.field must be a non-empty string")
    if not allow_unlisted_fields and field not in allowed_fields:
        raise DSLValidationError(f"filter.field not allowed: {field}")
    if op not in VALID_OPS:
        raise DSLValidationError(f"filter.op invalid: {op}")

    counter["count"] += 1
    if counter["count"] > max_filters:
        raise DSLValidationError("too many filters")

    value = expr.get("value", None)
    field_meta = allowed_fields.get(field, {})
    field_type = normalize_field_type(field_meta.get("type"))
    if op not in allowed_ops_for_type(field_meta.get("type")):
        raise DSLValidationError("filter.op not supported for field type")

    _validate_value_for_op(
        value,
        op,
        field_type,
        max_list_length=max_list_length,
        max_string_length=max_string_length,
    )


def _validate_value_for_op(
    value: Any,
    op: str,
    field_type: str,
    *,
    max_list_length: int,
    max_string_length: int,
) -> None:
    """Valida un valor segun operador y tipo; sirve para evitar coerciones peligrosas."""
    if op in {"in", "nin"}:
        if not isinstance(value, list) or not value:
            raise DSLValidationError("filter.value must be a non-empty list for in/nin")
        if len(value) > max_list_length:
            raise DSLValidationError("filter.value list too long")
        for item in value:
            _validate_scalar_value(item, field_type, max_string_length)
        return

    if op in {"gt", "gte", "lt", "lte"}:
        if field_type not in {"numeric", "date"}:
            raise DSLValidationError("filter.op not supported for field type")
        _validate_scalar_value(value, field_type, max_string_length)
        return

    if op == "contains":
        if field_type in {"numeric", "boolean"}:
            raise DSLValidationError("filter.contains not supported for field type")
        _validate_scalar_value(value, field_type, max_string_length)
        return

    if op in {"eq", "ne"}:
        if value is None:
            return
        _validate_scalar_value(value, field_type, max_string_length)
        return

    raise DSLValidationError("unsupported filter op")


def _validate_scalar_value(value: Any, field_type: str, max_string_length: int) -> None:
    """Valida un valor escalar; sirve para restringir tipos y tamanos."""
    if field_type == "boolean":
        if not isinstance(value, bool):
            raise DSLValidationError("filter.value must be boolean")
        return

    if field_type == "numeric":
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise DSLValidationError("filter.value must be a number")
        return

    if field_type == "date":
        if not isinstance(value, str) or not value:
            raise DSLValidationError("filter.value must be a date string")
        if len(value) > max_string_length:
            raise DSLValidationError("filter.value too long")
        return

    if isinstance(value, str):
        if not value:
            raise DSLValidationError("filter.value must be non-empty")
        if len(value) > max_string_length:
            raise DSLValidationError("filter.value too long")
        return

    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return

    if isinstance(value, bool):
        return

    raise DSLValidationError("filter.value invalid")


def normalize_field_type(field_type: Optional[str]) -> str:
    """Normaliza el tipo de campo; sirve para reglas uniformes de validacion."""
    if not field_type:
        return "string"
    field_type = str(field_type).lower()
    if field_type in NUMERIC_TYPES:
        return "numeric"
    if field_type in DATE_TYPES:
        return "date"
    if field_type in BOOLEAN_TYPES:
        return "boolean"
    if field_type in LIST_TYPES:
        return "list"
    return "string"


def _validate_order(
    order: Any,
    allowed_fields: Mapping[str, Dict[str, Any]],
    max_order_fields: int,
    allow_unlisted_fields: bool,
) -> None:
    """Valida el ordenamiento; sirve para evitar campos no permitidos."""
    if not isinstance(order, list) or not order:
        raise DSLValidationError("dsl.order must be a non-empty list")
    if len(order) > max_order_fields:
        raise DSLValidationError("too many order fields")
    for item in order:
        if not isinstance(item, Mapping):
            raise DSLValidationError("dsl.order items must be objects")
        field = item.get("field")
        if not isinstance(field, str) or not field:
            raise DSLValidationError("dsl.order.field must be a string")
        if not allow_unlisted_fields and field not in allowed_fields:
            raise DSLValidationError(f"dsl.order.field not allowed: {field}")
        direction = item.get("dir", "asc")
        if direction not in {"asc", "desc"}:
            raise DSLValidationError("dsl.order.dir must be asc or desc")


def _validate_group_by(
    group_by: Any,
    allowed_fields: Mapping[str, Dict[str, Any]],
    max_group_by_fields: int,
    allow_unlisted_fields: bool,
) -> None:
    """Valida group_by; sirve para limitar dimensiones permitidas."""
    if not isinstance(group_by, list) or not group_by:
        raise DSLValidationError("dsl.group_by must be a non-empty list")
    if len(group_by) > max_group_by_fields:
        raise DSLValidationError("too many group_by fields")
    for field in group_by:
        if not isinstance(field, str) or not field:
            raise DSLValidationError("dsl.group_by field must be a string")
        if not allow_unlisted_fields and field not in allowed_fields:
            raise DSLValidationError(f"dsl.group_by field not allowed: {field}")


def _validate_metrics(
    metrics: Any,
    allowed_fields: Mapping[str, Dict[str, Any]],
    max_metrics: int,
    allow_unlisted_fields: bool,
    *,
    reserved_names: Optional[Sequence[str]] = None,
) -> None:
    """Valida metrics; sirve para limitar agregaciones soportadas."""
    if not isinstance(metrics, list) or not metrics:
        raise DSLValidationError("dsl.metrics must be a non-empty list")
    if len(metrics) > max_metrics:
        raise DSLValidationError("too many metrics")
    seen_aliases = set()
    reserved = set(reserved_names or [])
    for metric in metrics:
        if not isinstance(metric, Mapping):
            raise DSLValidationError("metric must be an object")
        op = metric.get("op")
        if op != "count":
            raise DSLValidationError("metric.op only supports count in v0")
        field = metric.get("field")
        if field is not None:
            if field != "*":
                raise DSLValidationError("metric.field not supported in v0")
        alias = metric.get("as")
        if alias is not None and (not isinstance(alias, str) or not alias):
            raise DSLValidationError("metric.as must be a non-empty string")
        alias_name = alias or "count"
        if alias_name in seen_aliases or alias_name in reserved:
            raise DSLValidationError("metric.as must be unique and not collide with group_by")
        seen_aliases.add(alias_name)
