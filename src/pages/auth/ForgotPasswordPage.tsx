import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { forgetPasswordAPI } from '@/api/auth';
import PageHeader from '@/components/PageHeader';
import { Layout } from '@/theme';

export default function ForgotPasswordPage() {
  const { gym } = useAuth();
  const [email, setEmail] = useState(gym?.admin?.email ?? gym?.email ?? '');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setToast({ message: 'Please enter your email', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      await forgetPasswordAPI({ email });
      setToast({ message: 'Password reset link sent to your email', severity: 'success' });
    } catch {
      setToast({ message: 'Failed to send reset link', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: Layout.pageMaxWidthNarrow, mx: 'auto' }}>
      <PageHeader title="Forgot Password" backPath={true} />

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Enter your registered email address and we will send you a link to reset your password.
          </Typography>

          <TextField
            label="Registered Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            type="email"
            sx={{ mb: 3 }}
          />

          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={loading}
            sx={{ fontWeight: 600 }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </CardContent>
      </Card>

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)} variant="filled">
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
