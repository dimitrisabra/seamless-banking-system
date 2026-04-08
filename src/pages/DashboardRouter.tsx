import { useAuth } from '@/lib/authContext';
import UserDashboard from '@/pages/user/UserDashboard';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import ManagerDashboard from '@/pages/manager/ManagerDashboard';
import MaintenanceDashboard from '@/pages/maintenance/MaintenanceDashboard';

export default function DashboardRouter() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  switch (currentUser.role) {
    case 'admin': return <AdminDashboard />;
    case 'manager': return <ManagerDashboard />;
    case 'maintenance': return <MaintenanceDashboard />;
    default: return <UserDashboard />;
  }
}
