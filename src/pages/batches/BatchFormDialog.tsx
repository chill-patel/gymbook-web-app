import { useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Batch } from '@/api/types';

const schema = z.object({
  name: z.string().min(1, 'Batch name is required'),
  batchLimit: z.string().min(1, 'Batch limit is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; batchLimit: number; startTime: string; endTime: string }) => Promise<void>;
  batch?: Batch | null;
}

/** Convert "12:26 AM" to "00:26" (24h for <input type="time">) */
function to24h(time12: string): string {
  const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return time12;
  let h = parseInt(match[1]!, 10);
  const m = match[2]!;
  const period = match[3]!.toUpperCase();
  if (period === 'AM' && h === 12) h = 0;
  if (period === 'PM' && h !== 12) h += 12;
  return `${String(h).padStart(2, '0')}:${m}`;
}

/** Convert "00:26" to "12:26 AM" */
function to12h(time24: string): string {
  const [hStr, m] = time24.split(':');
  let h = parseInt(hStr!, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${String(h).padStart(2, '0')}:${m} ${period}`;
}

export default function BatchFormDialog({ open, onClose, onSave, batch }: Props) {
  const isEdit = !!batch;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', batchLimit: '50', startTime: '', endTime: '' },
  });

  useEffect(() => {
    if (open) {
      reset(
        batch
          ? {
              name: batch.name,
              batchLimit: String(batch.batchLimit),
              startTime: to24h(batch.startTime),
              endTime: to24h(batch.endTime),
            }
          : { name: '', batchLimit: '50', startTime: '', endTime: '' },
      );
    }
  }, [open, batch, reset]);

  const onSubmit = async (data: FormValues) => {
    await onSave({
      name: data.name,
      batchLimit: Number(data.batchLimit),
      startTime: to12h(data.startTime),
      endTime: to12h(data.endTime),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{isEdit ? 'Edit Batch' : 'Add Batch'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField
            label="Batch Name"
            fullWidth
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
            autoFocus
          />
          <TextField
            label="Batch Limit"
            fullWidth
            type="number"
            {...register('batchLimit')}
            error={!!errors.batchLimit}
            helperText={errors.batchLimit?.message}
          />
          <TextField
            label="Start Time"
            fullWidth
            type="time"
            slotProps={{ inputLabel: { shrink: true } }}
            {...register('startTime')}
            error={!!errors.startTime}
            helperText={errors.startTime?.message}
          />
          <TextField
            label="End Time"
            fullWidth
            type="time"
            slotProps={{ inputLabel: { shrink: true } }}
            {...register('endTime')}
            error={!!errors.endTime}
            helperText={errors.endTime?.message}
          />
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
