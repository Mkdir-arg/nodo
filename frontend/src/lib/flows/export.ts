import type { Flow } from './types';

export function exportFlow(flow: Flow): string {
  const exportData = {
    version: '1.0',
    flow: {
      name: flow.name,
      description: flow.description,
      steps: flow.steps,
    },
    exportedAt: new Date().toISOString(),
  };
  
  return JSON.stringify(exportData, null, 2);
}

export function downloadFlowAsJSON(flow: Flow): void {
  const jsonString = exportFlow(flow);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${flow.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_flow.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

export function importFlow(jsonString: string): Omit<Flow, 'id' | 'createdAt' | 'updatedAt'> {
  try {
    const data = JSON.parse(jsonString);
    
    if (!data.flow || !data.flow.steps) {
      throw new Error('Formato de archivo inválido');
    }
    
    return {
      name: data.flow.name || 'Flujo Importado',
      description: data.flow.description || '',
      steps: data.flow.steps || [],
    };
  } catch (error) {
    throw new Error('Error al importar flujo: ' + (error as Error).message);
  }
}