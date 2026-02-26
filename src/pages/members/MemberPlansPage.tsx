import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Alert,
  Box,
  Button,
  CardContent,
  Card,
  Skeleton,
  Snackbar,
  Typography,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import {
  getMemberPackagesAPI,
  addPackageForMemberAPI,
  deleteMemberPackageAPI,
  addPlanPaymentAPI,
  deletePlanPaymentAPI,
  updateMemberPlanAPI,
  getMemberDetailAPI,
} from '@/api/member';
import type { Member, MemberPackage, MemberInvoice } from '@/api/types';
import { useAuth } from '@/context/AuthContext';
import { openInvoice } from '@/utils/generateInvoice';
import { PlanCard } from './components/MemberCards';
import AddPlanDialog from './dialogs/AddPlanDialog';
import AddPaymentDialog from './dialogs/AddPaymentDialog';
import EditPlanDialog from './dialogs/EditPlanDialog';
import DeleteConfirmDialog from './dialogs/DeleteConfirmDialog';

export default function MemberPlansPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { gym } = useAuth();
  const [member, setMember] = useState<Member | null>(null);
  const [packages, setPackages] = useState<MemberPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const [addPlanOpen, setAddPlanOpen] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState<{
    open: boolean;
    id: string;
    name: string;
  } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    title: string;
    itemName: string;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editPlan, setEditPlan] = useState<MemberPackage | null>(null);

  const handleToast = useCallback((message: string, severity: 'success' | 'error') => {
    setToast({ message, severity });
  }, []);

  const fetchPackages = useCallback(async () => {
    if (!id) return;
    try {
      const res = await getMemberPackagesAPI(id);
      setPackages(res.data?.packages ?? []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPackages();
    if (id) {
      getMemberDetailAPI(id)
        .then((res) => setMember(res.data))
        .catch(() => {});
    }
  }, [fetchPackages, id]);

  const handleAddPlan = async (body: Record<string, unknown>) => {
    try {
      await addPackageForMemberAPI(id!, body);
      handleToast('Plan added successfully', 'success');
      setAddPlanOpen(false);
      await fetchPackages();
    } catch {
      handleToast('Failed to add plan', 'error');
    }
  };

  const handleDeletePlan = (pkg: MemberPackage) => {
    setDeleteDialog({
      open: true,
      title: 'Delete Plan',
      itemName: pkg.name,
      onConfirm: async () => {
        await deleteMemberPackageAPI(id!, pkg._id);
        await fetchPackages();
      },
    });
  };

  const handleAddPayment = async (body: { paidAmount: number; paymentDate: string; paymentMethod: string }) => {
    if (!paymentDialog) return;
    try {
      await addPlanPaymentAPI(id!, paymentDialog.id, body);
      handleToast('Payment added successfully', 'success');
      setPaymentDialog(null);
      await fetchPackages();
    } catch {
      handleToast('Failed to add payment', 'error');
    }
  };

  const handleDeletePayment = (planId: string, paymentId: string) => {
    setDeleteDialog({
      open: true,
      title: 'Delete Payment',
      itemName: 'this payment',
      onConfirm: async () => {
        await deletePlanPaymentAPI(id!, planId, paymentId);
        await fetchPackages();
      },
    });
  };

  const handleEditPlan = async (body: Record<string, unknown>) => {
    if (!editPlan) return;
    try {
      await updateMemberPlanAPI(editPlan._id, body);
      handleToast('Plan updated successfully', 'success');
      setEditPlan(null);
      await fetchPackages();
    } catch {
      handleToast('Failed to update plan', 'error');
    }
  };

  const handleShareInvoice = (pkg: MemberPackage, invoice: MemberInvoice) => {
    if (!gym || !member) return;
    openInvoice({
      invoice,
      memberName: member.name,
      planName: pkg.name,
      planType: 'Membership Plan',
      purchaseDate: pkg.purchaseDate,
      expiryDate: pkg.expiryDate,
      gym,
    });
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
          Membership Plans
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddPlanOpen(true)}>
          Add Plan
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={160} />
          ))}
        </Box>
      ) : packages.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary">No plans assigned</Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {packages.map((pkg) => (
            <PlanCard
              key={pkg._id}
              pkg={pkg}
              onAddPayment={() => setPaymentDialog({ open: true, id: pkg._id, name: pkg.name })}
              onEdit={() => setEditPlan(pkg)}
              onDelete={() => handleDeletePlan(pkg)}
              onDeletePayment={(paymentId) => handleDeletePayment(pkg._id, paymentId)}
              onShareInvoice={(inv) => handleShareInvoice(pkg, inv)}
            />
          ))}
        </Box>
      )}

      <AddPlanDialog
        open={addPlanOpen}
        onClose={() => setAddPlanOpen(false)}
        onSave={handleAddPlan}
        memberId={id!}
      />

      <AddPaymentDialog
        open={!!paymentDialog?.open}
        onClose={() => setPaymentDialog(null)}
        onSave={handleAddPayment}
        planName={paymentDialog?.name}
      />

      {editPlan && (
        <EditPlanDialog
          open={!!editPlan}
          onClose={() => setEditPlan(null)}
          onSave={handleEditPlan}
          plan={editPlan}
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
