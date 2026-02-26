import { useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useForm, useFieldArray } from 'react-hook-form';
import type { MemberMeasurement } from '@/api/types';

const DEFAULT_TYPES = [
  'Height', 'Weight', 'Chest', 'Waist', 'Hips',
  'Left Thigh', 'Right Thigh', 'Left Arm', 'Right Arm',
  'Age', 'Neck', 'Left Calf', 'Right Calf',
];

interface FormValues {
  date: string;
  measurements: { type: string; value: string }[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (body: Record<string, unknown>) => Promise<void>;
  existing?: MemberMeasurement | null;
  memberId: string;
}

export default function MeasurementDialog({ open, onClose, onSave, existing, memberId }: Props) {
  const isEdit = !!existing;

  const { register, handleSubmit, reset, control, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      measurements: DEFAULT_TYPES.map((t) => ({ type: t, value: '' })),
    },
  });

  const { fields } = useFieldArray({ control, name: 'measurements' });

  useEffect(() => {
    if (open) {
      if (existing) {
        const existingMap = new Map(existing.measurement.map((m) => [m.type, m.value]));
        reset({
          date: existing.date ? new Date(existing.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
          measurements: DEFAULT_TYPES.map((t) => ({ type: t, value: existingMap.get(t) ?? '' })),
        });
      } else {
        reset({
          date: new Date().toISOString().slice(0, 10),
          measurements: DEFAULT_TYPES.map((t) => ({ type: t, value: '' })),
        });
      }
    }
  }, [open, existing, reset]);

  const onSubmit = async (data: FormValues) => {
    const nonEmpty = data.measurements
      .filter((m) => m.value.trim() !== '' && m.type.trim() !== '')
      .map((m) => ({ type: m.type.trim(), value: m.value.trim() }));
    if (nonEmpty.length === 0) return;
    const body: Record<string, unknown> = {
      memberID: memberId,
      date: data.date,
      measurement: nonEmpty,
    };
    if (existing) {
      body.measurementId = existing._id;
    }
    await onSave(body);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{isEdit ? 'Edit Measurement' : 'Add Measurement'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField
            label="Date"
            fullWidth
            type="date"
            {...register('date')}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {fields.map((field, index) => (
              <Box key={field.id} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  label="Type"
                  size="small"
                  sx={{ flex: 1 }}
                  {...register(`measurements.${index}.type`)}
                />
                <TextField
                  label="Value"
                  size="small"
                  sx={{ flex: 1 }}
                  {...register(`measurements.${index}.value`)}
                />
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
