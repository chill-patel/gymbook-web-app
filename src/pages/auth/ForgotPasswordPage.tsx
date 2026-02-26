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
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { forgetPasswordAPI } from '@/api/auth';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
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
    <Box sx={{ maxWidth: 500, mx: 'auto' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ textTransform: 'none' }}>
          Back
        </Button>
        <Typography variant="h5" fontWeight={700}>
          Forgot Password
        </Typography>
      </Box>

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
