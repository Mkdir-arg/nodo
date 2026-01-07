'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ConfirmMoveFieldModalProps {
  isOpen: boolean;
  fieldLabel: string;
  fromPage: string;
  toPage: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmMoveFieldModal({
  isOpen,
  fieldLabel,
  fromPage,
  toPage,
  onConfirm,
  onCancel
}: ConfirmMoveFieldModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Mover campo
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              El campo <span className="font-medium">"{fieldLabel}"</span> ya está asignado a{' '}
              <span className="font-medium">"{fromPage}"</span>.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              ¿Querés moverlo a <span className="font-medium">"{toPage}"</span>?
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>
            Mover
          </Button>
        </div>
      </div>
    </div>
  );
}
