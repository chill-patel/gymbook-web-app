import { useEffect, useMemo } from 'react';
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
import type { MemberService } from '@/api/types';
import { formatDate } from '../components/MemberCards';

const schema = z.object({
  paid: z.string(),
  discount: z.string(),
  discountType: z.enum(['percent', 'amount']),
  comment: z.string(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (body: Record<string, unknown>) => Promise<void>;
  service: MemberService;
}

export default function EditServiceDialog({ open, onClose, onSave, service }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const baseAmount = service.totalAmount ?? service.price;

  useEffect(() => {
    if (open && service) {
      reset({
        paid: String(service.paid ?? 0),
        discount: String(service.discount ?? 0),
        discountType: (service.discountType as 'percent' | 'amount') ?? 'percent',
        comment: service.comments?.[0]?.text ?? '',
      });
    }
  }, [open, service, reset]);

  const paidVal = watch('paid');
  const discountVal = watch('discount');
  const discountType = watch('discountType');

  const priceSummary = useMemo(() => {
    const base = baseAmount;
    const disc = Number(discountVal) || 0;
    const paid = Number(paidVal) || 0;
    const discountAmount = discountType === 'percent' ? Math.floor(base * (disc / 100)) : disc;
    const totalAfterDiscount = Math.max(0, base - discountAmount);
    const dueAmount = Math.max(0, totalAfterDiscount - paid);
    return { base, discountAmount, totalAfterDiscount, dueAmount };
  }, [baseAmount, paidVal, discountVal, discountType]);

  const onSubmit = async (data: FormValues) => {
    const paid = Number(data.paid) || 0;
    if (paid > priceSummary.totalAfterDiscount) return;

    await onSave({
      name: service.name,
      paid: data.paid,
      totalAmount: baseAmount,
      discount: Number(data.discount) || 0,
      discountType: data.discountType,
      comment: data.comment,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Edit Service</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Service</Typography>
              <Typography variant="body2" fontWeight={600}>{service.name}</Typography>
            </Box>
            {service.purchaseDate && (
              <Box>
                <Typography variant="caption" color="text.secondary">Purchased</Typography>
                <Typography variant="body2" fontWeight={600}>{formatDate(service.purchaseDate)}</Typography>
              </Box>
            )}
            <Box>
              <Typography variant="caption" color="text.secondary">Base Price</Typography>
              <Typography variant="body2" fontWeight={600}>₹{baseAmount}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Total</Typography>
              <Typography variant="body2" fontWeight={700} color="primary">₹{priceSummary.totalAfterDiscount}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Due Amount</Typography>
              <Typography variant="body2" fontWeight={700} sx={{ color: priceSummary.dueAmount > 0 ? '#E57373' : '#81C784' }}>
                ₹{priceSummary.dueAmount}
              </Typography>
            </Box>
          </Box>

          <TextField label="Paid Amount" fullWidth type="number" {...register('paid')} />

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
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
