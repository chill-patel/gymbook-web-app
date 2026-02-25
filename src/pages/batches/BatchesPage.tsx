import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Link,
  Snackbar,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as TimeIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { getAllBatchesAPI, addBatchAPI, editBatchAPI, deleteBatchAPI } from '@/api/gym';
import type { Batch } from '@/api/types';
import { Colors } from '@/theme';
import BatchFormDialog from './BatchFormDialog';

export default function BatchesPage() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Batch | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Batch | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const fetchBatches = useCallback(async () => {
    try {
      const res = await getAllBatchesAPI();
      setBatches(res.data ?? []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const handleSave = async (data: { name: string; batchLimit: number; startTime: string; endTime: string }) => {
    try {
      if (editing) {
        await editBatchAPI(editing._id, { ...editing, ...data });
        setToast({ message: 'Batch updated', severity: 'success' });
      } else {
        await addBatchAPI(data);
        setToast({ message: 'Batch added', severity: 'success' });
      }
      setFormOpen(false);
      await fetchBatches();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setToast({ message: apiErr.message ?? 'Failed to save batch', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBatchAPI(deleteTarget._id);
      setToast({ message: 'Batch deleted', severity: 'success' });
      setDeleteTarget(null);
      await fetchBatches();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setToast({ message: apiErr.message ?? 'Failed to delete batch', severity: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 1.5 }}>
        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/gym')}>
          Gym
        </Link>
        <Typography color="text.primary">Batches</Typography>
      </Breadcrumbs>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Batches
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setEditing(null); setFormOpen(true); }}
        >
          Add Batch
        </Button>
      </Box>

      {loading ? (
        <Typography color="text.secondary">Loading...</Typography>
      ) : batches.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary" mb={2}>
              No batches found. Create your first batch to get started.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => { setEditing(null); setFormOpen(true); }}
            >
              Add Batch
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {batches.map((batch) => (
            <Grid key={batch._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body1" fontWeight={600} noWrap>
                        {batch.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, color: 'text.secondary' }}>
                        <TimeIcon sx={{ fontSize: 16 }} />
                        <Typography variant="body2">
                          {batch.startTime} — {batch.endTime}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Chip
                          icon={<PeopleIcon sx={{ fontSize: '16px !important' }} />}
                          label={`${batch.currentMember} / ${batch.batchLimit}`}
                          size="small"
                          sx={{ bgcolor: `${Colors.primary}14`, color: Colors.primary, fontWeight: 500 }}
                        />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                      <IconButton size="small" onClick={() => { setEditing(batch); setFormOpen(true); }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(batch)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <BatchFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        batch={editing}
      />

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Batch</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
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
