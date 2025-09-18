import { ArrowLeft } from 'lucide-react';
import { Button } from './button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, onBack, actions }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="outline" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}