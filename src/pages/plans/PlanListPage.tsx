import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
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
  CalendarMonth as MonthIcon,
  DateRange as DaysIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router';
import type { Package, PackageCreateRequest, ApiResponse } from '@/api/types';
import { Colors } from '@/theme';
import PlanFormDialog from './PlanFormDialog';

interface PlanListPageProps {
  title: string;
  breadcrumb: string;
  fetchAPI: () => Promise<ApiResponse<Package[]>>;
  addAPI: (body: PackageCreateRequest) => Promise<unknown>;
  editAPI: (id: string, body: PackageCreateRequest) => Promise<unknown>;
  deleteAPI: (id: string) => Promise<unknown>;
  /** Use planId instead of _id for edit/delete URL keys */
  usePlanId?: boolean;
}

export default function PlanListPage({
  title,
  breadcrumb,
  fetchAPI,
  addAPI,
  editAPI,
  deleteAPI,
  usePlanId,
}: PlanListPageProps) {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Package | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Package | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const fetchPackages = useCallback(async () => {
    try {
      const res = await fetchAPI();
      setPackages(res.data ?? []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [fetchAPI]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const getId = (pkg: Package) => (usePlanId ? pkg.planId ?? pkg._id : pkg._id);

  const handleAdd = () => {
    setEditingPlan(null);
    setFormOpen(true);
  };

  const handleEdit = (pkg: Package) => {
    setEditingPlan(pkg);
    setFormOpen(true);
  };

  const handleSave = async (data: { name: string; price: string; month?: number | null; days?: number | null }) => {
    try {
      const body: PackageCreateRequest = {
        name: data.name,
        price: data.price,
        month: data.month,
        days: data.days,
      };
      if (editingPlan) {
        await editAPI(getId(editingPlan), body);
        setToast({ message: `${title} updated`, severity: 'success' });
      } else {
        await addAPI(body);
        setToast({ message: `${title} added`, severity: 'success' });
      }
      setFormOpen(false);
      await fetchPackages();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setToast({ message: apiErr.message ?? `Failed to save ${title.toLowerCase()}`, severity: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAPI(getId(deleteTarget));
      setToast({ message: `${title} deleted`, severity: 'success' });
      setDeleteTarget(null);
      await fetchPackages();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setToast({ message: apiErr.message ?? `Failed to delete ${title.toLowerCase()}`, severity: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const formatDuration = (pkg: Package) => {
    if (pkg.days != null && pkg.days > 0) {
      return `${pkg.days} Day${pkg.days !== 1 ? 's' : ''}`;
    }
    if (pkg.month != null && pkg.month > 0) {
      return `${pkg.month} Month${pkg.month !== 1 ? 's' : ''}`;
    }
    return '—';
  };

  const getDurationIcon = (pkg: Package) => {
    if (pkg.days != null && pkg.days > 0) return <DaysIcon fontSize="small" />;
    return <MonthIcon fontSize="small" />;
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 1.5 }}>
        <Link
          underline="hover"
          color="inherit"
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/gym')}
        >
          Gym
        </Link>
        <Typography color="text.primary">{breadcrumb}</Typography>
      </Breadcrumbs>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          {breadcrumb}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Add {title}
        </Button>
      </Box>

      {loading ? (
        <Typography color="text.secondary">Loading...</Typography>
      ) : packages.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary" mb={2}>
              No {title.toLowerCase()}s found. Create your first to get started.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
              Add {title}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {packages.map((pkg) => (
            <Grid key={pkg._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body1" fontWeight={600} noWrap>
                        {pkg.name}
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color={Colors.primary} mt={0.5}>
                        ₹{Number(pkg.price).toLocaleString()}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, color: 'text.secondary' }}>
                        {getDurationIcon(pkg)}
                        <Typography variant="body2" color="text.secondary">
                          {formatDuration(pkg)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                      <IconButton size="small" onClick={() => handleEdit(pkg)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(pkg)}>
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

      {/* Add/Edit dialog */}
      <PlanFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        plan={editingPlan}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete {title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
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
