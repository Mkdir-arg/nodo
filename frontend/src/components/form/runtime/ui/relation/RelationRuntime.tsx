'use client';

import { useState, useMemo, createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, X, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { LegajosService } from '@/lib/services/legajos';
import { RelationsService } from '@/lib/services/relations';
import type { UIRelationConfig } from '@/components/form/shared/ui/relation/types';
import { useRouter } from 'next/navigation';

interface PendingRelation {
  targetId: string;
  relationType: string;
  targetData: any;
}

interface RelationContextType {
  pendingRelations: PendingRelation[];
  addPendingRelation: (rel: PendingRelation) => void;
  removePendingRelation: (targetId: string) => void;
}

const RelationContext = createContext<RelationContextType | null>(null);

export function RelationProvider({ children }: { children: React.ReactNode }) {
  const [pendingRelations, setPendingRelations] = useState<PendingRelation[]>([]);

  const addPendingRelation = (rel: PendingRelation) => {
    setPendingRelations(prev => [...prev, rel]);
  };

  const removePendingRelation = (targetId: string) => {
    setPendingRelations(prev => prev.filter(r => r.targetId !== targetId));
  };

  return (
    <RelationContext.Provider value={{ pendingRelations, addPendingRelation, removePendingRelation }}>
      {children}
    </RelationContext.Provider>
  );
}

export function useRelationContext() {
  const ctx = useContext(RelationContext);
  if (!ctx) throw new Error('useRelationContext must be used within RelationProvider');
  return ctx;
}

interface RelationRuntimeProps {
  config: UIRelationConfig;
  legajoId?: string;
  mode?: 'create' | 'view' | 'edit';
}

export default function RelationRuntime({ config, legajoId, mode = 'create' }: RelationRuntimeProps) {
  const relations = config.relations || [];
  const isReadonly = mode === 'view';
  const isCreateMode = mode === 'create' && !legajoId;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRelationType, setSelectedRelationType] = useState(relations[0]?.id || '');
  const router = useRouter();
  const qc = useQueryClient();
  const maxItems = config.cardinality === 'one_to_one' ? 1 : (config.selection.max_items || Infinity);

  const relationCtx = useContext(RelationContext);
  const pendingRelations = relationCtx?.pendingRelations || [];

  const { data: relationsData } = useQuery({
    queryKey: ['legajo-relations', legajoId],
    queryFn: () => RelationsService.list(legajoId!),
    enabled: !!legajoId,
  });

  const allCurrentRelations = useMemo(() => {
    if (isCreateMode) return [];
    if (!relationsData) return [];
    return relationsData.outgoing.filter((r: any) => 
      relations.some(rel => rel.relation_label === r.relation_type)
    );
  }, [relationsData, relations, isCreateMode]);

  const { data: searchData, isLoading } = useQuery({
    queryKey: ['legajos-relation-search', config.target_template_id, searchQuery],
    queryFn: () => LegajosService.list({ 
      formId: config.target_template_id, 
      search: searchQuery || undefined,
      page_size: 50 
    }),
    enabled: !!config.target_template_id && !isReadonly,
  });

  const legajos = useMemo(() => {
    const results = (searchData as any)?.results || [];
    const linkedIds = isCreateMode 
      ? pendingRelations.map(r => r.targetId)
      : allCurrentRelations.map((r: any) => r.target_legajo_id);
    return results.filter((l: any) => !linkedIds.includes(l.id));
  }, [searchData, allCurrentRelations, pendingRelations, isCreateMode]);

  const createMutation = useMutation({
    mutationFn: ({ targetId, relationType }: { targetId: string; relationType: string }) => {
      const rel = relations.find(r => r.id === relationType);
      return RelationsService.create(legajoId!, {
        target_legajo_id: targetId,
        relation_type: rel!.relation_label,
        inverse_relation_type: rel!.inverse_relation_label
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['legajo-relations', legajoId] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (relationId: string) => RelationsService.delete(legajoId!, relationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['legajo-relations', legajoId] });
    }
  });

  const handleSelect = (targetLegajoId: string) => {
    const totalCount = isCreateMode ? pendingRelations.length : allCurrentRelations.length;
    if (isReadonly || totalCount >= maxItems || !selectedRelationType) return;

    if (isCreateMode) {
      const targetLegajo = legajos.find(l => l.id === targetLegajoId);
      const rel = relations.find(r => r.id === selectedRelationType);
      if (targetLegajo && rel && relationCtx) {
        relationCtx.addPendingRelation({
          targetId: targetLegajoId,
          relationType: rel.relation_label,
          targetData: targetLegajo.data
        });
      }
    } else {
      createMutation.mutate({ targetId: targetLegajoId, relationType: selectedRelationType });
    }
  };

  const handleRemove = (targetId: string) => {
    if (isReadonly) return;
    if (isCreateMode && relationCtx) {
      relationCtx.removePendingRelation(targetId);
    } else {
      deleteMutation.mutate(targetId);
    }
  };

  const renderLegajoDisplay = (legajo: any) => {
    const template = config.search?.display_template || '{{ id }}';
    try {
      return template.replace(/\{\{\s*(\w+(?:\.\w+)*)\s*\}\}/g, (_, path) => {
        const keys = path.split('.');
        let val = legajo;
        for (const k of keys) val = val?.[k];
        return val ?? '';
      });
    } catch {
      return legajo.id;
    }
  };

  if (relations.length === 0) {
    return (
      <div className="border border-yellow-300 bg-yellow-50 rounded-lg p-4 text-sm text-yellow-800">
        No hay relaciones configuradas en el builder
      </div>
    );
  }

  if (!config.target_template_id) {
    return (
      <div className="border border-yellow-300 bg-yellow-50 rounded-lg p-4 text-sm text-yellow-800">
        Sin plantilla destino configurada
      </div>
    );
  }

  const displayRelations = isCreateMode ? pendingRelations : allCurrentRelations;
  const totalCount = displayRelations.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <LinkIcon className="h-5 w-5 text-purple-600" />
        <h3 className="font-semibold">{config.title || 'Relaciones'}</h3>
      </div>

      {!isReadonly && totalCount < maxItems && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
          <div className="flex items-center gap-2">
            <select
              value={selectedRelationType}
              onChange={(e) => setSelectedRelationType(e.target.value)}
              className="border rounded px-3 py-2 text-sm bg-white"
            >
              {relations.map(rel => (
                <option key={rel.id} value={rel.id}>{rel.relation_label}</option>
              ))}
            </select>
            <div className="flex-1 flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="flex-1 text-sm bg-white border border-gray-200 rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="border border-gray-200 rounded bg-white max-h-48 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 text-center text-sm text-gray-500">Cargando...</div>
            ) : legajos.length === 0 ? (
              <div className="p-3 text-center text-sm text-gray-500">No hay resultados</div>
            ) : (
              <div className="divide-y">
                {legajos.map((legajo: any) => (
                  <button
                    key={legajo.id}
                    onClick={() => handleSelect(legajo.id)}
                    disabled={createMutation.isPending}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm disabled:opacity-50"
                  >
                    {renderLegajoDisplay(legajo.data)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {displayRelations.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Relaciones {isCreateMode ? 'pendientes' : 'vinculadas'}</div>
          <div className="space-y-2">
            {displayRelations.map((rel: any) => {
              const relType = isCreateMode ? rel.relationType : rel.relation_type;
              const targetId = isCreateMode ? rel.targetId : rel.target_legajo_id;
              const targetData = isCreateMode ? rel.targetData : rel.target_data;
              const relId = isCreateMode ? rel.targetId : rel.id;

              return (
                <div key={relId} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{relType}</div>
                    <div className="text-xs text-gray-600">{renderLegajoDisplay(targetData)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isCreateMode && (
                      <button
                        onClick={() => router.push(`/legajos/${targetId}`)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Ver legajo"
                      >
                        <ExternalLink className="h-4 w-4 text-gray-600" />
                      </button>
                    )}
                    {!isReadonly && (
                      <button 
                        onClick={() => handleRemove(isCreateMode ? targetId : relId)} 
                        className="p-1 hover:bg-red-100 rounded"
                        title="Eliminar vínculo"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {totalCount >= maxItems && !isReadonly && (
        <div className="text-xs text-gray-500 italic">
          Máximo de vínculos alcanzado ({maxItems})
        </div>
      )}
    </div>
  );
}
