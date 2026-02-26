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
import { getAllServicesAPI } from '@/api/gym';
import type { Service } from '@/api/types';

const schema = z.object({
  serviceID: z.string().min(1, 'Service is required'),
  joiningDate: z.string().min(1, 'Date is required'),
  paid: z.string().default(''),
  discount: z.string().default(''),
  discountType: z.enum(['percent', 'amount']),
  comment: z.string().default(''),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (body: Record<string, unknown>) => Promise<void>;
  memberId: string;
}

export default function AddServiceDialog({ open, onClose, onSave }: Props) {
  const [services, setServices] = useState<Service[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      serviceID: '',
      joiningDate: new Date().toISOString().slice(0, 10),
      paid: '',
      discount: '',
      discountType: 'percent',
      comment: '',
    },
  });

  useEffect(() => {
    if (open) {
      getAllServicesAPI().then((res) => setServices(res.data ?? [])).catch(() => {});
      reset({
        serviceID: '',
        joiningDate: new Date().toISOString().slice(0, 10),
        paid: '0',
        discount: '0',
        discountType: 'percent',
        comment: '',
      });
    }
  }, [open, reset]);

  const selectedServiceId = watch('serviceID');
  const paidVal = watch('paid');
  const discountVal = watch('discount');
  const discountType = watch('discountType');

  const selectedService = services.find((s) => s._id === selectedServiceId);

  const priceSummary = useMemo(() => {
    if (!selectedService) return null;
    const base = selectedService.price;
    const disc = Number(discountVal) || 0;
    const paid = Number(paidVal) || 0;
    const discountAmount = discountType === 'percent' ? Math.floor(base * (disc / 100)) : disc;
    const total = Math.max(0, base - discountAmount);
    const dueAmount = Math.max(0, total - paid);
    return { base, discountAmount, total, dueAmount };
  }, [selectedService, paidVal, discountVal, discountType]);

  const onSubmit = async (data: FormValues) => {
    if (!selectedService) return;
    const paid = Number(data.paid) || 0;

    await onSave({
      dateOfPurchase: data.joiningDate,
      paid,
      serviceID: data.serviceID,
      discountType: data.discountType,
      discount: data.discount,
      ...(data.comment ? { comment: data.comment } : {}),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Add Service</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <Controller
            name="serviceID"
            control={control}
            render={({ field }) => (
              <TextField
                label="Select Service"
                fullWidth
                select
                {...field}
                error={!!errors.serviceID}
                helperText={errors.serviceID?.message}
              >
                {services.map((s) => (
                  <MenuItem key={s._id} value={s._id}>
                    {s.name} — ₹{s.price}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <TextField
            label="Date"
            fullWidth
            type="date"
            {...register('joiningDate')}
            error={!!errors.joiningDate}
            helperText={errors.joiningDate?.message}
            slotProps={{ inputLabel: { shrink: true } }}
          />

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
          <Button type="submit" variant="contained" disabled={isSubmitting || !selectedService}>
            {isSubmitting ? 'Saving...' : 'Add Service'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
