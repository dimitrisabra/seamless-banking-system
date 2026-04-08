import { getStore, formatDateTime, AuditLog, User } from '@/lib/bankData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ManagerActivityPage() {
  const store = getStore();
  const logs: AuditLog[] = store.logs.slice(0, 30);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Activity</h1>
      <div className="space-y-3">
        {logs.map((l: AuditLog) => {
          const actor = store.users.find((u: User) => u.id === l.performedBy);
          const target = store.users.find((u: User) => u.id === l.targetUser);
          return (
            <Card key={l.logId}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {actor?.name?.split(' ').map(n => n[0]).join('') || '?'}
                  </div>
                  <div>
                    <p className="text-sm"><span className="font-medium">{actor?.name || 'System'}</span> · <Badge variant="secondary" className="text-xs">{l.action}</Badge></p>
                    {target && <p className="text-xs text-muted-foreground">Target: {target.name}</p>}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{formatDateTime(l.timestamp)}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
