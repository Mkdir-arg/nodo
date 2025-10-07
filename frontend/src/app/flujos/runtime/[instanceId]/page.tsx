'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { FlowRuntime } from '@/components/flows/FlowRuntime'
import { Card, CardContent } from '@/components/ui/card'

type HeaderInfo = {
  flowName?: string
  stepTitle?: string
  nodeName?: string
  stepIndex?: number
  stepsTotal?: number
  status?: string
}

export default function FlowRuntimePage() {
  const params = useParams()
  const instanceId = params.instanceId as string
  const [headerInfo, setHeaderInfo] = useState<HeaderInfo>({})

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

  const detailPieces = [
    headerInfo.stepTitle,
    headerInfo.nodeName && headerInfo.nodeName !== headerInfo.stepTitle ? headerInfo.nodeName : undefined,
    headerInfo.stepIndex && headerInfo.stepsTotal ? `Paso ${headerInfo.stepIndex} de ${headerInfo.stepsTotal}` : undefined
  ].filter(Boolean) as string[]

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {headerInfo.flowName || 'Ejecución de Flujo'}
        </h1>
        {detailPieces.length > 0 && (
          <p className="text-gray-600">{detailPieces.join(' • ')}</p>
        )}
        <p className="text-sm text-gray-500">
          Instancia: {instanceId}
        </p>
      </div>
      
      <FlowRuntime 
        instanceId={instanceId}
        onMetadataChange={(metadata) => setHeaderInfo(metadata)}
      />
    </div>
  )
}
