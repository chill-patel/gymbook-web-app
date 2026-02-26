import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '@/theme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import LoginPage from '@/pages/auth/LoginPage';
import SignUpPage from '@/pages/auth/SignUpPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import MemberListPage from '@/pages/members/MemberListPage';
import MemberDetailPage from '@/pages/members/MemberDetailPage';
import MemberPlansPage from '@/pages/members/MemberPlansPage';
import MemberPtPlansPage from '@/pages/members/MemberPtPlansPage';
import MemberServicesPage from '@/pages/members/MemberServicesPage';
import AddMemberPage from '@/pages/members/AddMemberPage';
import GymPage from '@/pages/gym/GymPage';
import PlansPage from '@/pages/plans/PlansPage';
import PtPlansPage from '@/pages/plans/PtPlansPage';
import ServicesPage from '@/pages/services/ServicesPage';
import BatchesPage from '@/pages/batches/BatchesPage';
import ReportsPage from '@/pages/ReportsPage';
import SalesReportPage from '@/pages/reports/SalesReportPage';
import PlanReportPage from '@/pages/reports/PlanReportPage';
import PtPlanReportPage from '@/pages/reports/PtPlanReportPage';
import AdmissionReportPage from '@/pages/reports/AdmissionReportPage';
import AttendanceReportPage from '@/pages/reports/AttendanceReportPage';
import DownloadReportPage from '@/pages/reports/DownloadReportPage';
import VisitorListPage from '@/pages/visitors/VisitorListPage';
import AddVisitorPage from '@/pages/visitors/AddVisitorPage';
import EditVisitorPage from '@/pages/visitors/EditVisitorPage';
import ExpenseListPage from '@/pages/expenses/ExpenseListPage';
import AddExpensePage from '@/pages/expenses/AddExpensePage';
import EditExpensePage from '@/pages/expenses/EditExpensePage';
import BranchSelectPage from '@/pages/branches/BranchSelectPage';
import SubscriptionPage from '@/pages/subscription/SubscriptionPage';

function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RedirectIfAuth>
            <LoginPage />
          </RedirectIfAuth>
        }
      />
      <Route
        path="/signup"
        element={
          <RedirectIfAuth>
            <SignUpPage />
          </RedirectIfAuth>
        }
      />
      <Route
        element={
          <AuthGuard>
            <AppShell />
          </AuthGuard>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/members" element={<MemberListPage />} />
        <Route path="/members/add" element={<AddMemberPage />} />
        <Route path="/members/:id" element={<MemberDetailPage />} />
        <Route path="/members/:id/plans" element={<MemberPlansPage />} />
        <Route path="/members/:id/pt-plans" element={<MemberPtPlansPage />} />
        <Route path="/members/:id/services" element={<MemberServicesPage />} />
        <Route path="/gym" element={<GymPage />} />
        <Route path="/gym/plans" element={<PlansPage />} />
        <Route path="/gym/pt-plans" element={<PtPlansPage />} />
        <Route path="/gym/services" element={<ServicesPage />} />
        <Route path="/gym/batches" element={<BatchesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/reports/sales" element={<SalesReportPage />} />
        <Route path="/reports/plan-due" element={<PlanReportPage />} />
        <Route path="/reports/pt-plan-due" element={<PtPlanReportPage />} />
        <Route path="/reports/admission" element={<AdmissionReportPage />} />
        <Route path="/reports/attendance" element={<AttendanceReportPage />} />
        <Route path="/reports/download" element={<DownloadReportPage />} />
        <Route path="/visitors" element={<VisitorListPage />} />
        <Route path="/visitors/add" element={<AddVisitorPage />} />
        <Route path="/visitors/edit" element={<EditVisitorPage />} />
        <Route path="/expenses" element={<ExpenseListPage />} />
        <Route path="/expenses/add" element={<AddExpensePage />} />
        <Route path="/expenses/edit" element={<EditExpensePage />} />
        <Route path="/branches" element={<BranchSelectPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
