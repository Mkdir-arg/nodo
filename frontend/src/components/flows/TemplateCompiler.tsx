'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/lib/toast'

interface TemplateCompilerProps {
  plantillaId: string
  plantillaNombre: string
  onFlowCompiled?: (flowId: string) => void
}

export function TemplateCompiler({ plantillaId, plantillaNombre, onFlowCompiled }: TemplateCompilerProps) {
  const [flowName, setFlowName] = useState(`Flow_${plantillaNombre}`)
  const [compiling, setCompiling] = useState(false)

  const compileTemplate = async () => {
    if (!flowName.trim()) {
      toast.error('Debe especificar un nombre para el flujo')
      return
    }

    try {
      setCompiling(true)
      
      const response = await fetch('/api/flows/flows/compile_from_template/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plantilla_id: plantillaId,
          flow_name: flowName.trim()
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error compilando plantilla')
      }
      
      const flow = await response.json()
      
      toast.success('Plantilla compilada exitosamente')
      
      if (onFlowCompiled) {
        onFlowCompiled(flow.id)
      }
      
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Error compilando plantilla')
    } finally {
      setCompiling(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compilar Plantilla a Flujo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          Plantilla: <span className="font-medium">{plantillaNombre}</span>
        </div>
        
        <div>
          <Label htmlFor="flowName">Nombre del Flujo</Label>
          <Input
            id="flowName"
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            placeholder="Ingrese el nombre del flujo"
            disabled={compiling}
          />
        </div>

        <Button 
          onClick={compileTemplate} 
          disabled={compiling || !flowName.trim()}
          className="w-full"
        >
          {compiling ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Compilando...
            </>
          ) : (
            'Compilar a Flujo Ejecutable'
          )}
        </Button>

        <div className="text-xs text-gray-500">
          <p>La compilación convertirá:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Secciones de formulario → Nodos Form</li>
            <li>Secciones de evaluación → Nodos Evaluation</li>
            <li>Acciones configuradas → Nodos de acción</li>
            <li>Flujo lineal con transiciones automáticas</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}