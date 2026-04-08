import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Server, Database, Shield, Wifi } from 'lucide-react';

const systems = [
  { name: 'Core Banking API', status: 'operational', icon: Server, uptime: '99.97%' },
  { name: 'Database Cluster', status: 'operational', icon: Database, uptime: '99.99%' },
  { name: 'Authentication Service', status: 'operational', icon: Shield, uptime: '99.95%' },
  { name: 'Payment Gateway', status: 'degraded', icon: Wifi, uptime: '98.50%' },
];

const alerts = [
  { message: 'High memory usage on DB-02', level: 'warning', time: '2 hours ago' },
  { message: 'SSL certificate renewal in 15 days', level: 'info', time: '1 day ago' },
  { message: 'Backup completed successfully', level: 'success', time: '3 hours ago' },
];

export default function SystemMonitorPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Monitor</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {systems.map(s => (
          <Card key={s.name}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${s.status === 'operational' ? 'bg-success/10' : 'bg-warning/10'}`}>
                  <s.icon className={`h-5 w-5 ${s.status === 'operational' ? 'text-success' : 'text-warning'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">Uptime: {s.uptime}</p>
                </div>
              </div>
              <Badge variant="outline" className={`text-xs capitalize ${s.status === 'operational' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                {s.status === 'operational' ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                {s.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Alerts</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  {a.level === 'warning' ? <AlertTriangle className="h-4 w-4 text-warning" /> : <CheckCircle className="h-4 w-4 text-success" />}
                  <span className="text-sm">{a.message}</span>
                </div>
                <span className="text-xs text-muted-foreground">{a.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
