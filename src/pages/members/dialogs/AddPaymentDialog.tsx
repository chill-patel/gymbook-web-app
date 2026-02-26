import { useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  paidAmount: z.string().min(1, 'Amount is required'),
  paymentDate: z.string().min(1, 'Date is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
});

type FormValues = z.infer<typeof schema>;

const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'Online', 'Bank Transfer', 'Cheque'];

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (body: { paidAmount: number; paymentDate: string; paymentMethod: string }) => Promise<void>;
  planName?: string;
}

export default function AddPaymentDialog({ open, onClose, onSave, planName }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { paidAmount: '', paymentDate: new Date().toISOString().slice(0, 10), paymentMethod: 'Cash' },
  });

  useEffect(() => {
    if (open) {
      reset({ paidAmount: '', paymentDate: new Date().toISOString().slice(0, 10), paymentMethod: 'Cash' });
    }
  }, [open, reset]);

  const onSubmit = async (data: FormValues) => {
    await onSave({
      paidAmount: Number(data.paidAmount),
      paymentDate: data.paymentDate,
      paymentMethod: data.paymentMethod,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Add Payment{planName ? ` — ${planName}` : ''}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField
            label="Amount"
            fullWidth
            type="number"
            {...register('paidAmount')}
            error={!!errors.paidAmount}
            helperText={errors.paidAmount?.message}
            autoFocus
          />
          <TextField
            label="Payment Date"
            fullWidth
            type="date"
            {...register('paymentDate')}
            error={!!errors.paymentDate}
            helperText={errors.paymentDate?.message}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Payment Method"
            fullWidth
            select
            defaultValue="Cash"
            {...register('paymentMethod')}
            error={!!errors.paymentMethod}
            helperText={errors.paymentMethod?.message}
          >
            {PAYMENT_METHODS.map((m) => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
