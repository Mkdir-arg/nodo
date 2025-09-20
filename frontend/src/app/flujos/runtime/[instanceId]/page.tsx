'use client'

import { useParams } from 'next/navigation'
import { FlowRuntime } from '@/components/flows/FlowRuntime'
import { Card, CardContent } from '@/components/ui/card'

export default function FlowRuntimePage() {
  const params = useParams()
  const instanceId = params.instanceId as string

  if (!instanceId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              ID de instancia no válido
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ejecución de Flujo</h1>
        <p className="text-gray-600">Instancia: {instanceId}</p>
      </div>
      
      <FlowRuntime instanceId={instanceId} />
    </div>
  )
}