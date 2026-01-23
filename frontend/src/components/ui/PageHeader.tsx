import { ArrowLeft } from 'lucide-react';
import { Button } from './button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  backgroundImageUrl?: string;
  heroActions?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  onBack,
  actions,
  backgroundImageUrl,
  heroActions,
}: PageHeaderProps) {
  return (
    <div className="relative w-full mb-20">
      {/* Imagen de fondo */}
      <div className="w-full max-w-[1564px] h-[430px] rounded-2xl mx-auto relative z-0">
        <div
          className={`absolute inset-0 bg-cover bg-center ${backgroundImageUrl ? '' : 'bg-primary-gradient'}`}
          style={backgroundImageUrl ? { backgroundImage: `url(${backgroundImageUrl})` } : undefined}
        />
        <div className="absolute inset-0 bg-black/10" />

        {heroActions && (
          <div className="absolute top-4 right-4">
            <div className="bg-white/70 backdrop-blur-md rounded-full px-3 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                {heroActions}
              </div>
            </div>
          </div>
        )}
        
        {/* Card con informacion - mitad dentro/fuera */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 w-full max-w-[1524px] h-[113px] bg-white rounded-xl shadow-nodo flex items-center gap-[10px] px-[17px] py-[16px] z-10"
          style={{ top: '373.5px' }}
        >
          {/* Icono */}
          <div className="w-16 h-16 bg-primary-pink rounded-xl flex items-center justify-center text-white flex-shrink-0">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          
          {/* Texto */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-nodo-legajo-name truncate">{title}</h1>
            {subtitle && (
              <p className="text-sm text-nodo-legajo-subtitle truncate">{subtitle}</p>
            )}
          </div>
          
          {/* Acciones */}
          {(onBack || actions) && (
            <div className="flex items-center gap-2">
              {onBack && (
                <Button variant="outline" onClick={onBack} size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              )}
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
