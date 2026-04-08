import { useState } from 'react';
import { getStore, formatCurrency, formatDate, Transaction, User } from '@/lib/bankData';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

export default function AdminTransactionsPage() {
  const store = getStore();
  const [search, setSearch] = useState('');

  let txns: Transaction[] = store.transactions.slice(0, 100);
  if (search) txns = txns.filter((t: Transaction) => t.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All Transactions</h1>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b"><th className="text-left text-xs font-medium text-muted-foreground p-4">User</th><th className="text-left text-xs font-medium text-muted-foreground p-4">Description</th><th className="text-left text-xs font-medium text-muted-foreground p-4">Type</th><th className="text-left text-xs font-medium text-muted-foreground p-4">Date</th><th className="text-right text-xs font-medium text-muted-foreground p-4">Amount</th></tr></thead>
              <tbody>
                {txns.map((t: Transaction) => {
                  const user = store.users.find((u: User) => u.id === t.userId);
                  return (
                    <tr key={t.transactionId} className="table-row-hover border-b last:border-0">
                      <td className="p-4 text-sm">{user?.name || '—'}</td>
                      <td className="p-4 text-sm">{t.description}</td>
                      <td className="p-4"><Badge variant="secondary" className="capitalize text-xs">{t.type}</Badge></td>
                      <td className="p-4 text-sm text-muted-foreground">{formatDate(t.date)}</td>
                      <td className="p-4 text-sm font-semibold text-right">{formatCurrency(t.amount)}</td>
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
