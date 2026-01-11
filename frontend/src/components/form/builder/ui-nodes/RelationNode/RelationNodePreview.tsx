'use client';

import { Link2 } from 'lucide-react';
import type { RelationNode } from './types';

interface RelationNodePreviewProps {
  node: RelationNode;
}

export function RelationNodePreview({ node }: RelationNodePreviewProps) {
  const config = node.config;

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      {/* Header Preview */}
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-md flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg flex items-center justify-center flex-shrink-0">
          <Link2 className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-gray-900 truncate">
            {config.title || 'Título de Relación'}
          </h3>
          {config.description && (
            <p className="text-xs text-gray-600 truncate">{config.description}</p>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-600 space-y-1">
        <div>
          <span className="font-medium">Tipo:</span> {config.relation_type || 'No configurado'}
        </div>
        <div>
          <span className="font-medium">Campos:</span> {config.display_fields?.join(', ') || 'No configurado'}
        </div>
        <div className="flex gap-2 mt-2">
          {config.allow_create && (
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
              Crear ✓
            </span>
          )}
          {config.allow_remove && (
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
              Eliminar ✓
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
