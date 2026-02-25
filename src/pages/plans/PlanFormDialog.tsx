import { useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Package } from '@/api/types';

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

const schema = z
  .object({
    name: z.string().min(1, 'Plan name is required'),
    price: z.string().min(1, 'Price is required'),
    planType: z.enum(['months', 'days']),
    month: z.number().optional(),
    days: z.string().optional(),
  })
  .refine(
    (d) => {
      if (d.planType === 'days') return !!d.days && Number(d.days) > 0;
      return true;
    },
    { message: 'Enter number of days', path: ['days'] },
  );

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; price: string; month?: number | null; days?: number | null }) => Promise<void>;
  plan?: Package | null;
}

export default function PlanFormDialog({ open, onClose, onSave, plan }: Props) {
  const isEdit = !!plan;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      price: '',
      planType: 'months',
      month: 1,
      days: '',
    },
  });

  // Reset form when dialog opens or plan changes
  useEffect(() => {
    if (open) {
      if (plan) {
        const hasDays = plan.days != null && plan.days > 0;
        reset({
          name: plan.name,
          price: String(plan.price),
          planType: hasDays ? 'days' : 'months',
          month: plan.month ?? 1,
          days: hasDays ? String(plan.days) : '',
        });
      } else {
        reset({
          name: '',
          price: '',
          planType: 'months',
          month: 1,
          days: '',
        });
      }
    }
  }, [open, plan, reset]);

  const planType = watch('planType');

  const onSubmit = async (data: FormValues) => {
    await onSave({
      name: data.name,
      price: data.price,
      month: data.planType === 'months' ? (data.month ?? 1) : null,
      days: data.planType === 'days' ? Number(data.days) : null,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{isEdit ? 'Edit Plan' : 'Add Plan'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField
            label="Plan Name"
            fullWidth
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
            autoFocus
          />
          <TextField
            label="Price"
            fullWidth
            type="number"
            {...register('price')}
            error={!!errors.price}
            helperText={errors.price?.message}
          />

          <Controller
            name="planType"
            control={control}
            render={({ field }) => (
              <RadioGroup row {...field}>
                <FormControlLabel value="months" control={<Radio />} label="Months" />
                <FormControlLabel value="days" control={<Radio />} label="Days" />
              </RadioGroup>
            )}
          />

          {planType === 'months' ? (
            <Controller
              name="month"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Duration (Months)"
                  select
                  fullWidth
                  slotProps={{ select: { native: true } }}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                >
                  {MONTH_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m} {m === 1 ? 'Month' : 'Months'}
                    </option>
                  ))}
                </TextField>
              )}
            />
          ) : (
            <TextField
              label="Duration (Days)"
              fullWidth
              type="number"
              {...register('days')}
              error={!!errors.days}
              helperText={errors.days?.message}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
