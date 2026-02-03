import pytest

from analitica.analytics_dsl import collect_queryable_fields, validate_query_dsl


def _schema():
    """Crea schema minimo; sirve para probar validaciones del DSL."""
    return {
        "nodes": [
            {
                "type": "section",
                "id": "s1",
                "title": "Base",
                "children": [
                    {
                        "type": "text",
                        "id": "n1",
                        "key": "nombre",
                        "label": "Nombre",
                        "seMuestraEnGrilla": True,
                    },
                    {
                        "type": "number",
                        "id": "n2",
                        "key": "edad",
                        "label": "Edad",
                        "seMuestraEnGrilla": True,
                    },
                    {
                        "type": "text",
                        "id": "n3",
                        "key": "direccion",
                        "label": "Direccion",
                        "seMuestraEnGrilla": False,
                    },
                    {
                        "type": "group",
                        "id": "g1",
                        "key": "visitas",
                        "children": [
                            {
                                "type": "date",
                                "id": "g1d1",
                                "key": "fecha",
                                "label": "Fecha",
                                "seMuestraEnGrilla": True,
                            }
                        ],
                    },
                ],
            }
        ]
    }


def test_validate_query_dsl_list_ok():
    """Acepta list valido; sirve para asegurar el caso feliz."""
    allowed = collect_queryable_fields(_schema())
    payload = {
        "entity": "legajos",
        "mode": "list",
        "filters": {
            "and": [
                {"field": "nombre", "op": "contains", "value": "Ana"},
                {"field": "edad", "op": "gte", "value": 18},
            ]
        },
        "limit": 50,
        "offset": 0,
        "order": [{"field": "edad", "dir": "desc"}],
    }

    validate_query_dsl(payload, allowed_fields=allowed)


def test_validate_query_dsl_rejects_unknown_field():
    """Rechaza campos no permitidos; sirve para garantizar whitelist."""
    allowed = collect_queryable_fields(_schema())
    payload = {
        "entity": "legajos",
        "mode": "list",
        "filters": {"field": "direccion", "op": "eq", "value": "X"},
    }

    with pytest.raises(ValueError):
        validate_query_dsl(payload, allowed_fields=allowed)


def test_validate_query_dsl_rejects_bad_op():
    """Rechaza operadores invalidos; sirve para endurecer el contrato."""
    allowed = collect_queryable_fields(_schema())
    payload = {
        "entity": "legajos",
        "mode": "list",
        "filters": {"field": "nombre", "op": "between", "value": "X"},
    }

    with pytest.raises(ValueError):
        validate_query_dsl(payload, allowed_fields=allowed)


def test_validate_query_dsl_rejects_limit_out_of_range():
    """Rechaza limite fuera de rango; sirve para proteger performance."""
    allowed = collect_queryable_fields(_schema())
    payload = {
        "entity": "legajos",
        "mode": "list",
        "limit": 1000,
    }

    with pytest.raises(ValueError):
        validate_query_dsl(payload, allowed_fields=allowed, max_limit=100)


def test_validate_query_dsl_aggregate_ok():
    """Acepta aggregate valido; sirve para validar estructura futura."""
    allowed = collect_queryable_fields(_schema())
    payload = {
        "entity": "legajos",
        "mode": "aggregate",
        "group_by": ["nombre"],
        "metrics": [{"op": "count", "as": "total"}],
    }

    validate_query_dsl(payload, allowed_fields=allowed)
