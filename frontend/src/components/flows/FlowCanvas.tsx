'use client';

import { useCallback, useMemo, useEffect } from 'react';
import ReactFlow, { 
  Node, 
  Edge, 
  addEdge, 
  Background, 
  Controls,
  useNodesState,
  useEdgesState,
  Connection,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, Mail, Globe, Clock, GitBranch, Database, Shuffle, Play, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FlowStep } from '@/lib/flows/types';

// Custom Node Component with icons
function CustomNode({ data }: { data: any }) {
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'start': return <Play className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'http': return <Globe className="h-4 w-4" />;
      case 'delay': return <Clock className="h-4 w-4" />;
      case 'condition': return <GitBranch className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      case 'transform': return <Shuffle className="h-4 w-4" />;
      default: return <Plus className="h-4 w-4" />;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'start': return 'border-green-500 bg-green-50';
      case 'email': return 'border-blue-500 bg-blue-50';
      case 'http': return 'border-purple-500 bg-purple-50';
      case 'delay': return 'border-yellow-500 bg-yellow-50';
      case 'condition': return 'border-orange-500 bg-orange-50';
      case 'database': return 'border-indigo-500 bg-indigo-50';
      case 'transform': return 'border-pink-500 bg-pink-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className={`px-4 py-3 shadow-lg rounded-xl border-2 ${getNodeColor(data.type)} min-w-[180px] bg-white`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${getNodeColor(data.type).replace('bg-', 'bg-').replace('-50', '-100')}`}>
          {getNodeIcon(data.type)}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-gray-800">{data.label}</div>
          <div className="text-xs text-gray-500 capitalize">{data.type}</div>
        </div>
        {data.stepNumber && (
          <div className="bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {data.stepNumber}
          </div>
        )}
      </div>
      
      <div className="flex gap-1 justify-end">
        <button
          onClick={() => data.onEdit(data.step)}
          className="p-1 hover:bg-gray-100 rounded text-blue-600"
        >
          <Edit className="h-3 w-3" />
        </button>
        <button
          onClick={() => data.onDelete(data.step.id)}
          className="p-1 hover:bg-gray-100 rounded text-red-600"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}

const nodeTypes = {
  custom: CustomNode,
};

interface FlowCanvasProps {
  steps: FlowStep[];
  onAddStep: () => void;
  onEditStep: (step: FlowStep) => void;
  onDeleteStep: (stepId: string) => void;
  onConnectSteps: (sourceId: string, targetId: string) => void;
  onUpdatePositions: (steps: FlowStep[]) => void;
}

export default function FlowCanvas({ 
  steps, 
  onAddStep, 
  onEditStep, 
  onDeleteStep,
  onConnectSteps,
  onUpdatePositions 
}: FlowCanvasProps) {
  
  const initialNodes: Node[] = useMemo(() => {
    // Calculate step numbers
    const stepOrder = new Map<string, number>();
    const startStep = steps.find(step => step.type === 'start');
    
    if (startStep) {
      let currentStep = startStep;
      let stepNumber = 1;
      while (currentStep) {
        stepOrder.set(currentStep.id, stepNumber++);
        currentStep = steps.find(step => step.id === currentStep?.nextStepId);
      }
    }
    
    return steps.map((step, index) => ({
      id: step.id,
      position: step.position || { x: 100 + index * 250, y: 100 },
      data: { 
        label: step.name,
        type: step.type,
        step,
        stepNumber: stepOrder.get(step.id),
        onEdit: onEditStep,
        onDelete: onDeleteStep
      },
      type: 'custom',
      draggable: true
    }));
  }, [steps, onEditStep, onDeleteStep]);

  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    let stepNumber = 1;
    
    // Create a map to track step order
    const stepOrder = new Map<string, number>();
    const startStep = steps.find(step => step.type === 'start');
    
    if (startStep) {
      let currentStep = startStep;
      while (currentStep) {
        stepOrder.set(currentStep.id, stepNumber++);
        currentStep = steps.find(step => step.id === currentStep?.nextStepId);
      }
    }
    
    steps.filter(step => step.nextStepId).forEach(step => {
      const sourceNum = stepOrder.get(step.id);
      const targetNum = stepOrder.get(step.nextStepId!);
      
      edges.push({
        id: `${step.id}-${step.nextStepId}`,
        source: step.id,
        target: step.nextStepId!,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 3 },
        label: sourceNum && targetNum ? `${sourceNum} → ${targetNum}` : '',
        labelStyle: { 
          fill: '#6366f1', 
          fontWeight: 'bold', 
          fontSize: '12px',
          background: '#ffffff',
          padding: '2px 6px',
          borderRadius: '4px',
          border: '1px solid #6366f1'
        },
        labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 }
      });
    });
    
    return edges;
  }, [steps]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when steps change
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // Update edges when steps change
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onConnect = useCallback((params: Connection) => {
    if (params.source && params.target) {
      onConnectSteps(params.source, params.target);
      // Don't add edge here, it will be added when steps update
    }
  }, [onConnectSteps]);

  const onNodeDragStop = useCallback((event: any, node: Node) => {
    const updatedSteps = steps.map(step => 
      step.id === node.id 
        ? { ...step, position: node.position }
        : step
    );
    onUpdatePositions(updatedSteps);
  }, [steps, onUpdatePositions]);

  return (
    <div className="w-full h-[500px] border rounded-lg bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
      >
        <Background variant="dots" gap={20} size={1} />
        <Controls />
      </ReactFlow>
      
      <div className="absolute bottom-4 left-4">
        <Button onClick={onAddStep} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Paso
        </Button>
      </div>
    </div>
  );
}