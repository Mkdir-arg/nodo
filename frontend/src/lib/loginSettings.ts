import { getJSON } from '@/lib/api';

export interface LoginSettings {
  loginImage: string;
  loginTitle: string;
  loginSubtitle: string;
  loginFooterTitle: string;
  loginFooterSubtitle: string;
}

let cachedSettings: LoginSettings | null = null;

export async function getLoginSettings(): Promise<LoginSettings> {
  if (cachedSettings) {
    return cachedSettings;
  }

  const defaultSettings = {
    loginImage: '/png/people-connecting.png',
    loginTitle: 'Bienvenido a Nodo,',
    loginSubtitle: 'tu Sistema Social',
    loginFooterTitle: 'Nodo',
    loginFooterSubtitle: 'Powered by ICore'
  };

  try {
    const settings = await getJSON<any>('/system/settings/');
    cachedSettings = {
      loginImage: settings.loginImage || defaultSettings.loginImage,
      loginTitle: settings.loginTitle || defaultSettings.loginTitle,
      loginSubtitle: settings.loginSubtitle || defaultSettings.loginSubtitle,
      loginFooterTitle: settings.loginFooterTitle || defaultSettings.loginFooterTitle,
      loginFooterSubtitle: settings.loginFooterSubtitle || defaultSettings.loginFooterSubtitle
    };
    return cachedSettings;
  } catch (error) {
    // No logear el error para evitar spam en consola durante login
    cachedSettings = defaultSettings;
    return cachedSettings;
  }
}

export function clearLoginSettingsCache() {
  cachedSettings = null;
}