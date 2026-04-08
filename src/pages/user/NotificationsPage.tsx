import { useAuth } from '@/lib/authContext';
import { getStore, formatDateTime, Notification as BankNotification } from '@/lib/bankData';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

const iconMap = {
  info: <Info className="h-5 w-5 text-info" />,
  success: <CheckCircle className="h-5 w-5 text-success" />,
  warning: <AlertTriangle className="h-5 w-5 text-warning" />,
  error: <XCircle className="h-5 w-5 text-destructive" />,
};

export default function NotificationsPage() {
  const { currentUser } = useAuth();
  const store = getStore();
  if (!currentUser) return null;

  const notifs: BankNotification[] = store.notifications
    .filter((n: BankNotification) => n.userId === currentUser.id)
    .sort((a: BankNotification, b: BankNotification) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>
      <div className="space-y-3">
        {notifs.map((n: BankNotification) => (
          <Card key={n.id} className={n.read ? 'opacity-60' : ''}>
            <CardContent className="p-4 flex items-start gap-3">
              {iconMap[n.type]}
              <div className="flex-1">
                <p className="text-sm font-medium">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDateTime(n.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        {notifs.length === 0 && <p className="text-muted-foreground text-center py-8">No notifications</p>}
      </div>
    </div>
  );
}
