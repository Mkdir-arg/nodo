'use client';

import { useState, useEffect } from 'react';
import { X, Play, Users, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useFlowCandidates, useStartFlow, useStartFlowBulk } from '@/lib/hooks/useFlowExecution';
import type { StartConfig } from '@/lib/flows/types';

interface StartTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  flowSlug: string;
  startConfig: StartConfig;
}

export default function StartTableModal({ isOpen, onClose, flowSlug, startConfig }: StartTableModalProps) {
  const [selectedLegajos, setSelectedLegajos] = useState<string[]>([]);
  const [selectedPlantilla, setSelectedPlantilla] = useState<string>(
    startConfig.acceptedPlantillas?.[0] || ''
  );
  const [searchTerm, setSearchTerm] = useState(startConfig.defaultFilters?.search as string || '');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: candidatesData, isLoading } = useFlowCandidates(flowSlug, {
    search: searchTerm,
    plantilla_id: selectedPlantilla,
    page: currentPage,
  });

  const startFlowMutation = useStartFlow(flowSlug);
  const startFlowBulkMutation = useStartFlowBulk(flowSlug);

  const candidates = candidatesData?.results || [];
  const totalPages = candidatesData?.pages || 1;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLegajos(candidates.map((c: any) => c.id));
    } else {
      setSelectedLegajos([]);
    }
  };

  const handleSelectLegajo = (legajoId: string, checked: boolean) => {
    if (checked) {
      setSelectedLegajos([...selectedLegajos, legajoId]);
    } else {
      setSelectedLegajos(selectedLegajos.filter(id => id !== legajoId));
    }
  };

  const handleStartSingle = async (legajoId: string) => {
    try {
      await startFlowMutation.mutateAsync({
        legajo_id: legajoId,
        plantilla_id: selectedPlantilla,
      });
      onClose();
    } catch (error) {
      console.error('Error starting flow:', error);
    }
  };

  const handleStartBulk = async () => {
    if (selectedLegajos.length === 0) return;
    
    try {
      await startFlowBulkMutation.mutateAsync({
        legajo_ids: selectedLegajos,
        plantilla_id: selectedPlantilla,
      });
      onClose();
    } catch (error) {
      console.error('Error starting bulk flow:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="bg-white w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Play className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Iniciar Flujo</h2>
              <p className="text-sm text-gray-600">Selecciona los legajos para ejecutar el flujo</p>
            </div>
          </div>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Plantilla Selector */}
            {startConfig.acceptedPlantillas.length > 1 && (
              <div>
                <label className="block text-sm font-medium mb-2">Plantilla</label>
                <select
                  value={selectedPlantilla}
                  onChange={(e) => setSelectedPlantilla(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {startConfig.acceptedPlantillas.map((plantillaId) => (
                    <option key={plantillaId} value={plantillaId}>
                      {plantillaId}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar legajos..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-end gap-2">
              <Button
                onClick={handleStartBulk}
                disabled={selectedLegajos.length === 0 || startFlowBulkMutation.isPending}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Iniciar Seleccionados ({selectedLegajos.length})
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Cargando candidatos...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedLegajos.length === candidates.length && candidates.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </th>
                  {startConfig.tableColumns.map((col) => (
                    <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {col.label}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {candidates.map((candidate: any) => (
                  <tr key={candidate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedLegajos.includes(candidate.id)}
                        onChange={(e) => handleSelectLegajo(candidate.id, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    {startConfig.tableColumns.map((col) => (
                      <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {candidate[col.key] || '-'}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        size="sm"
                        onClick={() => handleStartSingle(candidate.id)}
                        disabled={startFlowMutation.isPending}
                        className="flex items-center gap-1"
                      >
                        <Play className="h-3 w-3" />
                        Iniciar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Página {currentPage} de {totalPages} • {candidatesData?.count || 0} total
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}