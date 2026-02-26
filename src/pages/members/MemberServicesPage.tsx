import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Skeleton,
  Snackbar,
  Typography,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import {
  getMemberServicesAPI,
  addServiceForMemberAPI,
  deleteMemberServiceAPI,
  updateMemberServiceAPI,
} from '@/api/member';
import type { MemberService } from '@/api/types';
import { ServiceCardItem } from './components/MemberCards';
import AddServiceDialog from './dialogs/AddServiceDialog';
import EditServiceDialog from './dialogs/EditServiceDialog';
import DeleteConfirmDialog from './dialogs/DeleteConfirmDialog';

export default function MemberServicesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [services, setServices] = useState<MemberService[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    title: string;
    itemName: string;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editService, setEditService] = useState<MemberService | null>(null);

  const handleToast = useCallback((message: string, severity: 'success' | 'error') => {
    setToast({ message, severity });
  }, []);

  const fetchServices = useCallback(async () => {
    if (!id) return;
    try {
      const res = await getMemberServicesAPI(id);
      setServices(res.data?.services ?? []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleAddService = async (body: Record<string, unknown>) => {
    try {
      await addServiceForMemberAPI(id!, body);
      handleToast('Service added successfully', 'success');
      setAddServiceOpen(false);
      await fetchServices();
    } catch {
      handleToast('Failed to add service', 'error');
    }
  };

  const handleDeleteService = (svc: MemberService) => {
    setDeleteDialog({
      open: true,
      title: 'Delete Service',
      itemName: svc.name,
      onConfirm: async () => {
        await deleteMemberServiceAPI(id!, svc._id);
        await fetchServices();
      },
    });
  };

  const handleEditService = async (body: Record<string, unknown>) => {
    if (!editService) return;
    try {
      await updateMemberServiceAPI(editService._id, body);
      handleToast('Service updated successfully', 'success');
      setEditService(null);
      await fetchServices();
    } catch {
      handleToast('Failed to update service', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog) return;
    setDeleteLoading(true);
    try {
      await deleteDialog.onConfirm();
      handleToast('Deleted successfully', 'success');
      setDeleteDialog(null);
    } catch {
      handleToast('Failed to delete', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate(`/members/${id}`)}>
          Back
        </Button>
        <Typography variant="h5" fontWeight={600} sx={{ flex: 1 }}>
          Services
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddServiceOpen(true)}>
          Add Service
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={120} />
          ))}
        </Box>
      ) : services.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary">No services assigned</Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {services.map((svc) => (
            <ServiceCardItem
              key={svc._id}
              service={svc}
              onEdit={() => setEditService(svc)}
              onDelete={() => handleDeleteService(svc)}
            />
          ))}
        </Box>
      )}

      <AddServiceDialog
        open={addServiceOpen}
        onClose={() => setAddServiceOpen(false)}
        onSave={handleAddService}
        memberId={id!}
      />

      {editService && (
        <EditServiceDialog
          open={!!editService}
          onClose={() => setEditService(null)}
          onSave={handleEditService}
          service={editService}
        />
      )}

      <DeleteConfirmDialog
        open={!!deleteDialog?.open}
        onClose={() => setDeleteDialog(null)}
        onConfirm={handleDeleteConfirm}
        title={deleteDialog?.title ?? 'Confirm Delete'}
        itemName={deleteDialog?.itemName}
        loading={deleteLoading}
      />

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
