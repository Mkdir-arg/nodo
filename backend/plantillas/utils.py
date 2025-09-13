def build_grid_values(schema, data):
    nodes = {}
    def walk(ns):
        for n in ns:
            if n.get("type") == "section":
                walk(n.get("children", []))
            elif n.get("type") == "group":
                # ignore groups for grid
                continue
            else:
                if n.get("seMuestraEnGrilla"):
                    nodes[n["key"]] = data.get(n["key"])
    walk(schema.get("nodes", []))
    return nodes
