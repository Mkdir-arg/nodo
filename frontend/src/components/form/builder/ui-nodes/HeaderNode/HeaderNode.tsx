import { User, Printer, MapPin, List, Bell, Settings, LogOut } from 'lucide-react';
import type { HeaderNode } from './types';

interface HeaderNodeProps {
  node: HeaderNode;
  isSelected?: boolean;
  onClick?: () => void;
  realTime?: boolean; // Para preview en tiempo real
}

const iconMap = {
  user: User,
  printer: Printer,
  'map-pin': MapPin,
  list: List,
  bell: Bell,
  settings: Settings,
  'log-out': LogOut,
  home: User, // fallback
  phone: User,
  mail: User,
  calendar: User,
  'file-text': User,
  download: User,
  upload: User,
  edit: User,
  trash: User,
  copy: User,
  share: User,
  image: User,
  camera: User,
  check: User,
  x: User,
  heart: User,
  star: User,
  plus: User,
  minus: User,
  eye: User,
  'eye-off': User,
  lock: User,
  unlock: User,
};

export function HeaderNodePreview({ node, isSelected, onClick, realTime = false }: HeaderNodeProps) {
  const config = node.config;
  
  if (!config || node.variant !== 'hero-glass') {
    // Fallback para headers antiguos
    return (
      <div 
        className={`relative h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg cursor-pointer ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={onClick}
      >
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Encabezado Básico</h3>
            <p className="text-sm opacity-80">Configuración antigua</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative h-48 rounded-lg overflow-hidden cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onClick}
    >
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-300"
        style={{ 
          backgroundImage: `url(${config.background.imageUrl})`,
        }}
      >
        {config.background.overlay.enabled && (
          <div 
            className="absolute inset-0 bg-black transition-opacity duration-300"
            style={{ opacity: config.background.overlay.opacity }}
          />
        )}
      </div>

      {/* Topbar */}
      {config.topbar.enabled && (
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
            {config.topbar.actions.map((action, idx) => {
              const Icon = iconMap[action as keyof typeof iconMap] || Settings;
              return (
                <div key={idx} className="w-6 h-6 text-white/80">
                  <Icon size={16} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Card */}
      {config.card.enabled && (
        <div className="absolute bottom-4 left-4 right-4">
          <div 
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4"
            style={{ 
              backdropFilter: `blur(${config.card.glass.blur}px)`,
              backgroundColor: `rgba(255, 255, 255, ${config.card.glass.opacity})`
            }}
          >
            {/* Left Icon */}
            {config.card.leftIcon.enabled && (
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white transition-all duration-300"
                style={{
                  background: `linear-gradient(${config.card.leftIcon.gradient.angle}deg, ${config.card.leftIcon.gradient.from}, ${config.card.leftIcon.gradient.to})`
                }}
              >
                {(() => {
                  const Icon = iconMap[config.card.leftIcon.icon as keyof typeof iconMap] || User;
                  return <Icon size={20} />;
                })()}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate transition-all duration-200">
                {config.card.title || 'Título del encabezado'}
              </h3>
              <p className="text-sm text-gray-600 truncate transition-all duration-200">
                {config.card.subtitle || 'Subtítulo'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {config.card.actions.map((action) => {
                const Icon = iconMap[action.icon as keyof typeof iconMap] || Printer;
                return (
                  <div 
                    key={action.id}
                    className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600"
                  >
                    <Icon size={16} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Builder overlay */}
      {!realTime && (
        <div className="absolute inset-0 bg-blue-500/10 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-sm font-medium text-gray-900">
            Encabezado Hero
          </div>
        </div>
      )}
    </div>
  );
}