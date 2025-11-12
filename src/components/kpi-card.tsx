import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type KpiCardProps = {
  title: string;
  value: number | string;
  icon: React.ReactNode;
};

export default function KpiCard({ title, value, icon }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
