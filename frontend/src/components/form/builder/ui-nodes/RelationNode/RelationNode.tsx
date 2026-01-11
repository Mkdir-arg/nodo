'use client';

import { RelationNodeRuntime } from './RelationNodeRuntime';
import type { RelationNode } from './types';

interface RelationNodeProps {
  node: RelationNode;
  mode?: 'create' | 'edit' | 'view';
  legajoId?: string;
  data?: Record<string, any>;
  meta?: Record<string, any>;
  context?: Record<string, any>;
}

export function RelationNodeComponent({ 
  node, 
  mode = 'view',
  legajoId,
  data,
  meta,
  context 
}: RelationNodeProps) {
  // TODO: Implementar lógica de carga de relaciones desde API
  // TODO: Implementar handlers para agregar/quitar relaciones
  // TODO: Implementar búsqueda de legajos

  const handleSearch = async (query: string) => {
    // TODO: Llamar a API para buscar legajos
    console.log('Searching:', query);
    return [];
  };

  const handleAdd = (recordId: string) => {
    // TODO: Llamar a API para crear relación
    console.log('Adding relation:', recordId);
  };

  const handleRemove = (recordId: string) => {
    // TODO: Llamar a API para eliminar relación
    console.log('Removing relation:', recordId);
  };

  return (
    <RelationNodeRuntime
      node={node}
      mode={mode}
      legajoId={legajoId}
      relatedRecords={[]}
      onSearch={handleSearch}
      onAdd={handleAdd}
      onRemove={handleRemove}
      isLoading={false}
    />
  );
}
