import { useAuth } from '@/lib/authContext';
import { getStore, formatCurrency, formatDate, Account, Transaction } from '@/lib/bankData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, TrendingDown, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CHART_COLORS = ['hsl(220,70%,50%)', 'hsl(170,60%,45%)', 'hsl(38,92%,50%)', 'hsl(0,72%,51%)'];

export default function UserDashboard() {
  const { currentUser } = useAuth();
  const store = getStore();
  if (!currentUser) return null;

  const accounts: Account[] = store.accounts.filter((a: Account) => a.userId === currentUser.id);
  const transactions: Transaction[] = store.transactions.filter((t: Transaction) => t.userId === currentUser.id).slice(0, 10);
  const totalBalance = accounts.reduce((s: number, a: Account) => s + a.balance, 0);
  const deposits = transactions.filter((t: Transaction) => t.type === 'deposit').reduce((s: number, t: Transaction) => s + t.amount, 0);
  const spending = transactions.filter((t: Transaction) => t.type !== 'deposit').reduce((s: number, t: Transaction) => s + t.amount, 0);

  // Monthly data for chart
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const month = d.toLocaleString('en', { month: 'short' });
    const monthTxns = store.transactions.filter((t: Transaction) => t.userId === currentUser.id && new Date(t.date).getMonth() === d.getMonth());
    return {
      month,
      income: monthTxns.filter((t: Transaction) => t.type === 'deposit').reduce((s: number, t: Transaction) => s + t.amount, 0),
      expense: monthTxns.filter((t: Transaction) => t.type !== 'deposit').reduce((s: number, t: Transaction) => s + t.amount, 0),
    };
  });

  const pieData = accounts.map((a: Account) => ({ name: a.type, value: Math.abs(a.balance) }));

  const statusColor = (status: string) => {
    if (status === 'completed') return 'bg-success/10 text-success';
    if (status === 'pending') return 'bg-warning/10 text-warning';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {currentUser.name.split(' ')[0]}</h1>
        <p className="text-muted-foreground">Here's your financial overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(totalBalance)}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Income</p>
                <p className="text-2xl font-bold text-success mt-1">{formatCurrency(deposits)}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Spending</p>
                <p className="text-2xl font-bold text-destructive mt-1">{formatCurrency(spending)}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accounts</p>
                <p className="text-2xl font-bold text-foreground mt-1">{accounts.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Income vs Expenses</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="income" fill="hsl(170,60%,45%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="hsl(0,72%,51%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Account Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                  {pieData.map((_: unknown, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {pieData.map((d: { name: string }, i: number) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="capitalize text-muted-foreground">{d.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Transactions</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.length === 0 && <p className="text-muted-foreground text-sm">No transactions yet</p>}
            {transactions.map((t: Transaction) => (
              <div key={t.transactionId} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${t.type === 'deposit' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                    {t.type === 'deposit' ? <ArrowDownRight className="h-4 w-4 text-success" /> : <ArrowUpRight className="h-4 w-4 text-destructive" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${t.type === 'deposit' ? 'text-success' : 'text-foreground'}`}>
                    {t.type === 'deposit' ? '+' : '-'}{formatCurrency(t.amount)}
                  </p>
                  <Badge variant="secondary" className={`text-[10px] ${statusColor(t.status)}`}>{t.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
