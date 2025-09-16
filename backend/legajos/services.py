from __future__ import annotations
from typing import Any, Dict

from .models import Legajo


class LegajoMetaService:
    @staticmethod
    def _count_fields(nodes, values):
        """Count total and filled fields in a node structure."""
        total = 0
        filled = 0
        
        for node in nodes or []:
            node_type = node.get("type")
            
            if node_type == "section":
                section_total, section_filled = LegajoMetaService._count_fields(
                    node.get("children", []), values
                )
                total += section_total
                filled += section_filled
            elif node_type == "group":
                # ignore groups for simplicity
                for child in node.get("children", []):
                    total += 1
                    if values.get(child.get("key")) not in (None, "", [], {}):
                        filled += 1
            else:
                total += 1
                if values.get(node.get("key")) not in (None, "", [], {}):
                    filled += 1
                    
        return total, filled

    @staticmethod
    def compute(legajo: Legajo) -> Dict[str, Any]:
        data = legajo.data or {}
        
        total, filled = LegajoMetaService._count_fields(
            legajo.plantilla.schema.get("nodes", []), data
        )
        completitud = int((filled / total) * 100) if total else 0

        counts = {
            "intervenciones": len(data.get("intervenciones", [])),
            "archivos": len(data.get("archivos", [])),
            "alertas_activas": len([a for a in data.get("alertas", []) if a.get("activa")]),
        }
        metrics = {
            "dias_sin_contacto": data.get("dias_sin_contacto", 0),
        }
        trends = {
            "intervenciones": data.get("trend_intervenciones", ""),
        }
        return {
            "completitud": completitud,
            "counts": counts,
            "metrics": metrics,
            "trends": trends,
        }
