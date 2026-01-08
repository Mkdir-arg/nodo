'use client';

import { Link } from 'lucide-react';
import type { UIRelationNode } from '@/components/form/shared/ui/relation/types';

interface RelationPreviewProps {
  node: UIRelationNode;
}

const cardinalityLabels = {
  one_to_one: "1:1",
  one_to_many: "1:N",
  many_to_one: "N:1",
  many_to_many: "N:N"
};

export default function RelationPreview({ node }: RelationPreviewProps) {
  const config = node.config;
  const relations = config.relations || [];

  return (
    <div className="bg-white/90 border-2 border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Link className="h-5 w-5 text-purple-600" />
        <h3 className="font-semibold text-gray-900">{config.title || "Relaciones"}</h3>
      </div>

      <div className="text-xs text-gray-600">
        Destino: {config.target_template_name || 'Sin plantilla'} • {cardinalityLabels[config.cardinality]}
      </div>

      {relations.length === 0 ? (
        <div className="text-sm text-gray-400 italic">Sin tipos de relación configurados</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {relations.map((rel) => (
            <div key={rel.id} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
              {rel.relation_label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
