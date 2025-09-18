'use client';

import { useCallback, useMemo } from 'react';
import ReactFlow, { 
  Node, 
  Edge, 
  addEdge, 
  Background, 
  Controls,
  useNodesState,
  useEdgesState,
  Connection
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FlowStep } from '@/lib/flows/types';

interface FlowCanvasAdvancedProps {
  steps: FlowStep[];
  onAddStep: () => void;
  onEditStep: (step: FlowStep) => void;
  onDeleteStep: (stepId: string) => void;
  onConnectSteps: (sourceId: string, targetId: string) => void;
}

export default function FlowCanvasAdvanced({ 
  steps, 
  onAddStep, 
  onEditStep, 
  onDeleteStep,
  onConnectSteps 
}: FlowCanvasAdvancedProps) {
  
  const initialNodes: Node[] = useMemo(() => 
    steps.map((step, index) => ({
      id: step.id,
      position: step.position || { x: 100 + index * 200, y: 100 },
      data: { 
        label: step.name,
        step,
        onEdit: () => onEditStep(step),
        onDelete: () => onDeleteStep(step.id)
      },
      type: 'default'
    })), [steps, onEditStep, onDeleteStep]
  );

  const initialEdges: Edge[] = useMemo(() => 
    steps.filter(step => step.nextStepId).map(step => ({
      id: `${step.id}-${step.nextStepId}`,
      source: step.id,
      target: step.nextStepId!,
      type: 'smoothstep'
    })), [steps]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: Connection) => {
    if (params.source && params.target) {
      onConnectSteps(params.source, params.target);
      setEdges((eds) => addEdge(params, eds));
    }
  }, [onConnectSteps, setEdges]);

  return (
    <div className="w-full h-96 border rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
      
      <div className="absolute top-4 left-4">
        <Button onClick={onAddStep} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Agregar Paso
        </Button>
      </div>
    </div>
  );
}