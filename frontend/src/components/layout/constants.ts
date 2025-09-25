import { Home, Settings, FileText, Workflow, Users } from 'lucide-react';

export const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: Home },
  {
    label: 'Configuraciones',
    icon: Settings,
    submenu: [
      { href: '/configuraciones', label: 'Usuarios', icon: Users },
      { href: '/plantillas', label: 'Plantillas', icon: FileText },
      { href: '/flujos', label: 'Flujos', icon: Workflow },
    ]
  },
];
