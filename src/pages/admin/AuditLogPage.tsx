import { getStore, formatDateTime, AuditLog, User } from '@/lib/bankData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AuditLogPage() {
  const store = getStore();
  const logs: AuditLog[] = store.logs.slice(0, 50);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit Log</h1>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b"><th className="text-left text-xs font-medium text-muted-foreground p-4">Action</th><th className="text-left text-xs font-medium text-muted-foreground p-4">Performed By</th><th className="text-left text-xs font-medium text-muted-foreground p-4">Target</th><th className="text-left text-xs font-medium text-muted-foreground p-4">Time</th></tr></thead>
              <tbody>
                {logs.map((l: AuditLog) => {
                  const actor = store.users.find((u: User) => u.id === l.performedBy);
                  const target = store.users.find((u: User) => u.id === l.targetUser);
                  return (
                    <tr key={l.logId} className="table-row-hover border-b last:border-0">
                      <td className="p-4"><Badge variant="secondary" className="text-xs">{l.action}</Badge></td>
                      <td className="p-4 text-sm">{actor?.name || '—'}</td>
                      <td className="p-4 text-sm text-muted-foreground">{target?.name || '—'}</td>
                      <td className="p-4 text-sm text-muted-foreground">{formatDateTime(l.timestamp)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
