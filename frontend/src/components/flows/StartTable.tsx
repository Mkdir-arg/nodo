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

import { useState } from 'react'

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

  const handleSubmit = () => {
    if (!selectedLegajo) {
      alert('Debe seleccionar un legajo')
      return
    }
    onSelect(selectedLegajo)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {description && <p className="text-gray-600 mt-1">{description}</p>}
      </div>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seleccionar
              </th>
              {columns.map((column) => (
                <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {legajos.map((legajo) => (
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
                            : 'bg-yellow-100 text-yellow-800'
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
            ))}
          </tbody>
        </table>
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={processing || !selectedLegajo}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
      >
        {processing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Procesando...
          </div>
        ) : (
          submitLabel
        )}
      </button>
    </div>
  )
}