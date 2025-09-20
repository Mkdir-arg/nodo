'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormRenderer } from './FormRenderer'
import { StartTable } from './StartTable'
import { toast } from '@/lib/toast'

// Mock data para testing
const getMockStepData = (stepId: string) => {
  const steps: Record<string, any> = {
    start: {
      type: 'start',
      title: 'Seleccionar Legajo',
      description: 'Seleccione un legajo para iniciar el proceso',
      legajos: [
        { id: '1', nombre: 'Juan Pérez', email: 'juan@test.com', telefono: '+54 11 1234-5678', estado: 'Activo' },
        { id: '2', nombre: 'María García', email: 'maria@test.com', telefono: '+54 11 9876-5432', estado: 'Activo' },
        { id: '3', nombre: 'Carlos López', email: 'carlos@test.com', telefono: '+54 11 5555-1234', estado: 'Pendiente' }
      ],
      transitions: [{ id: 'select', label: 'Enviar Email', to_step_id: 'email' }],
      status: 'running',
      current_step_id: 'start'
    },
    email: {
      type: 'email',
      title: 'Enviando Email',
      description: 'Se está enviando el email al legajo seleccionado',
      config: {
        to: '{{legajo.email}}',
        subject: 'Notificación del Sistema',
        body: 'Hola {{legajo.nombre}}, este es un email automático del sistema.'
      },
      transitions: [{ id: 'complete', label: 'Finalizar', to_step_id: 'completed' }],
      status: 'running',
      current_step_id: 'email'
    },
    completed: {
      type: 'completed',
      title: 'Proceso Completado',
      description: 'El email ha sido enviado exitosamente',
      status: 'completed',
      current_step_id: 'completed'
    }
  }
  
  return steps[stepId] || steps.start
}

interface FlowRuntimeProps {
  instanceId: string
}

interface StepData {
  type: string
  title?: string
  description?: string
  fields?: any[]
  legajos?: any[]
  content?: any
  config?: any
  html?: string
  transitions: Array<{
    id: string
    label: string
    to_step_id: string
  }>
  status: string
  current_step_id: string | null
}

export function FlowRuntime({ instanceId }: FlowRuntimeProps) {
  const [stepData, setStepData] = useState<StepData | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [instanceData, setInstanceData] = useState<any>(null)

  useEffect(() => {
    loadCurrentStep()
  }, [instanceId])
  
  useEffect(() => {
    loadLegajos()
  }, [instanceData])
  
  const loadLegajos = async () => {
    try {
      // Si es flow-X, cargar todas las instancias de ese flujo
      if (instanceId.startsWith('flow-')) {
        const flowId = instanceId.replace('flow-', '')
        const response = await fetch(`http://localhost:8000/api/flow-instances/?flow=${flowId}`)
        
        if (response.ok) {
          const instances = await response.json()
          console.log('Instances loaded:', instances)
          
          // Convertir instancias a formato de legajos
          const legajosFromInstances = instances.map((instance: any, index: number) => ({
            id: instance.legajo_id,
            nombre: `Legajo ${instance.legajo_id.slice(0, 8)}`,
            email: `legajo-${instance.legajo_id.slice(0, 8)}@test.com`,
            telefono: '+54 11 1234-5678',
            estado: 'Enviado a Flujo',
            instanceId: instance.id,
            createdAt: instance.started_at || instance.created_at
          }))
          
          setStepData(prev => prev ? {
            ...prev,
            legajos: legajosFromInstances
          } : null)
          return
        }
      }
      
      // Si tenemos instanceData, mostrar solo el legajo de esa instancia
      if (instanceData && instanceData.legajo_id && !instanceId.startsWith('flow-')) {
        const legajoRecord = {
          id: instanceData.legajo_id,
          nombre: `Legajo ${instanceData.legajo_id.slice(0, 8)}`,
          email: `legajo-${instanceData.legajo_id.slice(0, 8)}@test.com`,
          telefono: '+54 11 1234-5678',
          estado: 'Seleccionado'
        }
        
        setStepData(prev => prev ? {
          ...prev,
          legajos: [legajoRecord]
        } : null)
        return
      }
      
    } catch (error) {
      console.log('Error loading legajos:', error)
    }
    
    // Fallback a legajos mock
    setStepData(prev => prev ? {
      ...prev,
      legajos: [
        { id: '1', nombre: 'Juan Pérez', email: 'juan@test.com', telefono: '+54 11 1234-5678', estado: 'Activo' },
        { id: '2', nombre: 'María García', email: 'maria@test.com', telefono: '+54 11 9876-5432', estado: 'Activo' }
      ]
    } : null)
  }

  const loadCurrentStep = async () => {
    try {
      setLoading(true)
      
      // Si es una instancia mock o flow, usar datos de prueba directamente
      if (instanceId.startsWith('mock-') || instanceId.startsWith('flow-')) {
        const mockInstance = {
          id: instanceId,
          flow: instanceId.startsWith('flow-') ? instanceId.replace('flow-', '') : '1',
          legajo_id: 'e9705ac1-aae6-4ff3-a2c0-d8f92e8b5bff',
          status: 'pending'
        }
        setInstanceData(mockInstance)
        
        const mockData = getMockStepData('start')
        setStepData(mockData)
        return
      }
      
      // Para instancias reales, simular datos basados en el ID
      const mockInstance = {
        id: instanceId,
        flow: '1',
        legajo_id: instanceId, // Usar el mismo ID de instancia como legajo_id
        status: 'pending'
      }
      setInstanceData(mockInstance)
      console.log('Instance data set:', mockInstance)
      
      // Para instancias reales del backend
      const response = await fetch(`http://localhost:8000/api/flows/instances/${instanceId}/current_step/`)
      
      if (!response.ok) {
        // Si falla, usar mock como fallback
        const mockData = getMockStepData('start')
        setStepData(mockData)
        return
      }
      
      const data = await response.json()
      setStepData(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error cargando el paso actual')
    } finally {
      setLoading(false)
    }
  }

  const handleInteraction = async (interactionData: Record<string, any> = {}) => {
    try {
      setProcessing(true)
      
      // Si es mock, simular progresión
      if (instanceId.startsWith('mock-')) {
        const currentStep = stepData?.current_step_id || 'start'
        let nextStep = 'email'
        
        if (currentStep === 'start') nextStep = 'email'
        else if (currentStep === 'email') {
          // Completar flujo
          setTimeout(() => {
            setStepData(prev => prev ? { ...prev, status: 'completed' } : null)
            toast.success('¡Email enviado y flujo completado!')
          }, 2000)
          return
        }
        
        setTimeout(() => {
          const nextStepData = getMockStepData(nextStep)
          setStepData(nextStepData)
          toast.success(`Legajo seleccionado - Enviando email...`)
        }, 1000)
        
        return
      }
      
      const response = await fetch(`http://localhost:8000/api/flows/instances/${instanceId}/interact/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ ...formData, ...interactionData })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error procesando interacción')
      }
      
      const result = await response.json()
      
      if (result.success) {
        if (result.completed) {
          toast.success('¡Flujo completado exitosamente!')
        } else {
          toast.success('Paso completado')
          await loadCurrentStep()
        }
        setFormData({})
      } else {
        throw new Error(result.error || 'Error desconocido')
      }
      
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Error procesando interacción')
    } finally {
      setProcessing(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Extraer datos del formulario
    const form = e.target as HTMLFormElement
    const formDataObj = new FormData(form)
    const data: Record<string, any> = {}
    
    for (const [key, value] of formDataObj.entries()) {
      if (data[key]) {
        // Manejar múltiples valores (checkboxes)
        if (Array.isArray(data[key])) {
          data[key].push(value)
        } else {
          data[key] = [data[key], value]
        }
      } else {
        data[key] = value
      }
    }
    
    handleInteraction(data)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked ? value : ''
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Cargando paso...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stepData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No se pudo cargar el paso actual
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header con estado */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ejecución de Flujo</CardTitle>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              stepData.status === 'running' ? 'bg-blue-100 text-blue-800' :
              stepData.status === 'completed' ? 'bg-green-100 text-green-800' :
              stepData.status === 'failed' ? 'bg-red-100 text-red-800' :
              stepData.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {stepData.status === 'running' ? 'En ejecución' : 
               stepData.status === 'completed' ? 'Completado' : 
               stepData.status === 'failed' ? 'Error' : 
               stepData.status === 'paused' ? 'Pausado' : 
               stepData.status}
            </span>
          </div>
        </CardHeader>
      </Card>

      {/* Contenido del paso */}
      <Card>
        <CardContent className="p-6">
          {stepData.status === 'completed' ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">¡Flujo Completado!</h3>
              <p className="text-gray-600">El proceso ha finalizado exitosamente.</p>
            </div>
          ) : stepData.status === 'failed' ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error en el Flujo</h3>
              <p className="text-gray-600">Ha ocurrido un error durante la ejecución.</p>
            </div>
          ) : stepData.status === 'paused' ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Flujo Pausado</h3>
              <p className="text-gray-600">El flujo se reanudará automáticamente.</p>
            </div>
          ) : stepData.type === 'start' ? (
            <StartTable
              title={stepData.title || 'Seleccionar Legajo'}
              description={stepData.description}
              legajos={stepData.legajos || []}
              onSelect={(legajoId) => handleInteraction({ legajo_id: legajoId })}
              processing={processing}
              submitLabel={stepData.transitions[0]?.label || 'Continuar'}
            />
          ) : stepData.type === 'form' ? (
            <FormRenderer
              title={stepData.title || 'Formulario'}
              description={stepData.description}
              fields={stepData.fields || []}
              onSubmit={handleInteraction}
              processing={processing}
              submitLabel={stepData.transitions[0]?.label || 'Continuar'}
            />
          ) : stepData.type === 'email' ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{stepData.title}</h2>
                {stepData.description && <p className="text-gray-600 mt-1">{stepData.description}</p>}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-blue-900 mb-2">Enviando Email</h3>
                <p className="text-blue-700 mb-4">Se está procesando el envío del email...</p>
                <div className="text-sm text-blue-600">
                  <p><strong>Para:</strong> {stepData.config?.to || 'legajo@email.com'}</p>
                  <p><strong>Asunto:</strong> {stepData.config?.subject || 'Notificación'}</p>
                </div>
              </div>
              
              <button
                onClick={() => handleInteraction({})}
                disabled={processing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </div>
                ) : (
                  stepData.transitions[0]?.label || 'Continuar'
                )}
              </button>
            </div>
          ) : stepData.type === 'summary' ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{stepData.title}</h2>
                {stepData.description && <p className="text-gray-600 mt-1">{stepData.description}</p>}
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-2">✅ {stepData.content?.message}</h3>
                <p className="text-green-700">{stepData.content?.details}</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Resumen:</h4>
                <ul className="text-blue-700 space-y-1">
                  {stepData.content?.summary?.map((item: string, index: number) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
              
              <button
                onClick={() => handleInteraction({})}
                disabled={processing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </div>
                ) : (
                  stepData.transitions[0]?.label || 'Continuar'
                )}
              </button>
            </div>
          ) : stepData.type === 'completed' ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{stepData.title}</h3>
              <p className="text-gray-600">{stepData.description}</p>
            </div>
          ) : (
            <div 
              dangerouslySetInnerHTML={{ __html: stepData.html || '' }}
              className="flow-step-content"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}