import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Box,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Member, Batch } from '@/api/types';
import { getAllBatchesAPI } from '@/api/gym';
import MuiPhoneInput from '@/components/MuiPhoneInput';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  gender: z.string(),
  mobile: z.string(),
  callingCode: z.string(),
  email: z.string(),
  dob: z.string(),
  membershipId: z.string(),
  address: z.string(),
  notes: z.string(),
  aadharNumber: z.string(),
  occupation: z.string(),
  batchId: z.string(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (body: Record<string, unknown>) => Promise<void>;
  member: Member;
}

export default function EditProfileDialog({ open, onClose, onSave, member }: Props) {
  const [batches, setBatches] = useState<Batch[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) {
      getAllBatchesAPI().then((res) => setBatches(res.data ?? [])).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (open && member) {
      reset({
        name: member.name ?? '',
        gender: member.gender ?? '',
        mobile: member.mobile ?? '',
        callingCode: member.callingCode ?? '',
        email: member.email ?? '',
        dob: member.dob?.slice(0, 10) ?? '',
        membershipId: member.membershipId != null ? String(member.membershipId) : '',
        address: member.address ?? '',
        notes: member.notes ?? '',
        aadharNumber: member.aadharNumber ?? '',
        occupation: member.occupation ?? '',
        batchId: member.batch?._id ?? '',
      });
    }
  }, [open, member, reset]);

  const onSubmit = async (data: FormValues) => {
    await onSave({
      name: data.name,
      gender: data.gender || undefined,
      mobile: data.mobile || undefined,
      callingCode: data.callingCode || undefined,
      email: data.email || undefined,
      dob: data.dob || null,
      membershipId: data.membershipId || undefined,
      address: data.address || undefined,
      notes: data.notes || undefined,
      aadharNumber: data.aadharNumber || undefined,
      occupation: data.occupation || undefined,
      batchId: data.batchId || null,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField
            label="Name"
            fullWidth
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <TextField label="Gender" fullWidth select {...field}>
                  <MenuItem value="">Not specified</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              )}
            />
            <TextField
              label="Date of Birth"
              fullWidth
              type="date"
              {...register('dob')}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>

          <MuiPhoneInput
            defaultCountry={(member.countryCode || 'IN').toLowerCase() as 'in'}
            initialPhone={`+${member.callingCode || '91'}${member.mobile || ''}`}
            onPhoneChange={(data) => {
              setValue('mobile', data.nationalNumber);
              setValue('callingCode', data.callingCode);
            }}
          />

          <TextField label="Email" fullWidth {...register('email')} />

          <TextField label="Membership ID" fullWidth {...register('membershipId')} />

          <Controller
            name="batchId"
            control={control}
            render={({ field }) => (
              <TextField label="Batch" fullWidth select {...field}>
                <MenuItem value="">No Batch</MenuItem>
                {batches.map((b) => (
                  <MenuItem key={b._id} value={b._id}>
                    {b.name} ({b.startTime} - {b.endTime}) — {b.currentMember}/{b.batchLimit}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <TextField label="Address" fullWidth multiline rows={2} {...register('address')} />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Aadhar Number" fullWidth {...register('aadharNumber')} />
            <TextField label="Occupation" fullWidth {...register('occupation')} />
          </Box>

          <TextField label="Notes" fullWidth multiline rows={2} {...register('notes')} />
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
