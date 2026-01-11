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
  inverseRelationType: string;
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

    const matchesLabel = (label: string) =>
      relations.some(rel => rel.relation_label === label || rel.inverse_relation_label === label);

    const outgoing = (relationsData.outgoing || [])
      .filter((r: any) => matchesLabel(r.relation_type))
      .map((r: any) => ({
        id: r.id,
        relation_type: r.relation_type,
        legajo_id: r.target_legajo_id,
        legajo_data: r.target_data,
        direction: 'outgoing'
      }));

    const incoming = (relationsData.incoming || [])
      .filter((r: any) => matchesLabel(r.relation_type))
      .map((r: any) => ({
        id: r.id,
        relation_type: r.relation_type,
        legajo_id: r.source_legajo_id,
        legajo_data: r.source_data,
        direction: 'incoming'
      }));

    return [...outgoing, ...incoming];
  }, [relationsData, relations, isCreateMode]);

  const { data: searchData, isLoading } = useQuery({
    queryKey: ['legajos-relation-search', config.target_template_id, searchQuery],
    queryFn: async () => {
      return await LegajosService.list({
        formId: config.target_template_id,
        search: searchQuery || undefined,
        page_size: 50
      });
    },
    enabled: !!config.target_template_id && !isReadonly,
    staleTime: 0,
    gcTime: 0,
  });

  const legajos = useMemo(() => {
    const results = (searchData as any)?.results || [];
    const linkedIds = isCreateMode
      ? pendingRelations.map(r => r.targetId)
      : allCurrentRelations.map((r: any) => r.legajo_id);

    return results.filter((l: any) => !linkedIds.includes(l.id) && l.id !== legajoId);
  }, [searchData, allCurrentRelations, pendingRelations, isCreateMode, legajoId]);

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
    const totalCount = isCreateMode
      ? pendingRelations.length
      : allCurrentRelations.filter((r: any) => r.direction === 'outgoing').length;
    if (isReadonly || totalCount >= maxItems || !selectedRelationType) return;

    if (isCreateMode) {
      const targetLegajo = legajos.find(l => l.id === targetLegajoId);
      const rel = relations.find(r => r.id === selectedRelationType);
      if (targetLegajo && rel && relationCtx) {
        relationCtx.addPendingRelation({
          targetId: targetLegajoId,
          relationType: rel.relation_label,
          inverseRelationType: rel.inverse_relation_label,
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
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <LinkIcon className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-700">
            No hay relaciones configuradas en el builder
          </p>
        </div>
      </div>
    );
  }

  if (!config.target_template_id) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <LinkIcon className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-700">
            Sin plantilla destino configurada
          </p>
        </div>
      </div>
    );
  }

  const displayRelations = isCreateMode ? pendingRelations : allCurrentRelations;
  const outgoingCount = isCreateMode
    ? pendingRelations.length
    : allCurrentRelations.filter((r: any) => r.direction === 'outgoing').length;
  const maxItemsLabel = maxItems === Infinity ? 'sin limite' : String(maxItems);
  const canAddMore = !isReadonly && outgoingCount < maxItems;

  return (
    <div className="space-y-6">
      {/* Contenedor unificado con glass morphism */}
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 flex items-center gap-6 border-b border-gray-200/50">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg flex items-center justify-center flex-shrink-0">
            <LinkIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{config.title || 'Relaciones'}</h1>
            {config.description && (
              <p className="text-sm text-gray-600 mt-1">{config.description}</p>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {outgoingCount}/{maxItemsLabel}
          </div>
        </div>

        {/* Search section - solo en modo edición */}
        {canAddMore && (
          <div className="p-6 border-b border-gray-200/50 space-y-4">
            {/* Selector de tipo si hay múltiples */}
            {relations.length > 1 && (
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-2">Tipo de relación</label>
                <select
                  value={selectedRelationType}
                  onChange={(e) => setSelectedRelationType(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {relations.map(rel => (
                    <option key={rel.id} value={rel.id}>{rel.relation_label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Search input */}
            <div className="relative">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre o código..."
                  className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="w-8 h-8 rounded-lg bg-white hover:bg-gray-100 text-gray-600 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Search dropdown */}
              {searchQuery && (
                <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden max-h-80 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                  ) : legajos.length === 0 ? (
                    <div className="p-8 text-center">
                      <Search className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">No se encontraron resultados</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {legajos.map((legajo: any) => (
                        <button
                          key={legajo.id}
                          type="button"
                          onClick={() => handleSelect(legajo.id)}
                          disabled={createMutation.isPending}
                          className="w-full p-4 hover:bg-gray-50 transition-colors text-left flex items-center gap-4 disabled:opacity-50"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <LinkIcon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {renderLegajoDisplay(legajo.data)}
                            </div>
                            <div className="text-xs text-gray-500 truncate">{legajo.id}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Relations list */}
        <div className="p-6">
          {displayRelations.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-gray-300 rounded-xl">
              <LinkIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600">
                No hay relaciones {isCreateMode ? 'pendientes' : 'vinculadas'}
              </p>
              {canAddMore && (
                <p className="text-xs text-gray-500 mt-2">
                  Usa el buscador arriba para agregar
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {displayRelations.map((rel: any) => {
                const relType = isCreateMode ? rel.relationType : rel.relation_type;
                const targetId = isCreateMode ? rel.targetId : rel.legajo_id;
                const targetData = isCreateMode ? rel.targetData : rel.legajo_data;
                const relId = isCreateMode ? rel.targetId : rel.id;
                const canRemove = !isReadonly && (isCreateMode || rel.direction === 'outgoing');

                return (
                  <div 
                    key={relId} 
                    className="
                      flex items-center gap-4 p-4 rounded-xl
                      bg-white/90 backdrop-blur-lg
                      border border-slate-200/60
                      shadow-md hover:shadow-lg
                      transition-all duration-200
                    "
                  >
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                      <LinkIcon className="w-5 h-5 text-gray-600" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate mb-1">
                        {renderLegajoDisplay(targetData)}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{relType}</span>
                        {!isCreateMode && rel.direction === 'incoming' && (
                          <>
                            <span>•</span>
                            <span className="text-purple-600">Inversa</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {(canRemove || !isCreateMode) && (
                      <div className="flex items-center gap-2">
                        {!isCreateMode && (
                          <button
                            onClick={() => router.push(`/legajos/${targetId}`)}
                            className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-600 transition-all duration-200 flex items-center justify-center shadow-sm"
                            title="Ver legajo"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                        {canRemove && (
                          <button
                            onClick={() => handleRemove(isCreateMode ? targetId : relId)}
                            className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-600 transition-all duration-200 flex items-center justify-center shadow-sm"
                            title="Eliminar vínculo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {outgoingCount >= maxItems && !isReadonly && (
        <div className="text-xs text-slate-500 italic">
          Maximo de vinculos alcanzado ({maxItemsLabel})
        </div>
      )}
    </div>
  );
}
