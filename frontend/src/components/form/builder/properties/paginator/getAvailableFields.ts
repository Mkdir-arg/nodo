export type AvailableField = {
  key: string;
  label?: string;
  type: string;
  id?: string;
};

export function getAvailableFields(sections: any[]): AvailableField[] {
  const fields: AvailableField[] = [];
  const seenKeys = new Set<string>();

  const processNode = (node: any) => {
    // Ignorar UI nodes
    if (node.kind === 'ui' || node.type?.startsWith('ui:')) return;
    
    // Si tiene key, agregarlo
    if (node.key && typeof node.key === 'string' && node.key.trim()) {
      if (seenKeys.has(node.key)) {
        console.warn(`[getAvailableFields] Key duplicada detectada: "${node.key}"`);
        return;
      }
      
      seenKeys.add(node.key);
      fields.push({
        key: node.key,
        label: node.label || node.key,
        type: node.type || 'unknown',
        id: node.id
      });
    }

    // Procesar children si es un contenedor
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(processNode);
    }
  };

  // Recorrer todas las secciones
  sections.forEach(section => {
    const nodes = section.nodes || section.children || [];
    nodes.forEach(processNode);
  });

  // Ordenar por label
  return fields.sort((a, b) => 
    (a.label || a.key).localeCompare(b.label || b.key)
  );
}
