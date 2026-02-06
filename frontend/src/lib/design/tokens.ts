// Design System Tokens
export const designTokens = {
  // Colors
  colors: {
    primary: {
      50: '#fff0f7',
      100: '#ffd6ea',
      500: '#FF0080',
      600: '#e10071',
      700: '#c00061',
    },
    secondary: {
      50: '#f4e9ff',
      100: '#e6d4ff',
      500: '#7928CA',
      600: '#6b22b5',
      700: '#5a1e99',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    }
  },

  // Component variants
  card: {
    default: 'bg-white border border-nodo-border rounded-lg shadow-md',
    elevated: 'bg-white border border-nodo-border rounded-lg shadow-md',
    gradient: 'bg-primary-gradient rounded-xl p-1',
  },
  
  button: {
    primary: 'bg-primary-gradient text-white font-medium hover:brightness-110',
    secondary: 'bg-white hover:bg-gray-50 text-nodo-text border-nodo-border',
    success: 'bg-green-600 hover:bg-green-700 text-white border-green-600',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
  },

  status: {
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200', 
    error: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-primary-pink/10 text-primary-pink border-primary-pink/20',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  }
};
