import { getStore, saveStore, formatDate, formatCurrency, Transaction, User } from '@/lib/bankData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';

export default function ManagerApprovalsPage() {
  const store = getStore();

  // High-value transactions needing approval (>5000)
  const highValue = store.transactions
    .filter((t: Transaction) => t.amount > 5000 && t.status === 'completed')
    .slice(0, 20);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">High-Value Approvals</h1>
      <p className="text-muted-foreground">Review transactions exceeding $5,000</p>

      <div className="space-y-3">
        {highValue.map((t: Transaction) => {
          const user = store.users.find((u: User) => u.id === t.userId);
          return (
            <Card key={t.transactionId}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{user?.name || 'Unknown'}</span>
                    <Badge variant="secondary" className="capitalize text-xs">{t.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{t.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(t.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-warning">{formatCurrency(t.amount)}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {highValue.length === 0 && <p className="text-center text-muted-foreground py-8">No items requiring approval</p>}
      </div>
    </div>
  );
}
