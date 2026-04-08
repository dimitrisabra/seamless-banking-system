import { useMemo, useState } from 'react';
import { Check, ClipboardPlus, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/authContext';
import { useStore } from '@/hooks/useStore';
import { MAINTENANCE_TASK_TYPES, MaintenanceTask, User, createMaintenanceTask, formatDate, updateTaskStatus } from '@/lib/bankData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const priorityOrder: Record<MaintenanceTask['priority'], number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export default function MaintenanceTasksPage() {
  const { currentUser } = useAuth();
  const store = useStore();
  const [showForm, setShowForm] = useState(false);
  const [taskType, setTaskType] = useState<string>(MAINTENANCE_TASK_TYPES[0]);
  const [priority, setPriority] = useState<MaintenanceTask['priority']>('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [description, setDescription] = useState('');

  const supportUsers = useMemo(
    () => store.users.filter((user): user is User => user.role === 'maintenance' && user.active),
    [store.users],
  );

  const tasks = useMemo(
    () => [...store.tasks].sort((a, b) => {
      const priorityDelta = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDelta !== 0) return priorityDelta;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }),
    [store.tasks],
  );

  if (!currentUser) return null;

  const selectedAssignee = assignedTo || currentUser.id;

  const handleStatusChange = (taskId: string, newStatus: 'in_progress' | 'completed') => {
    const result = updateTaskStatus(taskId, newStatus, currentUser.id);
    if (!result.success) {
      toast.error(result.error || 'Unable to update task');
      return;
    }

    toast.success(`Task ${newStatus === 'completed' ? 'completed' : 'started'}`);
  };

  const handleCreateTask = () => {
    const result = createMaintenanceTask({
      assignedTo: selectedAssignee,
      type: taskType,
      description,
      priority,
      createdBy: currentUser.id,
    });

    if (!result.success) {
      toast.error(result.error || 'Unable to create task');
      return;
    }

    toast.success('Task created and assigned');
    setAssignedTo('');
    setDescription('');
    setPriority('medium');
    setTaskType(MAINTENANCE_TASK_TYPES[0]);
    setShowForm(false);
  };

  const priorityColor = (taskPriority: string) => {
    if (taskPriority === 'critical') return 'bg-destructive/10 text-destructive border-destructive/20';
    if (taskPriority === 'high') return 'bg-warning/10 text-warning border-warning/20';
    if (taskPriority === 'medium') return 'bg-info/10 text-info border-info/20';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Tasks</h1>
          <p className="text-sm text-muted-foreground">Create, assign, and work the support queue from one place.</p>
        </div>
        <Button onClick={() => setShowForm(current => !current)}>
          <ClipboardPlus className="h-4 w-4 mr-2" />
          {showForm ? 'Close Task Form' : 'Create Task'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New Support Task</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-type">Task Type</Label>
              <Select value={taskType} onValueChange={setTaskType}>
                <SelectTrigger id="task-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MAINTENANCE_TASK_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority</Label>
              <Select value={priority} onValueChange={value => setPriority(value as MaintenanceTask['priority'])}>
                <SelectTrigger id="task-priority"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['low', 'medium', 'high', 'critical'].map(level => (
                    <SelectItem key={level} value={level} className="capitalize">{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-assignee">Assign To</Label>
              <Select value={selectedAssignee} onValueChange={setAssignedTo}>
                <SelectTrigger id="task-assignee"><SelectValue placeholder="Select engineer" /></SelectTrigger>
                <SelectContent>
                  {supportUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="creator-email">Created By</Label>
              <Input id="creator-email" value={currentUser.email} disabled />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={description}
                onChange={event => setDescription(event.target.value)}
                placeholder="Describe the issue, affected system, and any urgency details."
              />
            </div>

            <div className="md:col-span-2 flex gap-2">
              <Button onClick={handleCreateTask}>Create Task</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {tasks.map(task => {
          const assignee = store.users.find((user: User) => user.id === task.assignedTo);
          const canUpdate = task.status !== 'completed';

          return (
            <Card key={task.taskId}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{task.description}</p>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <Badge variant="outline" className={`text-xs ${priorityColor(task.priority)}`}>{task.priority}</Badge>
                    <Badge variant="secondary" className="text-xs capitalize">{task.status.replace('_', ' ')}</Badge>
                    <Badge variant="outline" className="text-xs">{task.type}</Badge>
                    {assignee && <span className="text-xs text-muted-foreground">Assigned: {assignee.name}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(task.createdAt)}</p>
                </div>
                {canUpdate && (
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
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
