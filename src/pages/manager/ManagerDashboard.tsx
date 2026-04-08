import { getStore, formatCurrency, User, Account, Transaction, ServiceRequest, MaintenanceTask } from '@/lib/bankData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, TrendingUp, Activity, ClipboardList, Wrench } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(220,70%,50%)', 'hsl(170,60%,45%)', 'hsl(38,92%,50%)', 'hsl(0,72%,51%)'];

export default function ManagerDashboard() {
  const store = getStore();
  const totalUsers = store.users.filter((u: User) => u.role === 'user').length;
  const totalDeposits = store.accounts.reduce((s: number, a: Account) => s + Math.max(0, a.balance), 0);
  const totalLoans = store.requests.filter((r: ServiceRequest) => r.type === 'loan').length;
  const activeAccounts = store.accounts.length;
  const pendingTasks = store.tasks.filter((t: MaintenanceTask) => t.status !== 'completed').length;
  const pendingApprovals = store.requests.filter((r: ServiceRequest) => r.status === 'pending').length;

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    const month = d.toLocaleString('en', { month: 'short' });
    const txns = store.transactions.filter((t: Transaction) => new Date(t.date).getMonth() === d.getMonth());
    return {
      month,
      deposits: txns.filter((t: Transaction) => t.type === 'deposit').reduce((s: number, t: Transaction) => s + t.amount, 0),
      volume: txns.length,
    };
  });

  const requestsByType = [
    { name: 'Card', value: store.requests.filter((r: ServiceRequest) => r.type === 'card').length },
    { name: 'Loan', value: store.requests.filter((r: ServiceRequest) => r.type === 'loan').length },
    { name: 'KYC', value: store.requests.filter((r: ServiceRequest) => r.type === 'kyc').length },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manager Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: totalUsers, icon: Users, color: 'primary' },
          { label: 'Total Deposits', value: formatCurrency(totalDeposits), icon: DollarSign, color: 'success' },
          { label: 'Active Accounts', value: activeAccounts, icon: TrendingUp, color: 'info' },
          { label: 'Loan Requests', value: totalLoans, icon: Activity, color: 'warning' },
          { label: 'Pending Approvals', value: pendingApprovals, icon: ClipboardList, color: 'destructive' },
          { label: 'Active Tasks', value: pendingTasks, icon: Wrench, color: 'accent' },
        ].map(s => (
          <Card key={s.label} className="stat-card">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">{s.label}</p><p className="text-2xl font-bold mt-1">{s.value}</p></div>
                <div className={`h-12 w-12 rounded-xl bg-${s.color}/10 flex items-center justify-center`}><s.icon className={`h-6 w-6 text-${s.color}`} /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Deposit Trends</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Area type="monotone" dataKey="deposits" stroke="hsl(220,70%,50%)" fill="hsl(220,70%,50%)" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Requests by Type</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={requestsByType} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                  {requestsByType.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {requestsByType.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs"><div className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} /><span className="text-muted-foreground">{d.name}</span></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
