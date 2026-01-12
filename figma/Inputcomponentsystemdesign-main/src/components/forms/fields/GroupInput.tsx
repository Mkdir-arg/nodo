import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { FormLabel } from '../FormLabel';
import { FormError } from '../FormError';
import { FormField } from '@/types/form';

interface GroupInputProps {
  id: string;
  label?: string;
  items: any[];
  groupFields: FormField[];
  maxItems?: number;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  onAdd?: () => void;
  onRemove?: (index: number) => void;
  renderFields?: (item: any, index: number) => React.ReactNode;
}

export const GroupInput: React.FC<GroupInputProps> = ({
  id,
  label,
  items,
  groupFields,
  maxItems,
  required,
  disabled,
  error,
  onAdd,
  onRemove,
  renderFields,
}) => {
  const canAddMore = !maxItems || items.length < maxItems;

  return (
    <div className="w-full">
      {label && <FormLabel htmlFor={id} required={required}>{label}</FormLabel>}

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              No hay elementos agregados
            </p>
            <button
              type="button"
              onClick={onAdd}
              disabled={disabled || !canAddMore}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Agregar primero
            </button>
          </div>
        ) : (
          <>
            {items.map((item, index) => (
              <div
                key={index}
                className="relative p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Elemento {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => onRemove?.(index)}
                    disabled={disabled}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {renderFields?.(item, index)}
                </div>
              </div>
            ))}

            {canAddMore && (
              <button
                type="button"
                onClick={onAdd}
                disabled={disabled}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Agregar otro elemento
                {maxItems && ` (${items.length}/${maxItems})`}
              </button>
            )}
          </>
        )}
      </div>

      <FormError message={error} />
    </div>
  );
};
