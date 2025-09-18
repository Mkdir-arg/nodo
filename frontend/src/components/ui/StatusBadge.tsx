import { designTokens } from '@/lib/design/tokens';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      'px-2 py-1 text-xs font-medium rounded-full border',
      designTokens.status[status],
      className
    )}>
      {children}
    </span>
  );
}