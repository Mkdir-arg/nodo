import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GitBranch, ArrowRight } from 'lucide-react';
import type { ConditionConfig, FlowStep } from '@/lib/flows/types';

interface BranchConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceStep: FlowStep;
  targetStepId: string;
  onConnect: (branchId: string | 'fallback') => void;
}

export function BranchConnectionModal({
  isOpen,
  onClose,
  sourceStep,
  targetStepId,
  onConnect,
}: BranchConnectionModalProps) {
  const [selectedBranch, setSelectedBranch] = useState<string | 'fallback' | null>(null);
  
  const config = (sourceStep.config || {}) as ConditionConfig;
  const branches = config.branches || [];
  
  const handleConnect = () => {
    if (selectedBranch) {
      onConnect(selectedBranch);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-orange-500" />
            Conectar Rama de Condición
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Selecciona qué rama de la condición &quot;{sourceStep.name}&quot; debe conectarse al paso destino.
          </p>
          
          <div className="space-y-2">
            {branches.map((branch, index) => (
              <div
                key={branch.id || index}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedBranch === branch.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedBranch(branch.id || `branch-${index}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">
                      {branch.label || `Ruta ${index + 1}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {branch.rules?.length || 0} condición(es) • Lógica: {branch.logic || 'AND'}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
            
            <div
              className={`p-3 border rounded-lg cursor-pointer transition-colors border-dashed ${
                selectedBranch === 'fallback'
                  ? 'border-gray-500 bg-gray-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => setSelectedBranch('fallback')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-gray-700">
                    Ruta Alternativa (Fallback)
                  </div>
                  <div className="text-xs text-gray-500">
                    Se ejecuta si ninguna rama cumple las condiciones
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleConnect} 
              disabled={!selectedBranch}
              className="flex-1"
            >
              Conectar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}