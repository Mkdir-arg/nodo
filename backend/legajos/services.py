from __future__ import annotations
from typing import Any, Dict

from .models import Legajo


class LegajoMetaService:
    @staticmethod
    def compute(legajo: Legajo) -> Dict[str, Any]:
        data = legajo.data or {}

        def count_fields(nodes, values):
            total = 0
            filled = 0
            for n in nodes or []:
                t = n.get("type")
                if t == "section":
                    t_tot, t_fill = count_fields(n.get("children", []), values)
                    total += t_tot
                    filled += t_fill
                elif t == "group":
                    # ignore groups for simplicity
                    for c in n.get("children", []):
                        total += 1
                        if values.get(c.get("key")) not in (None, "", [], {}):
                            filled += 1
                else:
                    total += 1
                    if values.get(n.get("key")) not in (None, "", [], {}):
                        filled += 1
            return total, filled

        total, filled = count_fields(legajo.plantilla.schema.get("nodes", []), data)
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
