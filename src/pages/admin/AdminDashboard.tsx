import { getStore, formatCurrency, formatDate, User, Account, Transaction, ServiceRequest } from '@/lib/bankData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, CreditCard, AlertTriangle, ClipboardList } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminDashboard() {
  const store = getStore();
  const users = store.users.filter((u: User) => u.role === 'user');
  const totalDeposits = store.accounts.reduce((s: number, a: Account) => s + (a.balance > 0 ? a.balance : 0), 0);
  const pendingRequests = store.requests.filter((r: ServiceRequest) => r.status === 'pending').length;
  const recentTxns = store.transactions.slice(0, 5);

  // Suspicious: large transactions
  const suspicious = store.transactions.filter((t: Transaction) => t.amount > 8000).slice(0, 5);

  const monthlyTx = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    const count = store.transactions.filter((t: Transaction) => new Date(t.date).getMonth() === d.getMonth()).length;
    return { month: d.toLocaleString('en', { month: 'short' }), count };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card"><CardContent className="p-0"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Users</p><p className="text-2xl font-bold mt-1">{users.length}</p></div><div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"><Users className="h-6 w-6 text-primary" /></div></div></CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Deposits</p><p className="text-2xl font-bold mt-1">{formatCurrency(totalDeposits)}</p></div><div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center"><DollarSign className="h-6 w-6 text-success" /></div></div></CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Accounts</p><p className="text-2xl font-bold mt-1">{store.accounts.length}</p></div><div className="h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center"><CreditCard className="h-6 w-6 text-info" /></div></div></CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Pending Requests</p><p className="text-2xl font-bold mt-1">{pendingRequests}</p></div><div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center"><ClipboardList className="h-6 w-6 text-warning" /></div></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Transaction Volume</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyTx}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(220,70%,50%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" />Flagged Transactions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suspicious.map((t: Transaction) => {
                const user = store.users.find((u: User) => u.id === t.userId);
                return (
                  <div key={t.transactionId} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{user?.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{t.description} · {formatDate(t.date)}</p>
                    </div>
                    <p className="text-sm font-semibold text-warning">{formatCurrency(t.amount)}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
