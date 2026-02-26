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
