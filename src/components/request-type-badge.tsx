import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import type { RequestType } from '@/lib/definitions';

interface RequestTypeBadgeProps {
  requestType?: RequestType | string;
  className?: string;
}

export default function RequestTypeBadge({ requestType, className }: RequestTypeBadgeProps) {
  if (!requestType) {
    return (
      <Badge variant="outline" className={cn("border-gray-300 text-gray-600 dark:text-gray-400", className)}>
        N/A
      </Badge>
    );
  }

  const typeStyles: Record<string, { bg: string; text: string; border: string }> = {
    SALES: {
      bg: 'bg-blue-500/20 dark:bg-blue-500/30',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-500/50 dark:border-blue-500/60',
    },
    PARTS: {
      bg: 'bg-orange-500/20 dark:bg-orange-500/30',
      text: 'text-orange-700 dark:text-orange-400',
      border: 'border-orange-500/50 dark:border-orange-500/60',
    },
    SERVICE: {
      bg: 'bg-green-500/20 dark:bg-green-500/30',
      text: 'text-green-700 dark:text-green-400',
      border: 'border-green-500/50 dark:border-green-500/60',
    },
    GENERICA: {
      bg: 'bg-purple-500/20 dark:bg-purple-500/30',
      text: 'text-purple-700 dark:text-purple-400',
      border: 'border-purple-500/50 dark:border-purple-500/60',
    },
  };

  const styles = typeStyles[requestType] || {
    bg: 'bg-gray-500/20 dark:bg-gray-500/30',
    text: 'text-gray-700 dark:text-gray-400',
    border: 'border-gray-500/50 dark:border-gray-500/60',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-semibold',
        styles.bg,
        styles.text,
        styles.border,
        className
      )}
    >
      {requestType}
    </Badge>
  );
}

