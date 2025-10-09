'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormRenderer } from './FormRenderer'
import { StartTable } from './StartTable'
import { EvaluationRenderer } from './renderers/EvaluationRenderer'
import { toast } from '@/lib/toast'

interface FlowRuntimeProps {
  instanceId: string
  onMetadataChange?: (metadata: FlowMetadata) => void
}

interface FlowMetadata {
  flowName?: string
  stepTitle?: string
  nodeName?: string
  stepIndex?: number
  stepsTotal?: number
  status?: string
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
  questions?: any[]
  scoring_ranges?: any[]
  flow_name?: string
  node_name?: string
  step_index?: number
  steps_total?: number
  step_title?: string
  transitions: Array<{
    id: string
    label: string
    to_step_id: string
  }>
  status: string
  current_step_id: string | null
}

export function FlowRuntime({ instanceId, onMetadataChange }: FlowRuntimeProps) {
  const [stepData, setStepData] = useState<StepData | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const metadataRef = useRef(onMetadataChange)

  useEffect(() => {
    metadataRef.current = onMetadataChange
  }, [onMetadataChange])
  const loadLegajos = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/api/legajos/')
      
      if (!response.ok) {
        throw new Error('Error cargando legajos')
      }
      
      const legajosData = await response.json()
      console.log('Legajos loaded:', legajosData)
      
      const legajosFormatted = (legajosData.results || legajosData).map((legajo: any) => {
        const data = legajo.data || {}
        return {
          id: legajo.id,
          created_at: legajo.created_at,
          apellido: data.texto || data.apellido || '',
          nombre: data.texto_2 || data.nombre || '',
          email: data.email || '',
          telefono: data.telefono || '',
          estado: legajo.estado || 'ACTIVO'
        }
      })
      
      setStepData(prev => prev ? {
        ...prev,
        legajos: legajosFormatted
      } : null)
      
    } catch (error) {
      console.error('Error loading legajos:', error)
      toast.error('Error cargando legajos')
    }
  }, [])

  const loadCurrentStep = useCallback(async () => {
    try {
      setLoading(true)
      
      if (instanceId.startsWith('flow-')) {
        const flowId = instanceId.replace('flow-', '')
        const flowResponse = await fetch(`http://localhost:8000/api/flows/${flowId}/`)
        
        if (!flowResponse.ok) {
          throw new Error('No se pudo cargar el flujo')
        }
        
        const flowData = await flowResponse.json()
        console.log('Flow data:', flowData)
        
        // Para flujos, siempre mostrar el nodo start
        const stepData = {
          type: 'start',
          title: flowData.name || 'Seleccionar Legajo',
          description: flowData.description || 'Seleccione un legajo para iniciar el proceso',
          config: {
            tableColumns: [
              { key: 'id', label: 'ID' },
              { key: 'created_at', label: 'Creado' },
              { key: 'apellido', label: 'Apellido' },
              { key: 'nombre', label: 'Nombre' }
            ]
          },
          legajos: [],
          transitions: [{ id: 'select', label: 'Continuar', to_step_id: 'next' }],
          status: 'running',
          current_step_id: 'start',
          flow_name: flowData.name || 'Flujo',
          node_name: 'Inicio',
          step_index: 1,
          steps_total: Array.isArray(flowData.steps) ? flowData.steps.length : undefined,
          step_title: flowData.name || 'Seleccionar Legajo'
        }
        
        setStepData(stepData)
        metadataRef.current?.({
          flowName: stepData.flow_name || stepData.title,
          stepTitle: stepData.step_title || stepData.title,
          nodeName: stepData.node_name,
          stepIndex: stepData.step_index,
          stepsTotal: stepData.steps_total,
          status: stepData.status
        })
        return
      }
      
      // Solo para instancias reales (no flow-X)
      const response = await fetch(`http://localhost:8000/api/instances/${instanceId}/current_step/`)
      console.log('Current step response status:', response.status)
      
      if (!response.ok) {
        console.error('Current step error:', await response.text())
        throw new Error('No se pudo cargar el paso actual')
      }
      
      const data = await response.json()
      console.log('Current step data:', data)
      setStepData(data)
      metadataRef.current?.({
        flowName: data.flow_name || data.title,
        stepTitle: data.step_title || data.title,
        nodeName: data.node_name,
        stepIndex: data.step_index,
        stepsTotal: data.steps_total,
        status: data.status
      })
      
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error cargando el paso actual')
    } finally {
      await loadLegajos()
      setLoading(false)
    }
  }, [instanceId, loadLegajos])

  useEffect(() => {
    loadCurrentStep()
  }, [loadCurrentStep])

  const handleInteraction = async (interactionData: Record<string, any> = {}) => {
    try {
      setProcessing(true)
      
      if (instanceId.startsWith('flow-') && interactionData.legajo_id) {
        const flowId = instanceId.replace('flow-', '')
        
        // Primero verificar si ya existe una instancia para este legajo
        const instancesResponse = await fetch(`http://localhost:8000/api/instances/?flow=${flowId}`)
        if (instancesResponse.ok) {
          const instances = await instancesResponse.json()
          const existingInstance = instances.find((inst: any) => inst.legajo_id === interactionData.legajo_id)
          
          if (existingInstance) {
            // Usar instancia existente
            window.location.href = `/flujos/runtime/${existingInstance.id}`
            return
          }
        }
        
        // Si no existe, crear nueva instancia
        const createResponse = await fetch(`http://localhost:8000/api/instances/create_from_legajo/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            flow_id: flowId,
            legajo_id: interactionData.legajo_id
          })
        })
        
        if (!createResponse.ok) {
          const errorData = await createResponse.json()
          throw new Error(errorData.error || 'Error creando instancia')
        }
        
        const newInstance = await createResponse.json()
        toast.success('Instancia creada exitosamente')
        
        // Redirigir a la nueva instancia
        window.location.href = `/flujos/runtime/${newInstance.id}`
        return
      }
      
      // Si es flow-X, no hacer interact directo
      if (instanceId.startsWith('flow-')) {
        throw new Error('Debe seleccionar un legajo primero')
      }
      
      const response = await fetch(`http://localhost:8000/api/instances/${instanceId}/interact/`, {
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{stepData.flow_name || 'Ejecución de Flujo'}</CardTitle>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              stepData.status === 'running' ? 'bg-blue-100 text-blue-800' :
              stepData.status === 'completed' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {stepData.status === 'running' ? 'En Ejecución' :
               stepData.status === 'completed' ? 'Completado' : 'Pendiente'}
            </span>
          </div>
          {(stepData.step_title || stepData.title || stepData.node_name) && (
            <p className="mt-2 text-sm text-gray-600">
              {stepData.step_title || stepData.title || stepData.node_name}
              {stepData.node_name && stepData.node_name !== (stepData.step_title || stepData.title) ? ` • ${stepData.node_name}` : ''}
              {stepData.step_index && stepData.steps_total ? ` • Paso ${stepData.step_index}${stepData.steps_total ? ` de ${stepData.steps_total}` : ''}` : ''}
            </p>
          )}
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-6">
          {stepData.type === 'start' && (
            <StartTable
              title={stepData.title || 'Seleccionar Legajo'}
              description={stepData.description}
              legajos={stepData.legajos || []}
              columns={stepData.config?.tableColumns || [
                { key: 'id', label: 'ID' },
                { key: 'created_at', label: 'Creado' },
                { key: 'apellido', label: 'Apellido' },
                { key: 'nombre', label: 'Nombre' }
              ]}
              onSelect={(legajoId) => handleInteraction({ legajo_id: legajoId })}
              processing={processing}
            />
          )}
          
          {stepData.type === 'form' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">💾 Información de Almacenamiento</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Tabla:</strong> flows_instanciaflujo</p>
                  <p><strong>Campo:</strong> context (JSON)</p>
                  <p><strong>ID Instancia:</strong> {instanceId}</p>
                  <p><strong>Ruta:</strong> context.forms.step_{stepData.current_step_id}</p>
                </div>
              </div>
              
              <FormRenderer
                title={stepData.title || 'Formulario'}
                description={stepData.description}
                fields={stepData.fields || []}
                onSubmit={handleInteraction}
                processing={processing}
                submitLabel="Guardar y Continuar"
              />
            </div>
          )}
          
          {stepData.type === 'evaluation' && (
            <EvaluationRenderer
              title={stepData.title || 'Evaluación'}
              description={stepData.description}
              questions={stepData.questions || []}
              scoring_ranges={stepData.scoring_ranges || []}
              onSubmit={handleInteraction}
              processing={processing}
            />
          )}
          
          {stepData.html && (
            <div dangerouslySetInnerHTML={{ __html: stepData.html }} />
          )}
          
          {stepData.transitions && stepData.transitions.length > 0 && stepData.type !== 'start' && stepData.type !== 'form' && (
            <div className="mt-6 flex gap-2">
              {stepData.transitions.map((transition) => (
                <Button
                  key={transition.id}
                  onClick={() => handleInteraction({ transition_id: transition.id })}
                  disabled={processing}
                  variant="default"
                >
                  {transition.label || 'Continuar'}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
