'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/lib/toast'

interface Flow {
  id: string
  name: string
  description: string
  is_active: boolean
}

interface FlowLauncherProps {
  legajoId: string
  onFlowStarted?: (instanceId: string) => void
}

export function FlowLauncher({ legajoId, onFlowStarted }: FlowLauncherProps) {
  const [flows, setFlows] = useState<Flow[]>([])
  const [selectedFlowId, setSelectedFlowId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    loadAvailableFlows()
  }, [])

  const loadAvailableFlows = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/flows/flows/?is_active=true')
      
      if (!response.ok) {
        throw new Error('Error cargando flujos')
      }
      
      const data = await response.json()
      setFlows(data.results || data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error cargando flujos disponibles')
    } finally {
      setLoading(false)
    }
  }

  const startFlow = async () => {
    if (!selectedFlowId) {
      toast.error('Debe seleccionar un flujo')
      return
    }

    try {
      setStarting(true)
      
      const response = await fetch('/api/flows/instances/create_from_legajo/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flow_id: selectedFlowId,
          legajo_id: legajoId
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error iniciando flujo')
      }
      
      const instance = await response.json()
      
      toast.success('Flujo iniciado exitosamente')
      
      if (onFlowStarted) {
        onFlowStarted(instance.id)
      }
      
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Error iniciando flujo')
    } finally {
      setStarting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Cargando flujos...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Iniciar Flujo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Flujo
          </label>
          <Select value={selectedFlowId} onValueChange={setSelectedFlowId}>
            <SelectTrigger>
              <SelectValue placeholder="-- Seleccione un flujo --" />
            </SelectTrigger>
            <SelectContent>
              {flows.map((flow) => (
                <SelectItem key={flow.id} value={flow.id}>
                  <div>
                    <div className="font-medium">{flow.name}</div>
                    {flow.description && (
                      <div className="text-sm text-gray-500">{flow.description}</div>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={startFlow} 
          disabled={!selectedFlowId || starting}
          className="w-full"
        >
          {starting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Iniciando...
            </>
          ) : (
            'Iniciar Flujo'
          )}
        </Button>

        {flows.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No hay flujos disponibles
          </div>
        )}
      </CardContent>
    </Card>
  )
}