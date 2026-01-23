'use client';

import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { ChevronDown, LayoutDashboard, FileText, FolderOpen, Search, User, Utensils, Home, MessageSquare, HelpCircle, Settings } from 'lucide-react';
import Image from 'next/image';

import ActiveLink from './ActiveLink';
import { usePlantillasMin } from '@/lib/hooks/usePlantillasMin';
import { useFlowsMin } from '@/lib/hooks/useFlowsMin';
import { useAuth } from '@/lib/AuthContext';
import { canManageUsers, canEditTemplates } from '@/lib/permissions';

interface SideNavProps {
  open: boolean;
  mini: boolean;
  onToggleMini: () => void;
}

export default function SideNav({ open, mini, onToggleMini }: SideNavProps) {
  const { user } = useAuth();
  const [isLegajosExpanded, setIsLegajosExpanded] = useState(true);
  const [isConfigExpanded, setIsConfigExpanded] = useState(false);
  const { data } = usePlantillasMin();
  const { data: flowsData } = useFlowsMin();

  const legajoItems = useMemo(() => {
    const plantillas = (data ?? [])
      .filter((p: any) => p.estado === 'ACTIVO')
      .map((p: any) => ({
        id: String(p.id),
        label: p.nombre,
        href: `/legajos/nuevo?formId=${p.id}`,
      }));
    return [...plantillas];
  }, [data]);

  if (mini) return null;

  return (
    <aside
      className={clsx(
        'bg-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 md:static',
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}
      role="navigation"
      aria-label="Sidebar"
    >
      <nav className="flex h-full flex-col p-5 gap-10 overflow-hidden">
        {/* Logo */}
        <ActiveLink href="/dashboard" className="flex justify-center">
          <Image
            src="/logo.png"
            alt="Nodo"
            width={180}
            height={60}
            className="object-contain"
          />
        </ActiveLink>

        <div className="flex-1 flex flex-col gap-6">
          {/* Tableros */}
          <button className="flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-gray-50">
            <div className="flex items-center gap-1.5">
              <LayoutDashboard className="w-5 h-5 text-[#4A5565]" />
              <span className="text-base font-medium text-[#4A5565]">Tableros</span>
            </div>
            <ChevronDown className="w-4 h-4 text-[#4A5565]" />
          </button>

          {/* Reportes */}
          <button className="flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-gray-50">
            <div className="flex items-center gap-1.5">
              <FileText className="w-5 h-5 text-[#4A5565]" />
              <span className="text-base font-medium text-[#4A5565]">Reportes</span>
            </div>
            <ChevronDown className="w-4 h-4 text-[#4A5565]" />
          </button>

          {/* Legajos */}
          <div className="flex flex-col gap-6">
            <button
              onClick={() => setIsLegajosExpanded(!isLegajosExpanded)}
              className="flex items-center justify-between px-2 py-1.5 bg-[#F9FAFB] rounded-xl shadow-[0px_4px_8px_0px_rgba(0,0,0,0.10)]"
            >
              <div className="flex items-center gap-1.5">
                <FolderOpen className="w-5 h-5 text-[#FF0080]" />
                <span className="text-base font-medium text-[#FF0080]">Legajos</span>
              </div>
              <ChevronDown className={clsx('w-4 h-4 text-[#FF0080] transition-transform', isLegajosExpanded && 'rotate-180')} />
            </button>

            {isLegajosExpanded && (
              <div className="flex flex-col gap-6">
                {/* Buscar */}
                <ActiveLink href="/legajos" className="flex items-center gap-1.5 pl-8 pr-2 py-1.5 rounded-xl hover:bg-gray-50">
                  <Search className="w-5 h-5 text-[#4A5565]" />
                  <span className="text-base font-medium text-[#4A5565]">Buscar</span>
                </ActiveLink>

                {/* Plantillas dinámicas */}
                {legajoItems.map((item) => (
                  <ActiveLink
                    key={item.id}
                    href={item.href}
                    className="flex items-center gap-1.5 pl-8 pr-2 py-1.5 rounded-xl hover:bg-gray-50"
                  >
                    <span className="text-base font-medium text-[#4A5565]">{item.label}</span>
                  </ActiveLink>
                ))}
              </div>
            )}
          </div>

          {/* Configuración */}
          <div className="flex flex-col gap-6">
            <button
              onClick={() => setIsConfigExpanded(!isConfigExpanded)}
              className="flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-gray-50"
            >
              <div className="flex items-center gap-1.5">
                <Settings className="w-5 h-5 text-[#4A5565]" />
                <span className="text-base font-medium text-[#4A5565]">Configuración</span>
              </div>
              <ChevronDown className={clsx('w-4 h-4 text-[#4A5565] transition-transform', isConfigExpanded && 'rotate-180')} />
            </button>

            {isConfigExpanded && (
              <div className="flex flex-col gap-6">
                {/* Flujos */}
                {canEditTemplates(user) && (
                  <ActiveLink href="/flujos" className="flex items-center gap-1.5 pl-8 pr-2 py-1.5 rounded-xl hover:bg-gray-50">
                    <span className="text-base font-medium text-[#4A5565]">Flujos</span>
                  </ActiveLink>
                )}

                {/* Plantillas */}
                {canEditTemplates(user) && (
                  <ActiveLink href="/plantillas" className="flex items-center gap-1.5 pl-8 pr-2 py-1.5 rounded-xl hover:bg-gray-50">
                    <span className="text-base font-medium text-[#4A5565]">Plantillas</span>
                  </ActiveLink>
                )}

                {/* Usuarios */}
                {canManageUsers(user) && (
                  <ActiveLink href="/configuraciones" className="flex items-center gap-1.5 pl-8 pr-2 py-1.5 rounded-xl hover:bg-gray-50">
                    <span className="text-base font-medium text-[#4A5565]">Usuarios</span>
                  </ActiveLink>
                )}
              </div>
            )}
          </div>

          {/* Mensajes */}
          <button className="flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-gray-50">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-5 h-5 text-[#4A5565]" />
              <span className="text-base font-medium text-[#4A5565]">Mensajes</span>
            </div>
            <div className="w-5 h-5 bg-[#FEF2F2] rounded-full border border-[#FECACA] flex items-center justify-center">
              <span className="text-xs font-medium text-[#DC2626]">4</span>
            </div>
          </button>

          {/* Ayuda */}
          <button className="flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-gray-50">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="w-5 h-5 text-[#4A5565]" />
              <span className="text-base font-medium text-[#4A5565]">Ayuda</span>
            </div>
            <ChevronDown className="w-4 h-4 text-[#4A5565]" />
          </button>
        </div>
      </nav>
    </aside>
  );
}
