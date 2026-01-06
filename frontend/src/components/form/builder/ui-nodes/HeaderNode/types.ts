export interface HeaderBackgroundConfig {
  mode: 'image';
  imageUrl: string;
  overlay: {
    enabled: boolean;
    opacity: number;
    blur?: number;
  };
}

export interface HeaderTopbarConfig {
  enabled: boolean;
  position: 'top-right';
  actions: ('theme' | 'notifications' | 'profile' | 'logout')[];
  logoutLabel: string;
}

export interface HeaderActionConfig {
  id: string;
  icon: string;
  type: 'navigate' | 'command';
  to?: string;
  name?: 'print';
  label?: string;
}

export interface HeaderCardConfig {
  enabled: boolean;
  glass: {
    blur: number;
    opacity: number;
  };
  leftIcon: {
    enabled: boolean;
    icon: string;
    gradient: {
      from: string;
      to: string;
      angle: number;
    };
  };
  title: string;
  subtitle: string;
  actions: HeaderActionConfig[];
}

export interface HeaderConfig {
  background: HeaderBackgroundConfig;
  topbar: HeaderTopbarConfig;
  card: HeaderCardConfig;
}

export interface HeaderNode {
  id: string;
  type: 'ui:header';
  kind: 'ui';
  variant: 'basic' | 'hero-glass';
  config: HeaderConfig;
  layout: {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
}