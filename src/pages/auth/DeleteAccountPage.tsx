import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { deleteAccountAPI, deleteGymBranchAPI } from '@/api/auth';

export default function DeleteAccountPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { gym, logout } = useAuth();

  const branchId = searchParams.get('branchId');
  const branchName = searchParams.get('branchName');
  const isBranchDelete = !!branchId;

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const handleSubmit = async () => {
    if (!password.trim()) {
      setToast({ message: 'Password is required', severity: 'error' });
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmOpen(false);
    setLoading(true);
    try {
      if (isBranchDelete) {
        await deleteGymBranchAPI(password, branchId);
        setToast({ message: `Branch "${branchName}" deleted`, severity: 'success' });
        setTimeout(() => navigate('/branches'), 1000);
      } else {
        await deleteAccountAPI(password);
        logout();
        navigate('/login');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.data?.message ?? 'Invalid password. Please try again.';
      setToast({ message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const title = isBranchDelete ? 'Delete Branch' : 'Delete Account';
  const description = isBranchDelete
    ? `Please enter your password to confirm deletion of branch "${branchName}".`
    : 'Please enter your password to confirm account deletion. This action cannot be undone.';
  const confirmTitle = isBranchDelete ? 'Confirm Branch Deletion' : 'Confirm Account Deletion';
  const confirmMessage = isBranchDelete
    ? `Are you sure you want to permanently delete the branch "${branchName}"? All branch data will be lost.`
    : 'Are you sure you want to permanently delete your account? All data will be lost and this cannot be undone.';

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ textTransform: 'none' }}>
          Back
        </Button>
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="body1" color="text.secondary" mb={3}>
            {description}
          </Typography>

          <Box sx={{ bgcolor: 'grey.100', borderRadius: 2, p: 2, mb: 3 }}>
            <Typography variant="body2" fontWeight={600}>
              {gym?.admin?.email ?? gym?.email}
            </Typography>
          </Box>

          <TextField
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            type="password"
            autoComplete="current-password"
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate(-1)}
              sx={{ fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={handleSubmit}
              disabled={loading}
              sx={{ fontWeight: 600 }}
            >
              {loading ? 'Deleting...' : title}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>{confirmTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>

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
