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
  getMemberPtPlansAPI,
  addPtPlanForMemberAPI,
  deleteMemberPtPlanAPI,
  addPtPlanPaymentAPI,
  deletePtPlanPaymentAPI,
  updateMemberPtPlanAPI,
  getMemberDetailAPI,
} from '@/api/member';
import type { Member, MemberPtPlan, MemberInvoice } from '@/api/types';
import { useAuth } from '@/context/AuthContext';
import { openInvoice } from '@/utils/generateInvoice';
import { PtPlanCard } from './components/MemberCards';
import AddPtPlanDialog from './dialogs/AddPtPlanDialog';
import AddPaymentDialog from './dialogs/AddPaymentDialog';
import EditPtPlanDialog from './dialogs/EditPtPlanDialog';
import DeleteConfirmDialog from './dialogs/DeleteConfirmDialog';

export default function MemberPtPlansPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { gym } = useAuth();
  const [member, setMember] = useState<Member | null>(null);
  const [ptPlans, setPtPlans] = useState<MemberPtPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const [addPtPlanOpen, setAddPtPlanOpen] = useState(false);
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
  const [editPtPlan, setEditPtPlan] = useState<MemberPtPlan | null>(null);

  const handleToast = useCallback((message: string, severity: 'success' | 'error') => {
    setToast({ message, severity });
  }, []);

  const fetchPtPlans = useCallback(async () => {
    if (!id) return;
    try {
      const res = await getMemberPtPlansAPI(id);
      const list = res.data?.ptPlans ?? res.data?.trainerPlans ?? [];
      setPtPlans(Array.isArray(list) ? list : []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPtPlans();
    if (id) {
      getMemberDetailAPI(id)
        .then((res) => setMember(res.data))
        .catch(() => {});
    }
  }, [fetchPtPlans, id]);

  const handleAddPtPlan = async (body: Record<string, unknown>) => {
    try {
      await addPtPlanForMemberAPI(id!, body);
      handleToast('PT Plan added successfully', 'success');
      setAddPtPlanOpen(false);
      await fetchPtPlans();
    } catch {
      handleToast('Failed to add PT plan', 'error');
    }
  };

  const handleDeletePtPlan = (plan: MemberPtPlan) => {
    setDeleteDialog({
      open: true,
      title: 'Delete PT Plan',
      itemName: plan.name,
      onConfirm: async () => {
        await deleteMemberPtPlanAPI(id!, plan._id);
        await fetchPtPlans();
      },
    });
  };

  const handleAddPayment = async (body: { paidAmount: number; paymentDate: string; paymentMethod: string }) => {
    if (!paymentDialog) return;
    try {
      await addPtPlanPaymentAPI(id!, paymentDialog.id, body);
      handleToast('Payment added successfully', 'success');
      setPaymentDialog(null);
      await fetchPtPlans();
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
        await deletePtPlanPaymentAPI(id!, planId, paymentId);
        await fetchPtPlans();
      },
    });
  };

  const handleEditPtPlan = async (body: Record<string, unknown>) => {
    if (!editPtPlan) return;
    try {
      await updateMemberPtPlanAPI(editPtPlan._id, body);
      handleToast('PT Plan updated successfully', 'success');
      setEditPtPlan(null);
      await fetchPtPlans();
    } catch {
      handleToast('Failed to update PT plan', 'error');
    }
  };

  const handleShareInvoice = (plan: MemberPtPlan, invoice: MemberInvoice) => {
    if (!gym || !member) return;
    openInvoice({
      invoice,
      memberName: member.name,
      planName: plan.name,
      planType: 'PT Plan',
      purchaseDate: plan.purchaseDate,
      expiryDate: plan.expiryDate,
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
          PT Plans
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddPtPlanOpen(true)}>
          Add PT Plan
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={160} />
          ))}
        </Box>
      ) : ptPlans.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary">No PT plans assigned</Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {ptPlans.map((plan) => (
            <PtPlanCard
              key={plan._id}
              plan={plan}
              onAddPayment={() => setPaymentDialog({ open: true, id: plan._id, name: plan.name })}
              onEdit={() => setEditPtPlan(plan)}
              onDelete={() => handleDeletePtPlan(plan)}
              onDeletePayment={(paymentId) => handleDeletePayment(plan._id, paymentId)}
              onShareInvoice={(inv) => handleShareInvoice(plan, inv)}
            />
          ))}
        </Box>
      )}

      <AddPtPlanDialog
        open={addPtPlanOpen}
        onClose={() => setAddPtPlanOpen(false)}
        onSave={handleAddPtPlan}
        memberId={id!}
      />

      <AddPaymentDialog
        open={!!paymentDialog?.open}
        onClose={() => setPaymentDialog(null)}
        onSave={handleAddPayment}
        planName={paymentDialog?.name}
      />

      {editPtPlan && (
        <EditPtPlanDialog
          open={!!editPtPlan}
          onClose={() => setEditPtPlan(null)}
          onSave={handleEditPtPlan}
          plan={editPtPlan}
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
