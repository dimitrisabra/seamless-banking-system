import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/authContext";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/DashboardLayout";
import RoleGuard from "./components/RoleGuard";
import DashboardRouter from "./pages/DashboardRouter";
import TransactionsPage from "./pages/user/TransactionsPage";
import TransferPage from "./pages/user/TransferPage";
import RequestsPage from "./pages/user/RequestsPage";
import NotificationsPage from "./pages/user/NotificationsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminRequestsPage from "./pages/admin/AdminRequestsPage";
import AdminTransactionsPage from "./pages/admin/AdminTransactionsPage";
import AuditLogPage from "./pages/admin/AuditLogPage";
import ManagerAnalyticsPage from "./pages/manager/ManagerAnalyticsPage";
import ManagerApprovalsPage from "./pages/manager/ManagerApprovalsPage";
import ManagerReportsPage from "./pages/manager/ManagerReportsPage";
import ManagerActivityPage from "./pages/manager/ManagerActivityPage";
import MaintenanceTasksPage from "./pages/maintenance/MaintenanceTasksPage";
import SystemMonitorPage from "./pages/maintenance/SystemMonitorPage";
import MaintenanceHistoryPage from "./pages/maintenance/MaintenanceHistoryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={<RoleGuard><DashboardLayout /></RoleGuard>}>
              <Route index element={<DashboardRouter />} />
              <Route path="transactions" element={<RoleGuard allowedRoles={['user']}><TransactionsPage /></RoleGuard>} />
              <Route path="transfer" element={<RoleGuard allowedRoles={['user']}><TransferPage /></RoleGuard>} />
              <Route path="requests" element={<RoleGuard allowedRoles={['user']}><RequestsPage /></RoleGuard>} />
              <Route path="notifications" element={<RoleGuard allowedRoles={['user']}><NotificationsPage /></RoleGuard>} />
              <Route path="admin/users" element={<RoleGuard allowedRoles={['admin']}><AdminUsersPage /></RoleGuard>} />
              <Route path="admin/requests" element={<RoleGuard allowedRoles={['admin']}><AdminRequestsPage /></RoleGuard>} />
              <Route path="admin/transactions" element={<RoleGuard allowedRoles={['admin']}><AdminTransactionsPage /></RoleGuard>} />
              <Route path="admin/audit" element={<RoleGuard allowedRoles={['admin']}><AuditLogPage /></RoleGuard>} />
              <Route path="manager/analytics" element={<RoleGuard allowedRoles={['manager']}><ManagerAnalyticsPage /></RoleGuard>} />
              <Route path="manager/approvals" element={<RoleGuard allowedRoles={['manager']}><ManagerApprovalsPage /></RoleGuard>} />
              <Route path="manager/reports" element={<RoleGuard allowedRoles={['manager']}><ManagerReportsPage /></RoleGuard>} />
              <Route path="manager/activity" element={<RoleGuard allowedRoles={['manager']}><ManagerActivityPage /></RoleGuard>} />
              <Route path="maintenance/tasks" element={<RoleGuard allowedRoles={['maintenance']}><MaintenanceTasksPage /></RoleGuard>} />
              <Route path="maintenance/system" element={<RoleGuard allowedRoles={['maintenance']}><SystemMonitorPage /></RoleGuard>} />
              <Route path="maintenance/history" element={<RoleGuard allowedRoles={['maintenance']}><MaintenanceHistoryPage /></RoleGuard>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
