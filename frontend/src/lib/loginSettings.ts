import { getJSON } from '@/lib/api';

export interface LoginSettings {
  loginImage: string;
  loginTitle: string;
  loginSubtitle: string;
  loginFooterTitle: string;
  loginFooterSubtitle: string;
}

const DEFAULT_LOGIN_SETTINGS: LoginSettings = {
  loginImage: '/png/people-connecting.png',
  loginTitle: 'Bienvenido a Nodo,',
  loginSubtitle: 'tu Sistema Social',
  loginFooterTitle: 'Nodo',
  loginFooterSubtitle: 'Powered by ICore',
};

export async function getLoginSettings(): Promise<LoginSettings> {
  try {
    const settings = await getJSON<any>('/system/settings/');
    return {
      loginImage: settings?.loginImage || DEFAULT_LOGIN_SETTINGS.loginImage,
      loginTitle: settings?.loginTitle || DEFAULT_LOGIN_SETTINGS.loginTitle,
      loginSubtitle: settings?.loginSubtitle || DEFAULT_LOGIN_SETTINGS.loginSubtitle,
      loginFooterTitle: settings?.loginFooterTitle || DEFAULT_LOGIN_SETTINGS.loginFooterTitle,
      loginFooterSubtitle: settings?.loginFooterSubtitle || DEFAULT_LOGIN_SETTINGS.loginFooterSubtitle,
    };
  } catch {
    // Evitar ruido en consola durante el flujo de login
    return DEFAULT_LOGIN_SETTINGS;
  }
}
