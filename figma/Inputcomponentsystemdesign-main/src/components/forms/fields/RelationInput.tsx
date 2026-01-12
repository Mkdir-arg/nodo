import React, { useState } from 'react';
import { X, Plus, Users, ChevronLeft, ChevronRight, Search, Trash2 } from 'lucide-react';
import { FormLabel } from '../FormLabel';
import { FormError } from '../FormError';
import { RelationTag } from '@/types/form';

interface RelationInputProps {
  id: string;
  label?: string;
  relationTypes: string[];
  relations?: RelationTag[];
  required?: boolean;
  disabled?: boolean;
  error?: string;
  itemsPerPage?: number;
  onChange?: (relations: RelationTag[]) => void;
}

export const RelationInput: React.FC<RelationInputProps> = ({
  id,
  label,
  relationTypes,
  relations = [],
  required,
  disabled,
  error,
  itemsPerPage = 10,
  onChange,
}) => {
  const [selectedType, setSelectedType] = useState(relationTypes[0] || '');
  const [newRelationName, setNewRelationName] = useState('');
  const [currentPages, setCurrentPages] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState(relationTypes[0] || '');

  const handleAddRelation = () => {
    if (!newRelationName.trim() || disabled) return;

    const newRelation: RelationTag = {
      id: `${Date.now()}-${Math.random()}`,
      label: newRelationName.trim(),
      type: selectedType,
    };

    onChange?.([...relations, newRelation]);
    setNewRelationName('');
    setActiveTab(selectedType); // Cambiar a la tab del tipo agregado
  };

  const handleRemoveRelation = (relationId: string) => {
    if (disabled) return;
    onChange?.(relations.filter(r => r.id !== relationId));
  };

  const getRelationsByType = (type: string) => {
    return relations.filter(r => r.type === type);
  };

  const getCurrentPage = (type: string) => {
    return currentPages[type] || 1;
  };

  const setCurrentPage = (type: string, page: number) => {
    setCurrentPages(prev => ({ ...prev, [type]: page }));
  };

  const getPaginatedRelations = (type: string) => {
    const typeRelations = getRelationsByType(type);
    const currentPage = getCurrentPage(type);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return typeRelations.slice(startIndex, endIndex);
  };

  const getTotalPages = (type: string) => {
    const typeRelations = getRelationsByType(type);
    return Math.ceil(typeRelations.length / itemsPerPage);
  };

  return (
    <div className="w-full">
      {label && <FormLabel htmlFor={id} required={required}>{label}</FormLabel>}

      <div className={`
        rounded-xl border bg-white dark:bg-gray-900 overflow-hidden
        ${error 
          ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-900' 
          : 'border-gray-200 dark:border-gray-700'
        }
        ${disabled ? 'opacity-50' : ''}
      `}>
        {/* Formulario de agregar - Compacto y moderno */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              disabled={disabled}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all min-w-[140px]"
            >
              {relationTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <div className="relative flex-1">
              <input
                type="text"
                value={newRelationName}
                onChange={(e) => setNewRelationName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddRelation()}
                placeholder="Nombre del legajo..."
                disabled={disabled}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            <button
              type="button"
              onClick={handleAddRelation}
              disabled={disabled || !newRelationName.trim()}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap shadow-sm hover:shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar</span>
            </button>
          </div>
        </div>

        {/* Tabs de tipos */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {relationTypes.map(type => {
              const count = getRelationsByType(type).length;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveTab(type)}
                  className={`
                    relative px-6 py-3 text-sm font-medium transition-all whitespace-nowrap
                    ${activeTab === type
                      ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{type}</span>
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-semibold
                      ${activeTab === type
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }
                    `}>
                      {count}
                    </span>
                  </div>
                  {activeTab === type && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenido de la tabla */}
        <div className="min-h-[300px]">
          {relationTypes.map(type => {
            if (type !== activeTab) return null;

            const typeRelations = getRelationsByType(type);
            const paginatedRelations = getPaginatedRelations(type);
            const totalPages = getTotalPages(type);
            const currentPage = getCurrentPage(type);
            const startIndex = (currentPage - 1) * itemsPerPage;

            if (typeRelations.length === 0) {
              return (
                <div key={type} className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    No hay vínculos de tipo {type}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
                    Utilice el formulario superior para agregar un nuevo vínculo
                  </p>
                </div>
              );
            }

            return (
              <div key={type}>
                {/* Tabla moderna */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Nombre del Legajo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {paginatedRelations.map((relation, index) => (
                        <tr
                          key={relation.id}
                          className="group hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {startIndex + index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                                {relation.label.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {relation.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                              {relation.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {!disabled && (
                              <button
                                type="button"
                                onClick={() => handleRemoveRelation(relation.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all opacity-0 group-hover:opacity-100"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-xs font-medium">Eliminar</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación moderna */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">
                        Mostrando {startIndex + 1} - {Math.min(startIndex + itemsPerPage, typeRelations.length)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        de {typeRelations.length} registros
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentPage(type, Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Anterior</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => setCurrentPage(type, pageNum)}
                              className={`
                                w-10 h-10 rounded-lg text-sm font-medium transition-all
                                ${currentPage === pageNum
                                  ? 'bg-blue-600 text-white shadow-md'
                                  : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }
                              `}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => setCurrentPage(type, Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <span className="hidden sm:inline">Siguiente</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <FormError message={error} />
    </div>
  );
};