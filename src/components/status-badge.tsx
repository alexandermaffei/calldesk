import { Badge } from '@/components/ui/badge';
import type { LeadStatus } from '@/lib/definitions';
import { cn } from '@/lib/utils';

type StatusBadgeProps = {
  status: LeadStatus;
  className?: string;
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusStyles: Record<LeadStatus, string> = {
    Nuovo: 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30',
    Contattato: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30',
    'In Lavorazione': 'bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30',
    Chiuso: 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30',
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
