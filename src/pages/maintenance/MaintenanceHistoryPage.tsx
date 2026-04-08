import { useStore } from '@/hooks/useStore';
import { formatDate, formatDateTime, MaintenanceTask, User } from '@/lib/bankData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MaintenanceHistoryPage() {
  const store = useStore();
  const completed: MaintenanceTask[] = store.tasks
    .filter(task => task.status === 'completed')
    .sort((a, b) => new Date(b.resolvedAt || b.createdAt).getTime() - new Date(a.resolvedAt || a.createdAt).getTime());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Maintenance History</h1>
      <div className="space-y-3">
        {completed.map(task => {
          const assignee = store.users.find((user: User) => user.id === task.assignedTo);
          return (
            <Card key={task.taskId}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{task.description}</p>
                  <Badge variant="outline" className="bg-success/10 text-success text-xs">Completed</Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>Type: {task.type}</span>
                  <span>Assigned: {assignee?.name || 'Unassigned'}</span>
                  <span>Created: {formatDate(task.createdAt)}</span>
                  {task.resolvedAt && <span>Resolved: {formatDateTime(task.resolvedAt)}</span>}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {completed.length === 0 && <p className="text-center text-muted-foreground py-8">No completed tasks</p>}
      </div>
    </div>
  );
}
