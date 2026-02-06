export const ROLES = {
  ADMIN: 'Administradores',
  EDITOR: 'Editores', 
  VIEWER: 'Visualizadores',
  OPERATOR: 'Operadores',
  ANALYTICS: 'Analitica',
} as const;

export interface User {
  id: number;
  username: string;
  email: string;
  groups: string[];
  is_superuser?: boolean;
}

export function hasRole(user: User | null, role: string): boolean {
  if (!user) return false;
  if (user.is_superuser) return true;
  return user.groups.includes(role);
}

export function isAdmin(user: User | null): boolean {
  return hasRole(user, ROLES.ADMIN);
}

export function canManageUsers(user: User | null): boolean {
  return isAdmin(user);
}

export function canEditTemplates(user: User | null): boolean {
  return hasRole(user, ROLES.ADMIN) || hasRole(user, ROLES.EDITOR);
}

export function canCreateLegajos(user: User | null): boolean {
  return hasRole(user, ROLES.ADMIN) || hasRole(user, ROLES.EDITOR) || hasRole(user, ROLES.OPERATOR);
}

export function canViewLegajos(user: User | null): boolean {
  return user !== null; // Todos los usuarios autenticados pueden ver
}

export function canUseAnalytics(user: User | null): boolean {
  return hasRole(user, ROLES.ANALYTICS);
}
