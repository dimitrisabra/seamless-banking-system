import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { getStore, formatCurrency, formatDate, Transaction } from '@/lib/bankData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';

export default function TransactionsPage() {
  const { currentUser } = useAuth();
  const store = getStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  if (!currentUser) return null;

  let txns: Transaction[] = store.transactions.filter((t: Transaction) => t.userId === currentUser.id);
  if (typeFilter !== 'all') txns = txns.filter((t: Transaction) => t.type === typeFilter);
  if (search) txns = txns.filter((t: Transaction) => t.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transaction History</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="deposit">Deposit</SelectItem>
            <SelectItem value="withdrawal">Withdrawal</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Description</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Type</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Date</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">Amount</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {txns.map((t: Transaction) => (
                  <tr key={t.transactionId} className="table-row-hover border-b last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${t.type === 'deposit' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                          {t.type === 'deposit' ? <ArrowDownRight className="h-4 w-4 text-success" /> : <ArrowUpRight className="h-4 w-4 text-destructive" />}
                        </div>
                        <span className="text-sm font-medium">{t.description}</span>
                      </div>
                    </td>
                    <td className="p-4"><Badge variant="secondary" className="capitalize text-xs">{t.type}</Badge></td>
                    <td className="p-4 text-sm text-muted-foreground">{formatDate(t.date)}</td>
                    <td className={`p-4 text-sm font-semibold text-right ${t.type === 'deposit' ? 'text-success' : 'text-foreground'}`}>
                      {t.type === 'deposit' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                    <td className="p-4 text-right"><Badge variant="outline" className="text-xs capitalize">{t.status}</Badge></td>
                  </tr>
                ))}
                {txns.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No transactions found</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
