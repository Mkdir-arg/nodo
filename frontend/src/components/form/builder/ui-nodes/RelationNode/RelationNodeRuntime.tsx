'use client';

import { useState } from 'react';
import { Search, Plus, X, Loader2, Info, Link2, FileText, Inbox } from 'lucide-react';
import type { RelationNode, RelatedRecord } from './types';

interface RelationNodeRuntimeProps {
  node: RelationNode;
  mode: 'create' | 'edit' | 'view';
  legajoId?: string;
  relatedRecords?: RelatedRecord[];
  onAdd?: (recordId: string) => void;
  onRemove?: (recordId: string) => void;
  onSearch?: (query: string) => Promise<RelatedRecord[]>;
  isLoading?: boolean;
}

const getStatusBadgeClass = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('progreso')) return 'bg-blue-100 text-blue-700';
  if (statusLower.includes('completado')) return 'bg-green-100 text-green-700';
  if (statusLower.includes('planificación')) return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-700';
};

export function RelationNodeRuntime({
  node,
  mode,
  legajoId,
  relatedRecords = [],
  onAdd,
  onRemove,
  onSearch,
  isLoading = false,
}: RelationNodeRuntimeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RelatedRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const config = node.config;

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim() || !onSearch) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowSearchDropdown(true);
    
    try {
      const results = await onSearch(query);
      const filteredResults = results.filter(
        result => !relatedRecords.find(r => r.id === result.id)
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddRecord = (record: RelatedRecord) => {
    if (onAdd) {
      onAdd(record.id);
    }
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchDropdown(false);
  };

  const handleRemoveRecord = (recordId: string) => {
    if (onRemove) {
      onRemove(recordId);
    }
  };

  const formatFieldValue = (record: RelatedRecord, field: string) => {
    const value = record[field];
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    return String(value);
  };

  // Create mode - disabled state
  if (mode === 'create') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl flex items-center gap-6 opacity-50">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg flex items-center justify-center flex-shrink-0">
            <Link2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{config.title}</h1>
            {config.description && (
              <p className="text-sm text-gray-600 mt-1">{config.description}</p>
            )}
          </div>
        </div>

        {/* Alert Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              Guarda el legajo primero para agregar relaciones
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isEditable = mode === 'edit';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl flex items-center gap-6">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg flex items-center justify-center flex-shrink-0">
          <Link2 className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{config.title}</h1>
          {config.description && (
            <p className="text-sm text-gray-600 mt-1">{config.description}</p>
          )}
        </div>
        {isEditable && config.allow_create && (
          <button 
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            disabled={isLoading}
          >
            <Plus className="w-4 h-4" />
            <span>Agregar</span>
          </button>
        )}
      </div>

      {/* Search box - only in edit mode */}
      {isEditable && (
        <div className="relative">
          <div className="bg-white/90 backdrop-blur-lg rounded-xl p-4 shadow-md border border-gray-200/50">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder={`Buscar por ${config.search_fields.join(' o ')}...`}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery && setShowSearchDropdown(true)}
                className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-500"
                disabled={isLoading}
              />
              {isSearching && (
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin flex-shrink-0" />
              )}
            </div>
          </div>

          {/* Search dropdown */}
          {showSearchDropdown && (
            <div className="absolute z-50 mt-2 w-full bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-gray-200/50 overflow-hidden max-h-80 overflow-y-auto">
              {isSearching ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="p-2">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleAddRecord(result)}
                      className="w-full p-4 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">
                          {formatFieldValue(result, config.display_fields[0])}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {config.display_fields.slice(1).map(field => 
                            formatFieldValue(result, field)
                          ).join(' • ')}
                        </div>
                      </div>
                      <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No se encontraron resultados</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Related records list */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading state with skeleton
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/90 backdrop-blur-lg rounded-xl p-4 shadow-md animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : relatedRecords.length === 0 ? (
          // Empty state
          <div className="bg-white/90 backdrop-blur-lg rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
            <Inbox className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600">
              No hay {config.title.toLowerCase()}
            </p>
            {isEditable && config.allow_create && (
              <p className="text-xs text-gray-500 mt-2">
                Usa el buscador arriba para agregar
              </p>
            )}
          </div>
        ) : (
          // Records list
          relatedRecords.map((record) => (
            <div 
              key={record.id} 
              className="bg-white/90 backdrop-blur-lg rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 truncate">
                    {formatFieldValue(record, config.display_fields[0])}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {config.display_fields.slice(1).map((field, idx) => {
                      const value = formatFieldValue(record, field);
                      const isStatus = field.toLowerCase().includes('estado');
                      
                      return (
                        <div key={field} className="flex items-center gap-2">
                          {isStatus ? (
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(value)}`}>
                              {value}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-600">
                              {value}
                            </span>
                          )}
                          {idx < config.display_fields.length - 2 && !isStatus && (
                            <span className="text-gray-400">•</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Remove button - only in edit mode */}
                {isEditable && config.allow_remove && (
                  <button
                    onClick={() => handleRemoveRecord(record.id)}
                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors flex items-center justify-center flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
