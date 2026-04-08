import { useAuth } from '@/lib/authContext';
import { Role } from '@/lib/bankData';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Building2, LayoutDashboard, ArrowLeftRight, FileText, CreditCard, Bell, Settings, LogOut, Users, ShieldCheck, Wrench, BarChart3, ClipboardList, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { BrandLogo } from '@/components/BrandLogo';

const roleConfig: Record<Role, { label: string; color: string; icon: React.ReactNode; nav: { label: string; path: string; icon: React.ReactNode }[] }> = {
  user: {
    label: 'Customer',
    color: 'bg-primary',
    icon: <Users className="h-4 w-4" />,
    nav: [
      { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
      { label: 'Transactions', path: '/dashboard/transactions', icon: <ArrowLeftRight className="h-5 w-5" /> },
      { label: 'Transfer', path: '/dashboard/transfer', icon: <CreditCard className="h-5 w-5" /> },
      { label: 'Requests', path: '/dashboard/requests', icon: <FileText className="h-5 w-5" /> },
      { label: 'Notifications', path: '/dashboard/notifications', icon: <Bell className="h-5 w-5" /> },
    ],
  },
  admin: {
    label: 'Admin',
    color: 'bg-accent',
    icon: <ShieldCheck className="h-4 w-4" />,
    nav: [
      { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
      { label: 'Users', path: '/dashboard/admin/users', icon: <Users className="h-5 w-5" /> },
      { label: 'Requests', path: '/dashboard/admin/requests', icon: <ClipboardList className="h-5 w-5" /> },
      { label: 'Transactions', path: '/dashboard/admin/transactions', icon: <ArrowLeftRight className="h-5 w-5" /> },
      { label: 'Audit Log', path: '/dashboard/admin/audit', icon: <FileText className="h-5 w-5" /> },
    ],
  },
  manager: {
    label: 'Manager',
    color: 'bg-warning',
    icon: <Building2 className="h-4 w-4" />,
    nav: [
      { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
      { label: 'Analytics', path: '/dashboard/manager/analytics', icon: <BarChart3 className="h-5 w-5" /> },
      { label: 'Approvals', path: '/dashboard/manager/approvals', icon: <ClipboardList className="h-5 w-5" /> },
      { label: 'Reports', path: '/dashboard/manager/reports', icon: <FileText className="h-5 w-5" /> },
      { label: 'Activity', path: '/dashboard/manager/activity', icon: <Activity className="h-5 w-5" /> },
    ],
  },
  maintenance: {
    label: 'Support',
    color: 'bg-destructive',
    icon: <Wrench className="h-4 w-4" />,
    nav: [
      { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
      { label: 'Tasks', path: '/dashboard/maintenance/tasks', icon: <ClipboardList className="h-5 w-5" /> },
      { label: 'System', path: '/dashboard/maintenance/system', icon: <Settings className="h-5 w-5" /> },
      { label: 'History', path: '/dashboard/maintenance/history', icon: <FileText className="h-5 w-5" /> },
    ],
  },
};

export default function DashboardLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!currentUser) return <Navigate to="/" replace />;

  const config = roleConfig[currentUser.role];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300 shrink-0",
        collapsed ? "w-[68px]" : "w-64"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border gap-3">
          <BrandLogo
            showWordmark={!collapsed}
            className="min-w-0"
            markClassName="h-10 w-10 shrink-0 border-sidebar-primary/25 bg-gradient-to-br from-sidebar-primary/25 via-sidebar-background to-sidebar-accent/70"
            textClassName="text-sidebar-foreground"
          />
        </div>

        {/* Role badge */}
        {!collapsed && (
          <div className="px-4 py-3">
            <Badge className={cn("text-xs", config.color, "text-primary-foreground")}>{config.icon}<span className="ml-1">{config.label} Panel</span></Badge>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {config.nav.map(item => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn("sidebar-item w-full", active ? "sidebar-item-active" : "sidebar-item-inactive")}
                title={collapsed ? item.label : undefined}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User & logout */}
        <div className="px-3 py-3 border-t border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-3 px-1 mb-3">
              <div className="h-8 w-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sm font-semibold text-sidebar-primary">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{currentUser.name}</p>
                <p className="text-xs text-sidebar-foreground/50 truncate">{currentUser.email}</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="sidebar-item sidebar-item-inactive w-full text-destructive/80 hover:text-destructive" title="Sign out">
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)} className="h-10 flex items-center justify-center border-t border-sidebar-border text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
