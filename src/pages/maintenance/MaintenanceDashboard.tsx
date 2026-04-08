import { Check, CheckCircle, AlertTriangle, ClipboardList, Clock, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/authContext';
import { useStore } from '@/hooks/useStore';
import { MaintenanceTask, updateTaskStatus } from '@/lib/bankData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function MaintenanceDashboard() {
  const { currentUser } = useAuth();
  const store = useStore();
  if (!currentUser) return null;

  const myTasks: MaintenanceTask[] = store.tasks.filter(task => task.assignedTo === currentUser.id);
  const allTasks: MaintenanceTask[] = store.tasks;
  const pending = allTasks.filter(task => task.status === 'pending').length;
  const inProgress = allTasks.filter(task => task.status === 'in_progress').length;
  const completed = allTasks.filter(task => task.status === 'completed').length;
  const critical = allTasks.filter(task => task.priority === 'critical' && task.status !== 'completed').length;

  const handleStatusChange = (taskId: string, newStatus: 'in_progress' | 'completed') => {
    const result = updateTaskStatus(taskId, newStatus, currentUser.id);
    if (!result.success) {
      toast.error(result.error || 'Unable to update task');
      return;
    }

    toast.success(`Task ${newStatus === 'completed' ? 'completed' : 'started'}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Maintenance Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card"><CardContent className="p-0"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold mt-1">{pending}</p></div><div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center"><Clock className="h-6 w-6 text-warning" /></div></div></CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">In Progress</p><p className="text-2xl font-bold mt-1">{inProgress}</p></div><div className="h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center"><ClipboardList className="h-6 w-6 text-info" /></div></div></CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Completed</p><p className="text-2xl font-bold mt-1">{completed}</p></div><div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center"><CheckCircle className="h-6 w-6 text-success" /></div></div></CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Critical</p><p className="text-2xl font-bold mt-1">{critical}</p></div><div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center"><AlertTriangle className="h-6 w-6 text-destructive" /></div></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">My Assigned Tasks</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myTasks.length === 0 && <p className="text-muted-foreground text-sm">No tasks assigned to you</p>}
            {myTasks.map(task => (
              <div key={task.taskId} className="flex flex-col gap-3 py-3 border-b border-border/50 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">{task.description}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs capitalize">{task.type}</Badge>
                    <Badge variant="outline" className={`text-xs ${task.priority === 'critical' ? 'bg-destructive/10 text-destructive' : task.priority === 'high' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>{task.priority}</Badge>
                    <Badge variant="outline" className="capitalize text-xs">{task.status.replace('_', ' ')}</Badge>
                  </div>
                </div>
                {task.status !== 'completed' && (
                  <div className="flex gap-2 shrink-0">
                    {task.status === 'pending' && (
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange(task.taskId, 'in_progress')}>
                        <Play className="h-3.5 w-3.5 mr-1" />Start
                      </Button>
                    )}
                    <Button size="sm" onClick={() => handleStatusChange(task.taskId, 'completed')} className="bg-success hover:bg-success/90">
                      <Check className="h-3.5 w-3.5 mr-1" />Complete
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
