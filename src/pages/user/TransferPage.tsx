import { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/authContext';
import { useStore } from '@/hooks/useStore';
import { Account, createTransfer, formatCurrency } from '@/lib/bankData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TransferPage() {
  const { currentUser } = useAuth();
  const store = useStore();
  const [fromAcc, setFromAcc] = useState('');
  const [toAcc, setToAcc] = useState('');
  const [amount, setAmount] = useState('');

  if (!currentUser) return null;

  const accounts: Account[] = store.accounts.filter(account => account.userId === currentUser.id);

  const handleTransfer = () => {
    const parsedAmount = parseFloat(amount);
    const result = createTransfer(fromAcc, toAcc, parsedAmount, currentUser.id);

    if (!result.success) {
      toast.error(result.error || 'Unable to complete transfer');
      return;
    }

    toast.success(`Transferred ${formatCurrency(parsedAmount)} successfully`);
    setAmount('');
    setFromAcc('');
    setToAcc('');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Fund Transfer</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Accounts</h2>
          {accounts.map(account => (
            <Card key={account.accountId}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium capitalize">{account.type} Account</p>
                  <p className="text-xs text-muted-foreground">****{account.accountId.slice(-4)}</p>
                </div>
                <p className={`text-lg font-bold ${account.balance < 0 ? 'text-destructive' : 'text-foreground'}`}>{formatCurrency(account.balance)}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ArrowLeftRight className="h-5 w-5 text-primary" />New Transfer</CardTitle>
            <CardDescription>Move funds between your own accounts only.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>From Account</Label>
              <Select value={fromAcc} onValueChange={setFromAcc}>
                <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.accountId} value={account.accountId}>
                      {account.type} (****{account.accountId.slice(-4)}) - {formatCurrency(account.balance)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>To Account</Label>
              <Select value={toAcc} onValueChange={setToAcc}>
                <SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.accountId} value={account.accountId}>
                      {account.type} (****{account.accountId.slice(-4)}) - {formatCurrency(account.balance)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={event => setAmount(event.target.value)} />
            </div>
            <Button onClick={handleTransfer} className="w-full">Transfer Funds</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
