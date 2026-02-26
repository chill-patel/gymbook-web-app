import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CardActionArea,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Add as AddIcon,
  CheckCircle as ActiveIcon,
  Business as BranchIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { getAllBranchesAPI, exchangeTokenAPI, addBranchAPI } from '@/api/branch';
import type { GymBranch } from '@/api/branch';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router';
import { saveToken } from '@/api/client';
import { Colors, Layout } from '@/theme';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import StripedCard from '@/components/StripedCard';
import StatusChip from '@/components/StatusChip';

export default function BranchSelectPage() {
  const navigate = useNavigate();
  const { gym, refreshGym } = useAuth();
  const [branches, setBranches] = useState<GymBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const currentBranchId = gym?._id;

  const fetchBranches = useCallback(async () => {
    try {
      const res = await getAllBranchesAPI();
      const data = (res as any)?.data;
      setBranches(Array.isArray(data) ? data : []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleSwitch = async (branch: GymBranch) => {
    if (branch._id === currentBranchId) return;
    setSwitching(branch._id);
    try {
      const res = (await exchangeTokenAPI(branch._id)) as any;
      const token = res?.authToken ?? res?.data?.authToken;
      if (token) {
        saveToken(token);
        await refreshGym();
        setToast({ message: `Switched to ${branch.subName}`, severity: 'success' });
      }
    } catch {
      setToast({ message: 'Failed to switch branch', severity: 'error' });
    } finally {
      setSwitching(null);
    }
  };

  const handleAddBranch = async () => {
    if (!newBranchName.trim()) return;
    setAdding(true);
    try {
      const res = (await addBranchAPI(newBranchName.trim())) as any;
      const token = res?.authToken ?? res?.data?.authToken;
      if (token) {
        saveToken(token);
        await refreshGym();
      }
      setDialogOpen(false);
      setNewBranchName('');
      await fetchBranches();
      setToast({ message: `Branch "${newBranchName.trim()}" added`, severity: 'success' });
    } catch {
      setToast({ message: 'Failed to add branch', severity: 'error' });
    } finally {
      setAdding(false);
    }
  };

  const isExpired = (dateStr?: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  const handleDeleteBranch = (branch: GymBranch) => {
    if (branch._id === currentBranchId) {
      setToast({ message: 'Switch to another branch before deleting this one', severity: 'error' });
      return;
    }
    navigate(`/delete-account?branchId=${branch._id}&branchName=${encodeURIComponent(branch.subName)}`);
  };

  return (
    <Box sx={{ maxWidth: Layout.pageMaxWidth, mx: 'auto' }}>
      <PageHeader
        title="Gym Branches"
        subtitle="Select a branch to manage"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Add Branch
          </Button>
        }
      />

      {/* Branch list */}
      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6 }}>
              <Skeleton variant="rounded" height={100} />
            </Grid>
          ))}
        </Grid>
      ) : branches.length === 0 ? (
        <EmptyState title="No branches found" />
      ) : (
        <Grid container spacing={2}>
          {branches.map((branch) => {
            const isCurrent = branch._id === currentBranchId;
            const expired = isExpired(branch.subscriptionExpiryDate);
            const isSwitching = switching === branch._id;

            return (
              <Grid key={branch._id} size={{ xs: 12, sm: 6 }}>
                <StripedCard
                  stripeColor={isCurrent ? Colors.primary : expired ? Colors.status.expired : '#E0E0E0'}
                  sx={isCurrent ? { border: '2px solid', borderColor: Colors.primary } : undefined}
                >
                  <Box sx={{ display: 'flex', flex: 1 }}>
                    <CardActionArea
                      onClick={() => handleSwitch(branch)}
                      disabled={isCurrent || !!switching}
                      sx={{ flex: 1 }}
                    >
                      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BranchIcon sx={{ color: isCurrent ? Colors.primary : 'text.disabled', fontSize: 20 }} />
                            <Typography variant="body1" fontWeight={600}>
                              {branch.subName}
                            </Typography>
                          </Box>
                          {isCurrent && (
                            <Chip
                              icon={<ActiveIcon sx={{ fontSize: '16px !important' }} />}
                              label="Current"
                              size="small"
                              color="primary"
                              sx={{ fontWeight: 600, fontSize: 11, height: 24 }}
                            />
                          )}
                          {!isCurrent && isSwitching && (
                            <Chip
                              label="Switching..."
                              size="small"
                              sx={{ fontWeight: 600, fontSize: 11, height: 24 }}
                            />
                          )}
                        </Box>
                        {expired && (
                          <StatusChip label="Subscription Expired" color={Colors.status.expired} />
                        )}
                      </CardContent>
                    </CardActionArea>
                    {branches.length > 1 && branch.isAdmin && (
                      <Box sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteBranch(branch)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </StripedCard>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Add Branch Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add New Branch</DialogTitle>
        <DialogContent>
          <TextField
            label="Branch Name"
            fullWidth
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            autoFocus
            sx={{ mt: 1 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newBranchName.trim()) handleAddBranch();
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddBranch}
            disabled={!newBranchName.trim() || adding}
          >
            {adding ? 'Adding...' : 'Add'}
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
