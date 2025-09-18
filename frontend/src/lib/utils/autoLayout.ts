import ELK from 'elkjs/lib/elk.bundled.js';
import type { Node, Edge } from 'reactflow';
import type { FlowStep } from '@/lib/flows/types';

const elk = new ELK();

// ELK layout options
const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.spacing.nodeNode': '80',
  'elk.direction': 'RIGHT',
  'elk.layered.nodePlacement.strategy': 'SIMPLE',
};

export async function getLayoutedElements(
  steps: FlowStep[],
  edges: Edge[]
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  
  // Convert steps to ELK nodes
  const elkNodes = steps.map((step) => ({
    id: step.id,
    width: step.type === 'start' ? 220 : 200,
    height: 80,
  }));

  // Convert React Flow edges to ELK edges
  const elkEdges = edges.map((edge) => ({
    id: edge.id,
    sources: [edge.source],
    targets: [edge.target],
  }));

  const elkGraph = {
    id: 'root',
    layoutOptions: elkOptions,
    children: elkNodes,
    edges: elkEdges,
  };

  try {
    const layoutedGraph = await elk.layout(elkGraph);
    
    // Convert back to React Flow format
    const layoutedNodes: Node[] = steps.map((step) => {
      const elkNode = layoutedGraph.children?.find((n) => n.id === step.id);
      
      return {
        id: step.id,
        type: step.type === 'start' ? 'start' : 'custom',
        position: {
          x: elkNode?.x ?? 0,
          y: elkNode?.y ?? 0,
        },
        data: {
          step,
          onEdit: () => {},
          onDelete: () => {},
        },
      };
    });

    return {
      nodes: layoutedNodes,
      edges,
    };
  } catch (error) {
    console.error('Layout failed:', error);
    
    // Fallback to simple horizontal layout
    const fallbackNodes: Node[] = steps.map((step, index) => ({
      id: step.id,
      type: step.type === 'start' ? 'start' : 'custom',
      position: {
        x: index * 250,
        y: 100,
      },
      data: {
        step,
        onEdit: () => {},
        onDelete: () => {},
      },
    }));

    return {
      nodes: fallbackNodes,
      edges,
    };
  }
}

export function createEdgesFromSteps(steps: FlowStep[]): Edge[] {
  const edges: Edge[] = [];
  
  steps.forEach((step) => {
    if (step.nextStepId) {
      edges.push({
        id: `${step.id}-${step.nextStepId}`,
        source: step.id,
        target: step.nextStepId,
        type: 'smoothstep',
        animated: step.type === 'start',
      });
    }
  });

  return edges;
}