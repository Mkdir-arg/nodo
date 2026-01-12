import React from 'react';
import { Info, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

interface BannerUIProps {
  type?: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

const bannerStyles = {
  info: {
    container: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
    icon: 'text-blue-500',
    text: 'text-blue-800 dark:text-blue-200',
    Icon: Info,
  },
  warning: {
    container: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800',
    icon: 'text-yellow-500',
    text: 'text-yellow-800 dark:text-yellow-200',
    Icon: AlertTriangle,
  },
  error: {
    container: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800',
    icon: 'text-red-500',
    text: 'text-red-800 dark:text-red-200',
    Icon: AlertCircle,
  },
  success: {
    container: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
    icon: 'text-green-500',
    text: 'text-green-800 dark:text-green-200',
    Icon: CheckCircle,
  },
};

export const BannerUI: React.FC<BannerUIProps> = ({
  type = 'info',
  message,
}) => {
  const styles = bannerStyles[type];
  const Icon = styles.Icon;

  return (
    <div className={`p-4 rounded-lg border flex items-start gap-3 my-4 ${styles.container}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${styles.icon}`} />
      <p className={`text-sm leading-relaxed ${styles.text}`}>{message}</p>
    </div>
  );
};
