import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  message?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="flex items-center gap-1 mt-1.5 text-xs text-red-600 dark:text-red-400">
      <AlertCircle className="w-3 h-3 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};
