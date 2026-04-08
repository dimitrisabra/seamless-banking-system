import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, ShieldCheck, Users, Wrench } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { Role } from '@/lib/bankData';
import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const demoAccounts: { role: Role; email: string; password: string; label: string; icon: React.ReactNode; desc: string }[] = [
  { role: 'user', email: 'user@bank.com', password: 'password', label: 'Customer', icon: <Users className="h-4 w-4" />, desc: 'Retail banking access' },
  { role: 'admin', email: 'admin@bank.com', password: 'password', label: 'Admin', icon: <ShieldCheck className="h-4 w-4" />, desc: 'Operations oversight' },
  { role: 'manager', email: 'manager@bank.com', password: 'password', label: 'Manager', icon: <Building2 className="h-4 w-4" />, desc: 'Executive reporting' },
  { role: 'maintenance', email: 'support@bank.com', password: 'password', label: 'Support', icon: <Wrench className="h-4 w-4" />, desc: 'Support engineering' },
];

export default function LoginPage() {
  const { currentUser, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }

    setIsSubmitting(false);
  };

  const loadDemoCredentials = (demo: typeof demoAccounts[number]) => {
    setEmail(demo.email);
    setPassword(demo.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-primary-foreground/20"
              style={{
                width: `${200 + i * 150}px`,
                height: `${200 + i * 150}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
        <div className="relative z-10 max-w-lg px-12">
          <BrandLogo
            markClassName="h-16 w-16 border-white/20 bg-gradient-to-br from-white/15 via-primary to-white/10"
            textClassName="text-primary-foreground"
            className="mb-8"
          />
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">Operational banking, with tighter controls.</h1>
          <p className="text-primary-foreground/80 text-lg max-w-md">
            Multi-role banking workspace with guarded routes, audited actions, support task workflows, and downloadable management reporting.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="lg:hidden flex justify-center">
            <BrandLogo />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">Sign in</h2>
            <p className="text-muted-foreground mt-1">Secure sessions expire automatically after 30 minutes.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="user@bank.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter your password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'} <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Demo Credentials</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {demoAccounts.map(demo => (
              <Card
                key={demo.role}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => loadDemoCredentials(demo)}
              >
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">{demo.icon}{demo.label}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  <CardDescription className="text-xs">{demo.desc}</CardDescription>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Load credentials</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
