def build_grid_values(schema, data):
    """Build grid values from schema and data for display purposes."""
    if not isinstance(schema, dict) or not isinstance(data, dict):
        return {}
        
    grid_nodes = {}
    
    def collect_grid_nodes(nodes, depth=0):
        """Recursively collect nodes that should be shown in grid."""
        if depth > 100:  # Prevent infinite recursion
            return
            
        for node in nodes:
            if not isinstance(node, dict):
                continue
                
            node_type = node.get("type")
            
            if node_type == "section":
                collect_grid_nodes(node.get("children", []), depth + 1)
            elif node_type == "group":
                # Groups are ignored for grid display
                continue
            else:
                if node.get("seMuestraEnGrilla"):
                    key = node.get("key")
                    if key:
                        grid_nodes[key] = data.get(key)
    
    collect_grid_nodes(schema.get("nodes", []))
    return grid_nodes
