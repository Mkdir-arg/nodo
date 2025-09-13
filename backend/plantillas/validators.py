import re
from typing import Dict, Any, List

VALID_OPS = {"eq","ne","in","nin","gt","gte","lt","lte","contains"}


def _collect_fields(nodes, acc):
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
    for n in nodes:
        fn(n)
        if n.get("type") in {"section", "group"}:
            _walk(n.get("children", []), fn)


def validate_conditions(schema: Dict[str, Any]):
    fields = {}
    _collect_fields(schema.get("nodes", []), fields)
    for f in fields.values():
        for c in f.get("condicionesOcultar") or []:
            if c.get("op") not in VALID_OPS:
                raise ValueError(f'Operador no válido: {c.get("op")}')
            if c.get("key") not in fields:
                raise ValueError(f'Key inexistente en condición: {c.get("key")}')


def validate_select_options(schema: Dict[str, Any]):
    def fn(n):
        if n.get("type") in {"select","dropdown","multiselect","select_with_filter"}:
            if len(n.get("options") or []) < 1:
                raise ValueError(f'{n.get("key")} requiere al menos 1 opción')
    _walk(schema.get("nodes", []), fn)


def validate_sum_sources(schema: Dict[str, Any]):
    fields = {}
    _collect_fields(schema.get("nodes", []), fields)
    for f in fields.values():
        if f.get("type") == "sum":
            for src in f.get("sources", []):
                if src not in fields or fields[src].get("type") != "number":
                    raise ValueError(f'sum "{f.get("key")}" referencia inválida: {src}')


def validate_non_empty_sections(schema: Dict[str, Any]):
    for n in schema.get("nodes", []):
        if n.get("type") == "section" and len(n.get("children", [])) == 0:
            raise ValueError("Sección vacía")


def validate_unique_keys(schema: Dict[str, Any]):
    keys = set()
    def fn(n):
        k = n.get("key")
        if k:
            if k in keys:
                raise ValueError(f'Key duplicada: {k}')
            keys.add(k)
    _walk(schema.get("nodes", []), fn)


def validate_group_children(schema: Dict[str, Any]):
    def fn(n):
        if n.get("type") == "group" and not n.get("children"):
            raise ValueError(f'Grupo {n.get("key")} sin hijos')
    _walk(schema.get("nodes", []), fn)


def run_schema_validations(schema: Dict[str, Any]):
    validate_conditions(schema)
    validate_select_options(schema)
    validate_sum_sources(schema)
    validate_non_empty_sections(schema)
    validate_unique_keys(schema)
    validate_group_children(schema)
