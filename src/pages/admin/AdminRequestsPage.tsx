import { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/authContext';
import { useStore } from '@/hooks/useStore';
import { ServiceRequest, User, approveRequest, formatDate, rejectRequest } from '@/lib/bankData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminRequestsPage() {
  const { currentUser } = useAuth();
  const store = useStore();
  const [optimisticStatuses, setOptimisticStatuses] = useState<Record<string, ServiceRequest['status']>>({});

  const requests: ServiceRequest[] = useMemo(
    () =>
      [...store.requests]
        .map(request => ({
          ...request,
          status: optimisticStatuses[request.requestId] ?? request.status,
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [optimisticStatuses, store.requests],
  );

  const handleAction = (requestId: string, action: 'approved' | 'rejected') => {
    if (!currentUser) return;

    setOptimisticStatuses(current => ({ ...current, [requestId]: action }));

    const result = action === 'approved'
      ? approveRequest(requestId, currentUser.id)
      : rejectRequest(requestId, currentUser.id, 'Declined by admin review.');

    if (!result.success) {
      setOptimisticStatuses(current => {
        const next = { ...current };
        delete next[requestId];
        return next;
      });
      toast.error(result.error || 'Unable to process request');
      return;
    }

    toast.success(`Request ${action}`);
  };

  const statusColor = (status: string) => {
    if (status === 'approved' || status === 'completed') return 'bg-success/10 text-success';
    if (status === 'pending') return 'bg-warning/10 text-warning';
    return 'bg-destructive/10 text-destructive';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Service Requests</h1>
      <div className="space-y-3">
        {requests.map(request => {
          const user = store.users.find((currentUserRecord: User) => currentUserRecord.id === request.userId);
          return (
            <Card key={request.requestId}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{user?.name || 'Unknown'}</span>
                    <Badge variant="secondary" className="capitalize text-xs">{request.type}</Badge>
                    <Badge variant="outline" className={`text-xs ${statusColor(request.status)}`}>{request.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{request.details}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(request.createdAt)}</p>
                </div>
                {request.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" onClick={() => handleAction(request.requestId, 'approved')} className="bg-success hover:bg-success/90">
                      <Check className="h-4 w-4 mr-1" />Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleAction(request.requestId, 'rejected')}>
                      <X className="h-4 w-4 mr-1" />Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
