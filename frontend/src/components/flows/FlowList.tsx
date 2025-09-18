'use client';

import { Edit, Trash2, Plus, Download, Copy, Upload, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { designTokens } from '@/lib/design/tokens';
import ExecuteFlowButton from './ExecuteFlowButton';
import type { Flow } from '@/lib/flows/types';

interface FlowListProps {
  flows: Flow[];
  onEdit: (flow: Flow) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  onDuplicate?: (flow: Flow) => void;
  onExport?: (flow: Flow) => void;
}

export default function FlowList({ flows, onEdit, onDelete, onNew, onDuplicate, onExport }: FlowListProps) {
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Está seguro de eliminar el flujo "${name}"?`)) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Flujos de Trabajo"
        subtitle="Gestiona y ejecuta tus flujos automatizados"
        actions={
          <Button onClick={onNew} className={designTokens.button.primary}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Flujo
          </Button>
        }
      />

      {!flows || flows.length === 0 ? (
        <Card className={`${designTokens.card.elevated} p-8 text-center`}>
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay flujos creados</h3>
          <p className="text-gray-500 mb-4">Crea tu primer flujo de trabajo automatizado</p>
          <Button onClick={onNew} className={designTokens.button.primary}>
            <Plus className="h-4 w-4 mr-2" />
            Crear primer flujo
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {flows?.map((flow) => (
            <Card key={flow.id} className={`${designTokens.card.elevated} p-6 hover:shadow-lg transition-all duration-200`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{flow.name}</h3>
                    <StatusBadge status="success">
                      Activo
                    </StatusBadge>
                  </div>
                  {flow.description && (
                    <p className="text-gray-600 text-sm mb-3">{flow.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      {flow.steps?.length || 0} pasos
                    </span>
                    <span>Creado {new Date(flow.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <ExecuteFlowButton flow={flow} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(flow)}
                    className={designTokens.button.secondary}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  {onDuplicate && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDuplicate(flow)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Duplicar
                    </Button>
                  )}
                  {onExport && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onExport(flow)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Exportar
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(flow.id, flow.name)}
                    className={designTokens.button.danger}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}