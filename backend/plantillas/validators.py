import re
from typing import Dict, Any, List

VALID_OPS = {"eq", "ne", "in", "nin", "gt", "gte", "lt", "lte", "contains"}
VALID_UI_HEADER_ACTIONS = {"navigate", "command"}
VALID_UI_HEADER_COMMANDS = {"print"}


def _collect_fields(nodes, acc):
    """Collect all fields from schema nodes into a dictionary."""
    for n in nodes:
        t = n.get("type")
        if t == "section":
            _collect_fields(n.get("children", []), acc)
        elif t == "group":
            for c in n.get("children", []):
                if "key" in c:
                    acc[f'{n["key"]}.{c["key"]}'] = c
        else:
            if "key" in n:
                acc[n["key"]] = n


def _walk(nodes, fn):
    """Walk through all nodes and apply function to each."""
    for n in nodes:
        fn(n)
        if n.get("type") in {"section", "group"}:
            _walk(n.get("children", []), fn)


def validate_conditions(schema: Dict[str, Any]):
    """Validate that all condition operators and keys are valid."""
    fields = {}
    _collect_fields(schema.get("nodes", []), fields)
    for f in fields.values():
        for c in f.get("condicionesOcultar") or []:
            if c.get("op") not in VALID_OPS:
                raise ValueError(f'Operador no válido: {c.get("op")}')
            if c.get("key") not in fields:
                raise ValueError(f'Key inexistente en condición: {c.get("key")}')


def validate_select_options(schema: Dict[str, Any]):
    """Validate that select fields have at least one option."""
    def fn(n):
        if n.get("type") in {"select", "dropdown", "multiselect", "select_with_filter"}:
            if len(n.get("options") or []) < 1:
                raise ValueError(f'{n.get("key")} requiere al menos 1 opción')
    _walk(schema.get("nodes", []), fn)


def validate_sum_sources(schema: Dict[str, Any]):
    """Validate that sum fields reference valid number fields."""
    fields = {}
    _collect_fields(schema.get("nodes", []), fields)
    for f in fields.values():
        if f.get("type") == "sum":
            for src in f.get("sources", []):
                if src not in fields or fields[src].get("type") != "number":
                    raise ValueError(f'sum "{f.get("key")}" referencia inválida: {src}')


def validate_non_empty_sections(schema: Dict[str, Any]):
    """Validate that sections are not empty."""
    for n in schema.get("nodes", []):
        if n.get("type") == "section" and len(n.get("children", [])) == 0:
            raise ValueError("Sección vacía")


def validate_unique_keys(schema: Dict[str, Any]):
    """Validate that all field keys are unique."""
    keys = set()
    def fn(n):
        k = n.get("key")
        if k:
            if k in keys:
                raise ValueError(f'Key duplicada: {k}')
            keys.add(k)
    _walk(schema.get("nodes", []), fn)


def validate_ui_header_config(schema: Dict[str, Any]):
    """Validate ui:header node configurations."""
    def fn(n):
        if n.get("type") == "ui:header" and n.get("variant") == "hero-glass":
            config = n.get("config", {})
            
            # Validate background
            bg = config.get("background", {})
            if bg.get("mode") != "image":
                raise ValueError("ui:header background.mode debe ser 'image'")
            if not isinstance(bg.get("imageUrl"), str) or len(bg.get("imageUrl", "")) == 0:
                raise ValueError("ui:header background.imageUrl debe ser string no vacío")
            
            # Validate card actions
            card = config.get("card", {})
            actions = card.get("actions", [])
            if not isinstance(actions, list):
                raise ValueError("ui:header card.actions debe ser array")
            
            for action in actions:
                if not isinstance(action, dict):
                    raise ValueError("ui:header action debe ser objeto")
                if action.get("type") not in VALID_UI_HEADER_ACTIONS:
                    raise ValueError(f"ui:header action.type inválido: {action.get('type')}")
                if action.get("type") == "command" and action.get("name") not in VALID_UI_HEADER_COMMANDS:
                    raise ValueError(f"ui:header command inválido: {action.get('name')}")
                if not isinstance(action.get("icon"), str) or len(action.get("icon", "")) == 0:
                    raise ValueError("ui:header action.icon debe ser string no vacío")
    
    _walk(schema.get("nodes", []), fn)


def validate_group_children(schema: Dict[str, Any]):
    """Validate that groups have children."""
    def fn(n):
        if n.get("type") == "group" and not n.get("children"):
            raise ValueError(f'Grupo {n.get("key")} sin hijos')
    _walk(schema.get("nodes", []), fn)


def run_schema_validations(schema: Dict[str, Any]):
    """Run all schema validations."""
    validate_conditions(schema)
    validate_select_options(schema)
    validate_sum_sources(schema)
    validate_non_empty_sections(schema)
    validate_unique_keys(schema)
    validate_group_children(schema)
    validate_ui_header_config(schema)
