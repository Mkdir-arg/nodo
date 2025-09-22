interface Legajo {
  id: string
  [key: string]: any // Permitir propiedades dinámicas
}

interface TableColumn {
  key: string
  label: string
}

interface StartTableProps {
  title: string
  description?: string
  legajos: Legajo[]
  columns?: TableColumn[] // Columnas configurables
  onSelect: (legajoId: string) => void
  processing?: boolean
  submitLabel?: string
}

import { useState, useMemo } from 'react'
import { Search, Filter, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react'

export function StartTable({ 
  title, 
  description, 
  legajos, 
  columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'estado', label: 'Estado' }
  ],
  onSelect, 
  processing = false,
  submitLabel = "Continuar"
}: StartTableProps) {
  const [selectedLegajo, setSelectedLegajo] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortColumn, setSortColumn] = useState('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Filtrar y ordenar legajos
  const filteredLegajos = useMemo(() => {
    let filtered = legajos.filter(legajo => {
      const matchesSearch = searchTerm === '' || 
        Object.values(legajo).some(value => 
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      const matchesStatus = statusFilter === 'all' || legajo.estado === statusFilter
      return matchesSearch && matchesStatus
    })

    if (sortColumn) {
      filtered.sort((a, b) => {
        const aVal = a[sortColumn] || ''
        const bVal = b[sortColumn] || ''
        const comparison = aVal.toString().localeCompare(bVal.toString())
        return sortDirection === 'asc' ? comparison : -comparison
      })
    }

    return filtered
  }, [legajos, searchTerm, statusFilter, sortColumn, sortDirection])

  // Estadísticas
  const stats = useMemo(() => {
    const total = legajos.length
    const activos = legajos.filter(l => l.estado === 'Activo').length
    const pendientes = legajos.filter(l => l.estado === 'Pendiente').length
    const enviados = legajos.filter(l => l.estado === 'Enviado a Flujo').length
    const otros = total - activos - pendientes - enviados
    return { total, activos, pendientes, enviados, otros }
  }, [legajos])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const handleSubmit = () => {
    if (!selectedLegajo) {
      alert('Debe seleccionar un legajo')
      return
    }
    onSelect(selectedLegajo)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            {description && <p className="text-gray-600 mt-1">{description}</p>}
          </div>
        </div>
        
        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600">Activos</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.activos}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-gray-600">Pendientes</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendientes}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-blue-500 rounded-full" />
              <span className="text-sm text-gray-600">En Flujo</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.enviados}</p>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar en todos los campos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="all">Todos los estados</option>
                <option value="Activo">Activo</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Enviado a Flujo">Enviado a Flujo</option>
                <option value="Seleccionado">Seleccionado</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Resultados */}
        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
          <span>Mostrando {filteredLegajos.length} de {legajos.length} registros</span>
          {selectedLegajo && (
            <span className="text-blue-600 font-medium">
              1 registro seleccionado
            </span>
          )}
        </div>
      </div>
      
      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seleccionar
              </th>
              {columns.map((column) => (
                <th 
                  key={column.key} 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {sortColumn === column.key && (
                      <span className="text-blue-500">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLegajos.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-8 w-8 text-gray-400" />
                    <p className="text-gray-500">No se encontraron registros</p>
                    <p className="text-sm text-gray-400">Intenta ajustar los filtros de búsqueda</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLegajos.map((legajo) => (
              <tr 
                key={legajo.id}
                className={`hover:bg-gray-50 cursor-pointer ${
                  selectedLegajo === legajo.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedLegajo(legajo.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="radio"
                    name="legajo"
                    value={legajo.id}
                    checked={selectedLegajo === legajo.id}
                    onChange={() => setSelectedLegajo(legajo.id)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                </td>
                {columns.map((column) => {
                  const value = legajo[column.key]
                  const isEstado = column.key === 'estado'
                  const isDate = column.key === 'created_at' || column.key === 'updated_at'
                  const isId = column.key === 'id'
                  
                  let displayValue = value || '-'
                  if (isDate && value) {
                    displayValue = new Date(value).toLocaleDateString()
                  } else if (isId && value) {
                    displayValue = value.toString().slice(0, 8) + '...'
                  }
                  
                  return (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {isEstado ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          value === 'Activo' 
                            ? 'bg-green-100 text-green-800' 
                            : value === 'Pendiente'
                            ? 'bg-yellow-100 text-yellow-800'
                            : value === 'Enviado a Flujo'
                            ? 'bg-blue-100 text-blue-800'
                            : value === 'Seleccionado'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {displayValue}
                        </span>
                      ) : (
                        <span className={column.key === 'text' || column.key === 'nombre' ? 'font-medium text-gray-900' : ''}>
                          {displayValue}
                        </span>
                      )}
                    </td>
                  )
                })}
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Botón de acción mejorado */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Continuar con selección</h3>
            <p className="text-sm text-gray-600">
              {selectedLegajo 
                ? `Has seleccionado: ${filteredLegajos.find(l => l.id === selectedLegajo)?.text || filteredLegajos.find(l => l.id === selectedLegajo)?.nombre || 'Registro'}`
                : 'Selecciona un registro para continuar'
              }
            </p>
          </div>
          {selectedLegajo && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Listo</span>
            </div>
          )}
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={processing || !selectedLegajo}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
        >
          {processing ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Procesando...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>{submitLabel}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}