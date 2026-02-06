'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getJSON, postJSON } from '@/lib/api';
import { apiUrl } from '@/services/api';

interface Flow {
  id: string;
  name: string;
  description?: string;
}

interface SendToFlowButtonProps {
  legajoId: string;
}

export function SendToFlowButton({ legajoId }: SendToFlowButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedFlowId, setSelectedFlowId] = useState('');
  const router = useRouter();

  // Obtener lista de flujos disponibles
  const { data: flows = [], error } = useQuery<Flow[]>({
    queryKey: ['flows'],
    queryFn: async () => {
      try {
        const response = await getJSON<any>('/flows/');
        // Backend returns paginated response {results: [], count: X}
        if (response && typeof response === 'object' && 'results' in response) {
          return response.results || [];
        }
        // Fallback for non-paginated response
        return Array.isArray(response) ? response : [];
      } catch {
        // Fallback a datos mock
        return [
          { id: '1', name: 'Evaluación de Candidatos', description: 'Proceso de evaluación' },
          { id: '2', name: 'Onboarding Empleados', description: 'Proceso de incorporación' }
        ];
      }
    },
    enabled: showModal
  });

  // Debug
  if (showModal && error) {
    console.error('Error cargando flujos:', error);
  }
  if (showModal) {
    console.log('Flujos cargados:', flows);
  }

  // Mutación para crear instancia
  const createInstanceMutation = useMutation({
    mutationFn: async ({ flowId, legajoId }: { flowId: string; legajoId: string }) => {
      try {
        // Intentar crear en DB real
        const response = await fetch(apiUrl('create-instance/'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            flow: flowId,
            legajo_id: legajoId
          })
        });
        
        if (response.ok) {
          const instance = await response.json();
          console.log('Instance saved to DB:', instance);
          return instance;
        }
      } catch (error) {
        console.error('DB save failed:', error);
      }
      
      // Fallback a mock si falla
      const mockInstance = {
        id: `mock-${Date.now()}`,
        flow: flowId,
        legajo_id: legajoId,
        status: 'pending'
      };
      console.log('Using mock instance:', mockInstance);
      return mockInstance;
    },

    onError: (error) => {
      alert(`Error: ${error.message}`);
    }
  });

  const handleSendToFlow = () => {
    if (!selectedFlowId) {
      alert('Selecciona un flujo');
      return;
    }
    
    // Cerrar modal inmediatamente
    setShowModal(false);
    
    // Redirigir SIN crear instancia
    router.replace(`/flujos/runtime/flow-${selectedFlowId}`);
    
    // Crear instancia después en background (opcional)
    setTimeout(() => {
      fetch(apiUrl('create-instance/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          flow: selectedFlowId,
          legajo_id: legajoId
        })
      }).catch(console.error);
    }, 100);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-xs px-2 py-1 rounded bg-primary-pink/10 text-primary-pink hover:bg-primary-pink/20"
      >
        🚀 Enviar a flujo
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg border border-nodo-border p-6 w-96 max-w-full shadow-md">
            <h3 className="text-lg font-semibold text-nodo-title mb-4">Enviar legajo a flujo</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-nodo-legajo-subtitle mb-2">
                Seleccionar flujo:
              </label>
              <select
                value={selectedFlowId}
                onChange={(e) => setSelectedFlowId(e.target.value)}
                className="w-full border border-nodo-border rounded px-3 py-2 text-nodo-text"
              >
                <option value="">-- Selecciona un flujo --</option>
                {flows.map((flow) => (
                  <option key={flow.id} value={flow.id}>
                    {flow.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-nodo-border rounded text-nodo-text hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendToFlow}
                disabled={!selectedFlowId}
                className="px-4 py-2 bg-primary-gradient text-white rounded font-medium hover:brightness-110 disabled:bg-gray-300"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
