interface FormField {
  name: string
  type: string
  label: string
  required?: boolean
  placeholder?: string
  options?: Array<{ value: string; label: string }>
}

interface FormRendererProps {
  title: string
  description?: string
  fields: FormField[]
  onSubmit: (data: Record<string, any>) => void
  processing?: boolean
  submitLabel?: string
}

export function FormRenderer({ 
  title, 
  description, 
  fields, 
  onSubmit, 
  processing = false,
  submitLabel = "Continuar"
}: FormRendererProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const data: Record<string, any> = {}
    
    for (const [key, value] of formData.entries()) {
      data[key] = value
    }
    
    onSubmit(data)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {description && <p className="text-gray-600 mt-1">{description}</p>}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {field.type === 'text' && (
              <input
                type="text"
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            
            {field.type === 'email' && (
              <input
                type="email"
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            
            {field.type === 'tel' && (
              <input
                type="tel"
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            
            {field.type === 'number' && (
              <input
                type="number"
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            
            {field.type === 'select' && (
              <select
                name={field.name}
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Seleccione --</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            
            {field.type === 'checkbox-group' && (
              <div className="space-y-2">
                {field.options?.map((option) => (
                  <label key={option.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name={field.name}
                      value={option.value}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
        
        <button
          type="submit"
          disabled={processing}
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
      </form>
    </div>
  )
}