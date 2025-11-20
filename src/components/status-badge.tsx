import { Badge } from '@/components/ui/badge';
import type { LeadStatus } from '@/lib/definitions';
import { cn } from '@/lib/utils';

type StatusBadgeProps = {
  status: LeadStatus;
  className?: string;
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusStyles: Record<LeadStatus, string> = {
    'Da gestire': 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30',
    'Gestita': 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'whitespace-nowrap',
        statusStyles[status],
        className
      )}
    >
      {status}
    </Badge>
  );
}
