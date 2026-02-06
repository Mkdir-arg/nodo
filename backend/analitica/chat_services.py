"""Servicios del chat analitico; sirven para encapsular logica de orquestacion."""

from __future__ import annotations

from typing import Any, Dict


def build_llm_unavailable_response(message: str, context: Dict[str, Any]) -> Dict[str, Any]:
    """Construye respuesta stub; sirve para avanzar sin integracion LLM real."""
    return {
        "ok": False,
        "error": "llm_unavailable",
        "detail": "LLM no configurado. Integracion pendiente con proveedor externo.",
        "reply": "LLM no configurado aun. Tu mensaje fue recibido.",
        "dsl": None,
        "results": None,
        "debug": {"message": message, "context": context},
    }
