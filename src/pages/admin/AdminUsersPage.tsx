import { useState } from 'react';
import { getStore, formatDate, User } from '@/lib/bankData';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

export default function AdminUsersPage() {
  const store = getStore();
  const [search, setSearch] = useState('');

  let users: User[] = store.users.filter((u: User) => u.role === 'user');
  if (search) users = users.filter((u: User) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b"><th className="text-left text-xs font-medium text-muted-foreground p-4">Name</th><th className="text-left text-xs font-medium text-muted-foreground p-4">Email</th><th className="text-left text-xs font-medium text-muted-foreground p-4">Joined</th><th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th></tr></thead>
              <tbody>
                {users.map((u: User) => (
                  <tr key={u.id} className="table-row-hover border-b last:border-0">
                    <td className="p-4"><div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">{u.name.split(' ').map(n => n[0]).join('')}</div><span className="text-sm font-medium">{u.name}</span></div></td>
                    <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                    <td className="p-4 text-sm text-muted-foreground">{formatDate(u.createdAt)}</td>
                    <td className="p-4"><Badge variant="outline" className="bg-success/10 text-success text-xs">Active</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
