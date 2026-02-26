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
import { getAllPackagesAPI } from '@/api/gym';
import type { Package } from '@/api/types';

const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'Online', 'Bank Transfer', 'Cheque'];

const schema = z.object({
  packageID: z.string().min(1, 'Plan is required'),
  joiningDate: z.string().min(1, 'Start date is required'),
  paid: z.string().default('0'),
  discount: z.string().default('0'),
  discountType: z.enum(['percent', 'amount']),
  paymentMethod: z.string().default('Cash'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  comment: z.string().default(''),
  admissionFees: z.string().default('0'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (body: Record<string, unknown>) => Promise<void>;
  memberId: string;
}

export default function AddPlanDialog({ open, onClose, onSave, memberId: _memberId }: Props) {
  const [packages, setPackages] = useState<Package[]>([]);

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
      packageID: '',
      joiningDate: new Date().toISOString().slice(0, 10),
      paid: '0',
      discount: '0',
      discountType: 'percent',
      paymentMethod: 'Cash',
      paymentDate: new Date().toISOString().slice(0, 10),
      comment: '',
      admissionFees: '0',
    },
  });

  useEffect(() => {
    if (open) {
      getAllPackagesAPI().then((res) => {
        const list = res.data ?? [];
        setPackages(list);
        if (list.length > 0) {
          setValue('packageID', list[0]!._id);
        }
      }).catch(() => {});
      reset({
        packageID: '',
        joiningDate: new Date().toISOString().slice(0, 10),
        paid: '0',
        discount: '0',
        discountType: 'percent',
        paymentMethod: 'Cash',
        paymentDate: new Date().toISOString().slice(0, 10),
        comment: '',
        admissionFees: '0',
      });
    }
  }, [open, reset]);

  const selectedPkgId = watch('packageID');
  const paidVal = watch('paid');
  const discountVal = watch('discount');
  const discountType = watch('discountType');
  const admissionFees = watch('admissionFees');

  const selectedPkg = packages.find((p) => p._id === selectedPkgId);

  const priceSummary = useMemo(() => {
    if (!selectedPkg) return null;
    const base = selectedPkg.price;
    const admission = Number(admissionFees) || 0;
    const disc = Number(discountVal) || 0;
    const paid = Number(paidVal) || 0;
    const discountAmount = discountType === 'percent' ? Math.floor(base * (disc / 100)) : disc;
    const total = Math.max(0, base + admission - discountAmount);
    const dueAmount = Math.max(0, total - paid);
    return { base, admission, discountAmount, total, dueAmount };
  }, [selectedPkg, paidVal, discountVal, discountType, admissionFees]);

  const onSubmit = async (data: FormValues) => {
    if (!selectedPkg) return;
    const disc = Number(data.discount) || 0;

    await onSave({
      dateOfPurchase: data.joiningDate,
      paid: data.paid,
      packageID: data.packageID,
      comment: data.comment,
      discountType: data.discountType,
      discount: disc,
      paymentMethod: data.paymentMethod,
      paymentDate: data.paymentDate || null,
      admissionFees: data.admissionFees,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Add Membership Plan</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <Controller
            name="packageID"
            control={control}
            render={({ field }) => (
              <TextField
                label="Select Plan"
                fullWidth
                select
                {...field}
                error={!!errors.packageID}
                helperText={errors.packageID?.message}
              >
                {packages.map((p) => (
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
            <TextField label="Admission Fees" fullWidth type="number" {...register('admissionFees')} />
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

          <Box sx={{ display: 'flex', gap: 2 }}>
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
            <TextField
              label="Payment Date"
              fullWidth
              type="date"
              {...register('paymentDate')}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>

          <TextField label="Comment" fullWidth multiline rows={2} {...register('comment')} />

          {priceSummary && (
            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Base Price</Typography>
                <Typography variant="body2" fontWeight={600}>₹{priceSummary.base}</Typography>
              </Box>
              {priceSummary.admission > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Admission</Typography>
                  <Typography variant="body2" fontWeight={600}>₹{priceSummary.admission}</Typography>
                </Box>
              )}
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
          <Button type="submit" variant="contained" disabled={isSubmitting || !selectedPkg}>
            {isSubmitting ? 'Saving...' : 'Add Plan'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
