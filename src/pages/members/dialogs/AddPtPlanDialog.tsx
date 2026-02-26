import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getAllPtPlansAPI } from '@/api/gym';
import { getMemberPtPlansAPI } from '@/api/member';
import type { Package } from '@/api/types';

const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'Online', 'Bank Transfer', 'Cheque'];

const schema = z.object({
  ptPlanID: z.string().min(1, 'PT Plan is required'),
  joiningDate: z.string().min(1, 'Start date is required'),
  paid: z.string().default(''),
  discount: z.string().default(''),
  discountType: z.enum(['percent', 'amount']),
  paymentMethod: z.string().default('Cash'),
  comment: z.string().default(''),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (body: Record<string, unknown>) => Promise<void>;
  memberId: string;
}

export default function AddPtPlanDialog({ open, onClose, onSave, memberId }: Props) {
  const [ptPlans, setPtPlans] = useState<Package[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ptPlanID: '',
      joiningDate: new Date().toISOString().slice(0, 10),
      paid: '0',
      discount: '0',
      discountType: 'percent',
      paymentMethod: 'Cash',
      comment: '',
    },
  });

  useEffect(() => {
    if (open) {
      const today = new Date().toISOString().slice(0, 10);
      reset({
        ptPlanID: '',
        joiningDate: today,
        paid: '',
        discount: '',
        discountType: 'percent',
        paymentMethod: 'Cash',
        comment: '',
      });

      getAllPtPlansAPI().then((res) => {
        const list = res.data ?? [];
        setPtPlans(list);
        if (list.length > 0) {
          setValue('ptPlanID', list[0]!._id);
        }
      }).catch(() => {});

      // Set start date to day after latest PT plan expiry (matching mobile)
      if (memberId) {
        getMemberPtPlansAPI(memberId).then((res) => {
          const plans = res.data?.ptPlans ?? [];
          if (plans.length > 0) {
            const sorted = [...plans].sort(
              (a, b) => new Date(b.expiryDate ?? 0).getTime() - new Date(a.expiryDate ?? 0).getTime(),
            );
            if (sorted[0]!.expiryDate) {
              const latestExpiry = new Date(sorted[0]!.expiryDate);
              latestExpiry.setDate(latestExpiry.getDate() + 1);
              setValue('joiningDate', latestExpiry.toISOString().slice(0, 10));
            }
          }
        }).catch(() => {});
      }
    }
  }, [open, reset, memberId, setValue]);

  const selectedPlanId = watch('ptPlanID');
  const paidVal = watch('paid');
  const discountVal = watch('discount');
  const discountType = watch('discountType');

  const selectedPlan = ptPlans.find((p) => p._id === selectedPlanId);

  const priceSummary = useMemo(() => {
    if (!selectedPlan) return null;
    const base = selectedPlan.price;
    const disc = Number(discountVal) || 0;
    const paid = Number(paidVal) || 0;
    const discountAmount = discountType === 'percent' ? Math.floor(base * (disc / 100)) : disc;
    const total = Math.max(0, base - discountAmount);
    const dueAmount = Math.max(0, total - paid);
    return { base, discountAmount, total, dueAmount };
  }, [selectedPlan, paidVal, discountVal, discountType]);

  const onSubmit = async (data: FormValues) => {
    if (!selectedPlan) return;
    const paid = Number(data.paid) || 0;

    await onSave({
      dateOfPurchase: data.joiningDate,
      paid,
      ptPlanID: selectedPlan.planId || selectedPlan._id,
      comment: data.comment || '',
      discountType: data.discountType,
      discount: data.discount,
      paymentMethod: data.paymentMethod,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Add PT Plan</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <Controller
            name="ptPlanID"
            control={control}
            render={({ field }) => (
              <TextField
                label="Select PT Plan"
                fullWidth
                select
                {...field}
                error={!!errors.ptPlanID}
                helperText={errors.ptPlanID?.message}
              >
                {ptPlans.map((p) => (
                  <MenuItem key={p._id} value={p._id}>
                    {p.name} — ₹{p.price}
                    {p.month ? ` (${p.month} month${p.month > 1 ? 's' : ''})` : ''}
                    {p.days ? ` (${p.days} days)` : ''}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <TextField
            label="Start Date"
            fullWidth
            type="date"
            {...register('joiningDate')}
            error={!!errors.joiningDate}
            helperText={errors.joiningDate?.message}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Paid Amount" fullWidth type="number" {...register('paid')} />
            <TextField
              label="Payment Method"
              fullWidth
              select
              defaultValue="Cash"
              {...register('paymentMethod')}
            >
              {PAYMENT_METHODS.map((m) => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Discount" fullWidth type="number" {...register('discount')} />
            <Controller
              name="discountType"
              control={control}
              render={({ field }) => (
                <TextField label="Discount Type" fullWidth select {...field}>
                  <MenuItem value="percent">Percent (%)</MenuItem>
                  <MenuItem value="amount">Amount (₹)</MenuItem>
                </TextField>
              )}
            />
          </Box>

          <TextField label="Comment" fullWidth multiline rows={2} {...register('comment')} />

          {priceSummary && (
            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Base Price</Typography>
                <Typography variant="body2" fontWeight={600}>₹{priceSummary.base}</Typography>
              </Box>
              {priceSummary.discountAmount > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Discount</Typography>
                  <Typography variant="body2" fontWeight={600} color="error">-₹{priceSummary.discountAmount}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="caption" color="text.secondary">Total</Typography>
                <Typography variant="body2" fontWeight={700} color="primary">₹{priceSummary.total}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Due Amount</Typography>
                <Typography variant="body2" fontWeight={700} sx={{ color: priceSummary.dueAmount > 0 ? '#E57373' : '#81C784' }}>
                  ₹{priceSummary.dueAmount}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || !selectedPlan}>
            {isSubmitting ? 'Saving...' : 'Add PT Plan'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
