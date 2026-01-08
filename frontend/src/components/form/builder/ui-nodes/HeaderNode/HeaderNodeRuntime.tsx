'use client';

import { User, Printer, MapPin, List, Bell, Settings, LogOut, Edit } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import type { HeaderNode } from './types';

interface HeaderNodeRuntimeProps {
  node: HeaderNode;
  data?: Record<string, any>;
  meta?: Record<string, any>;
  context?: Record<string, any>;
}

const iconMap = {
  user: User,
  printer: Printer,
  'map-pin': MapPin,
  list: List,
  bell: Bell,
  settings: Settings,
  'log-out': LogOut,
  edit: Edit,
};

function resolveTemplate(template: string, context: { data?: any; meta?: any; context?: any }): string {
  try {
    return template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, path) => {
      const value = path
        .trim()
        .split('.')
        .reduce((obj: any, key: string) => obj?.[key.trim()], context);
      return value != null ? String(value) : match; // Mantener template si no hay valor
    });
  } catch {
    return template;
  }
}

export function HeaderNodeRuntime({ node, data = {}, meta = {}, context = {} }: HeaderNodeRuntimeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const config = node.config;
  const templateContext = { data, meta, context };

  if (!config || node.variant !== 'hero-glass') {
    return null;
  }

  const handleAction = (action: any) => {
    const isEditAction = action?.icon === 'edit' || action?.id === 'edit';
    const legajoId = templateContext.meta?.legajoId;

    if (isEditAction && legajoId) {
      const isInEditMode = /\/editar\/?$/.test(pathname || '');
      if (isInEditMode) return;
      router.push(`/legajos/${legajoId}/editar`);
      return;
    }

    if (action.type === 'navigate' && action.to) {
      const resolvedUrl = resolveTemplate(action.to, templateContext);
      router.push(resolvedUrl);
      return;
    }

    if (action.type === 'command' && action.name === 'print') {
      window.print();
    }
  };

  return (
    <div className="relative h-64 rounded-lg overflow-hidden mb-6">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${config.background.imageUrl})`,
        }}
      >
        {config.background.overlay.enabled && (
          <div 
            className="absolute inset-0 bg-black"
            style={{ opacity: config.background.overlay.opacity }}
          />
        )}
      </div>

      {/* Topbar */}
      {config.topbar.enabled && (
        <div className="absolute top-6 right-6">
          <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            {config.topbar.actions.map((action, idx) => {
              const Icon = iconMap[action as keyof typeof iconMap] || Settings;
              return (
                <button
                  key={idx}
                  className="w-8 h-8 text-white/90 hover:text-white transition-colors flex items-center justify-center rounded-full hover:bg-white/10"
                  title={action === 'logout' ? config.topbar.logoutLabel : action}
                >
                  <Icon size={18} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Card */}
      {config.card.enabled && (
        <div className="absolute bottom-6 left-6 right-6">
          <div 
            className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 flex items-center gap-6 shadow-xl"
            style={{ 
              backdropFilter: `blur(${config.card.glass.blur}px)`,
              backgroundColor: `rgba(255, 255, 255, ${config.card.glass.opacity})`
            }}
          >
            {/* Left Icon */}
            {config.card.leftIcon.enabled && (
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center text-white shadow-lg"
                style={{
                  background: `linear-gradient(${config.card.leftIcon.gradient.angle}deg, ${config.card.leftIcon.gradient.from}, ${config.card.leftIcon.gradient.to})`
                }}
              >
                {(() => {
                  const Icon = iconMap[config.card.leftIcon.icon as keyof typeof iconMap] || User;
                  return <Icon size={24} />;
                })()}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">
                {resolveTemplate(config.card.title, templateContext)}
              </h1>
              <p className="text-gray-600 truncate">
                {resolveTemplate(config.card.subtitle, templateContext)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {config.card.actions.map((action) => {
                const Icon = iconMap[action.icon as keyof typeof iconMap] || Printer;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleAction(action)}
                    className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-gray-700 transition-colors shadow-sm"
                    title={action.label || action.id}
                  >
                    <Icon size={20} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
