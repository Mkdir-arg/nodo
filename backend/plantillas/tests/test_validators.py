import pytest
from plantillas.validators import run_schema_validations


def test_run_validations_ok():
    schema = {
        "nodes": [
            {"type": "section", "children": [
                {"type": "text", "id": "a", "key": "a", "label": "A"},
                {"type": "number", "id": "b", "key": "b", "label": "B"},
                {"type": "sum", "id": "s", "key": "s", "label": "S", "sources": ["b"]},
            ]}
        ]
    }
    run_schema_validations(schema)


def test_run_validations_fail_duplicate_key():
    schema = {"nodes": [{"type": "section", "children": [
        {"type": "text", "id": "a", "key": "dup", "label": "A"},
        {"type": "text", "id": "b", "key": "dup", "label": "B"},
    ]}]}
    with pytest.raises(ValueError):
        run_schema_validations(schema)
