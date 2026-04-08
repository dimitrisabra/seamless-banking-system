import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/authContext';
import { useStore } from '@/hooks/useStore';
import { RequestType, ServiceRequest, Status, formatDate, submitRequest } from '@/lib/bankData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function RequestsPage() {
  const { currentUser } = useAuth();
  const store = useStore();
  const [showForm, setShowForm] = useState(false);
  const [reqType, setReqType] = useState<RequestType>('card');
  const [details, setDetails] = useState('');

  if (!currentUser) return null;

  const requests: ServiceRequest[] = store.requests.filter(request => request.userId === currentUser.id);

  const statusColor = (status: Status) => {
    if (status === 'approved' || status === 'completed') return 'bg-success/10 text-success border-success/20';
    if (status === 'pending' || status === 'in_progress') return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-destructive/10 text-destructive border-destructive/20';
  };

  const handleSubmit = () => {
    const result = submitRequest(currentUser.id, reqType, details);
    if (!result.success) {
      toast.error(result.error || 'Unable to submit request');
      return;
    }

    toast.success('Request submitted successfully');
    setShowForm(false);
    setDetails('');
    setReqType('card');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Service Requests</h1>
        <Button onClick={() => setShowForm(current => !current)}><Plus className="h-4 w-4 mr-1" />New Request</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">New Service Request</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Request Type</Label>
              <Select value={reqType} onValueChange={value => setReqType(value as RequestType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">New Card</SelectItem>
                  <SelectItem value="loan">Loan Application</SelectItem>
                  <SelectItem value="kyc">KYC Update</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Details</Label>
              <Textarea
                value={details}
                onChange={event => setDetails(event.target.value)}
                placeholder="Describe your request in enough detail for the operations team to review it."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit}>Submit</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {requests.map(request => (
          <Card key={request.requestId}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="capitalize text-xs">{request.type}</Badge>
                  <Badge variant="outline" className={`text-xs ${statusColor(request.status)}`}>{request.status.replace('_', ' ')}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{request.details}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDate(request.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        {requests.length === 0 && <p className="text-muted-foreground text-center py-8">No requests yet</p>}
      </div>
    </div>
  );
}
