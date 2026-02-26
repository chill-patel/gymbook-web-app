import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Skeleton,
  Snackbar,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { getStaffListAPI, deleteStaffAPI } from '@/api/gym';
import { Colors, Layout } from '@/theme';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import StripedCard from '@/components/StripedCard';

const PERMISSION_LABELS: Record<string, string> = {
  ALL: 'All Access',
  ADD: 'Add',
  EDIT: 'Edit',
  DELETE: 'Delete',
  GET: 'View',
  COLLECTION: 'Collection Report',
};

interface StaffMember {
  _id: string;
  userID: string;
  name: string;
  email?: string;
  mobile?: string;
  callingCode?: string;
  countryCode?: string;
  password?: string;
  permission?: string[];
}

export default function StaffListPage() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await getStaffListAPI();
      const data = (res as any)?.data;
      setStaff(Array.isArray(data) ? data : []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteStaffAPI(deleteTarget.userID);
      setToast({ message: 'Staff member deleted', severity: 'success' });
      await fetchStaff();
    } catch {
      setToast({ message: 'Failed to delete staff member', severity: 'error' });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <Box sx={{ maxWidth: Layout.pageMaxWidth, mx: 'auto' }}>
      <PageHeader
        title="Staff Management"
        subtitle="Manage your gym team members and their permissions"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/gym/staff/add')}>
            Add Staff
          </Button>
        }
      />

      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6 }}>
              <Skeleton variant="rounded" height={140} />
            </Grid>
          ))}
        </Grid>
      ) : staff.length === 0 ? (
        <EmptyState
          title="No team members found"
          description="Add staff members to help manage your gym"
          action={
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/gym/staff/add')}>
              Add Staff
            </Button>
          }
        />
      ) : (
        <Grid container spacing={2}>
          {staff.map((member) => {
            const phone = member.mobile
              ? `${member.callingCode ? `+${member.callingCode}` : ''}${member.mobile}`
              : '';

            return (
              <Grid key={member._id} size={{ xs: 12, sm: 6 }}>
                <StripedCard stripeColor={Colors.primary}>
                  <CardContent sx={{ flex: 1, p: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon sx={{ color: Colors.primary, fontSize: 20 }} />
                        <Typography variant="body1" fontWeight={600}>
                          {member.name}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => navigate('/gym/staff/edit', { state: { staff: member } })}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setDeleteTarget(member)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    {member.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <EmailIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                        <Typography variant="body2" color="text.secondary">
                          {member.email}
                        </Typography>
                      </Box>
                    )}

                    {phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <PhoneIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                        <Typography variant="body2" color="text.secondary">
                          {phone}
                        </Typography>
                      </Box>
                    )}

                    {member.permission && member.permission.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
                        {member.permission.map((perm) => (
                          <Chip
                            key={perm}
                            label={PERMISSION_LABELS[perm] ?? perm}
                            size="small"
                            sx={{ fontSize: 11, height: 22, fontWeight: 500 }}
                          />
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </StripedCard>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Team Member</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove {deleteTarget?.name} from your team?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
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
