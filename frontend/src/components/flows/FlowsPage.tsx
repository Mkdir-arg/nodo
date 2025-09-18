'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFlowStore } from '@/lib/store/useFlowStore';
import FlowList from './FlowList';
import type { Flow } from '@/lib/flows/types';

export default function FlowsPage() {
  const router = useRouter();
  const { flows, loading, error, loadFlows, deleteFlow } = useFlowStore();

  useEffect(() => {
    loadFlows();
  }, [loadFlows]);

  const handleEdit = (flow: Flow) => {
    router.push(`/flujos/editar/${flow.id}`);
  };

  const handleDelete = (id: string) => {
    deleteFlow(id);
  };

  const handleNew = () => {
    router.push('/flujos/nuevo');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <p>Cargando flujos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <FlowList
        flows={flows}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onNew={handleNew}
      />
    </div>
  );
}