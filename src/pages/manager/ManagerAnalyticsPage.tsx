import { getStore, formatCurrency, Transaction, Account } from '@/lib/bankData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function ManagerAnalyticsPage() {
  const store = getStore();

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (11 - i));
    const month = d.toLocaleString('en', { month: 'short' });
    const txns = store.transactions.filter((t: Transaction) => {
      const td = new Date(t.date);
      return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
    });
    return {
      month,
      deposits: txns.filter((t: Transaction) => t.type === 'deposit').reduce((s: number, t: Transaction) => s + t.amount, 0),
      withdrawals: txns.filter((t: Transaction) => t.type === 'withdrawal').reduce((s: number, t: Transaction) => s + t.amount, 0),
      count: txns.length,
    };
  });

  const accountTypes = ['checking', 'savings', 'credit'].map(type => ({
    type,
    count: store.accounts.filter((a: Account) => a.type === type).length,
    total: store.accounts.filter((a: Account) => a.type === type).reduce((s: number, a: Account) => s + Math.abs(a.balance), 0),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accountTypes.map(a => (
          <Card key={a.type} className="stat-card">
            <CardContent className="p-0">
              <p className="text-sm text-muted-foreground capitalize">{a.type} Accounts</p>
              <p className="text-2xl font-bold mt-1">{a.count}</p>
              <p className="text-sm text-muted-foreground mt-1">Total: {formatCurrency(a.total)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Monthly Flow (12 Months)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="deposits" fill="hsl(170,60%,45%)" radius={[4, 4, 0, 0]} name="Deposits" />
              <Bar dataKey="withdrawals" fill="hsl(0,72%,51%)" radius={[4, 4, 0, 0]} name="Withdrawals" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Transaction Volume</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="hsl(220,70%,50%)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
