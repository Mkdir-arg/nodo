'use client';

import { Play, Edit, Trash2 } from 'lucide-react';
import type { StartNodeData } from '@/lib/flows/types';

interface StartNodeProps {
  data: {
    step: StartNodeData;
    onEdit: () => void;
    onDelete: () => void;
  };
}

export default function StartNode({ data }: StartNodeProps) {
  return (
    <div className="bg-white border-2 border-green-500 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-200 min-w-52 group">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0">
          <Play className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm text-gray-900 truncate">{data.step.title}</h4>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Inicio
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {data.step.config.acceptedPlantillas?.length || 0} plantillas configuradas
          </p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={data.onEdit}
            className="text-green-600 hover:text-green-700 p-1.5 hover:bg-green-50 rounded-md transition-colors"
            title="Configurar inicio"
          >
            <Edit className="h-3 w-3" />
          </button>
          <button
            onClick={data.onDelete}
            className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-md transition-colors"
            title="Eliminar nodo"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}