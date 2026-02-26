import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getMemberPrerequisiteAPI, addMemberAPI } from '@/api/member';
import type { Package, Batch, AddMemberRequest } from '@/api/types';
import MuiPhoneInput from '@/components/MuiPhoneInput';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  gender: z.string().min(1, 'Gender is required'),
  email: z.string().email('Invalid email').or(z.literal('')).optional(),
  mobile: z.string().optional(),
  countryCode: z.string().optional(),
  callingCode: z.string().optional(),
  address: z.string().optional(),
  dob: z.string().optional(),
  notes: z.string().optional(),
  membershipId: z.string().optional(),
  aadharNumber: z.string().optional(),
  occupation: z.string().optional(),
  packageID: z.string().optional(),
  batchId: z.string().optional(),
  paid: z.string().optional(),
  discount: z.string().optional(),
  discountType: z.enum(['percent', 'amount']).optional(),
  admissionFees: z.string().optional(),
  comment: z.string().optional(),
  dateOfJoing: z.string().optional(),
  paymentDate: z.string().optional(),
  paymentMethod: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ─── Summary Row ─────────────────────────────────────────

function SummaryRow({ label, value, bold, color }: {
  label: string;
  value: string | number;
  bold?: boolean;
  color?: string;
}) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
      <Typography variant="body2" color={color ?? 'text.secondary'} fontWeight={bold ? 600 : 400}>
        {label}
      </Typography>
      <Typography variant="body2" color={color ?? 'text.primary'} fontWeight={bold ? 600 : 400}>
        {value}
      </Typography>
    </Box>
  );
}

// ─── Main Page ───────────────────────────────────────────

export default function AddMemberPage() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<Package[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [membershipId, setMembershipId] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      gender: 'male',
      email: '',
      mobile: '',
      callingCode: '91',
      countryCode: 'IN',
      address: '',
      dob: '',
      notes: '',
      membershipId: '',
      aadharNumber: '',
      occupation: '',
      packageID: '',
      batchId: '',
      paid: '',
      discount: '',
      discountType: 'percent',
      admissionFees: '0',
      comment: '',
      dateOfJoing: new Date().toISOString().split('T')[0],
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash',
    },
  });

  const selectedPackageId = watch('packageID');
  const discountStr = watch('discount');
  const discountType = watch('discountType');
  const admissionFeesStr = watch('admissionFees');
  const paidStr = watch('paid');

  const selectedPackage = packages.find((p) => p._id === selectedPackageId);

  const packagePrice = selectedPackage?.price ?? 0;
  const admissionFees = Number(admissionFeesStr) || 0;
  const discountVal = Number(discountStr) || 0;
  const discountAmount = discountType === 'percent'
    ? Math.floor((packagePrice * discountVal) / 100)
    : discountVal;
  const totalAmount = packagePrice + admissionFees;
  const totalAfterDiscount = totalAmount - discountAmount;
  const paid = Number(paidStr) || 0;
  const pendingAmount = Math.max(0, totalAfterDiscount - paid);

  const fetchPrerequisite = useCallback(async () => {
    try {
      const res = await getMemberPrerequisiteAPI();
      const pkgs = res.data.packages ?? [];
      setPackages(pkgs);
      setBatches(res.data.batch ?? []);
      const mId = res.data.membershipId ?? 0;
      setMembershipId(mId);
      if (mId) setValue('membershipId', String(mId));
      if (pkgs.length > 0) {
        setValue('packageID', pkgs[0]!._id);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrerequisite();
  }, [fetchPrerequisite]);

  const calculateExpiryDate = (pkg: Package, joiningDate: string) => {
    const start = joiningDate ? new Date(joiningDate) : new Date();
    if (pkg.days) {
      start.setDate(start.getDate() + pkg.days);
    } else if (pkg.month) {
      start.setMonth(start.getMonth() + pkg.month);
    }
    return start.toISOString().split('T')[0]!;
  };

  const onSubmit = async (data: FormValues) => {
    const joiningDate = data.dateOfJoing || new Date().toISOString().split('T')[0]!;

    const body: AddMemberRequest = {
      name: data.name,
      gender: data.gender,
      membershipId: data.membershipId || String(membershipId),
      dateOfJoing: joiningDate,
      ...(data.email && { email: data.email }),
      ...(data.mobile && { mobile: data.mobile }),
      ...(data.countryCode && { countryCode: data.countryCode }),
      ...(data.callingCode && { callingCode: data.callingCode }),
      ...(data.address && { address: data.address }),
      ...(data.dob && { dob: data.dob }),
      ...(data.notes && { notes: data.notes }),
      ...(data.aadharNumber && { aadharNumber: data.aadharNumber }),
      ...(data.occupation && { occupation: data.occupation }),
      ...(data.batchId && { batchId: data.batchId }),
      ...(data.comment && { comment: data.comment }),
      ...(data.paymentMethod && { paymentMethod: data.paymentMethod }),
    };

    if (selectedPackage) {
      const purchaseDate = joiningDate;
      const expiryDate = calculateExpiryDate(selectedPackage, purchaseDate);

      body.packageID = selectedPackage._id;
      body.paid = String(paid);
      body.discount = discountVal || null;
      body.discountType = data.discountType;
      body.admissionFees = String(admissionFees);
      body.paymentDate = data.paymentDate || null;
      body.packageDetail = {
        totalAmount: packagePrice,
        paid,
        purchaseDate,
        expiryDate,
        isActive: true,
        name: selectedPackage.name,
        ...(data.comment && { comments: [{ text: data.comment }] }),
        discount: discountVal || null,
        discountType: data.discountType,
        pendingAmount,
        totalAfterDiscount,
        admissionFees: String(admissionFees),
      };
    }

    try {
      await addMemberAPI(body);
      setToast({ message: 'Member added successfully', severity: 'success' });
      setTimeout(() => navigate('/members'), 500);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setToast({ message: apiErr.message ?? 'Failed to add member', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Skeleton variant="rounded" height={40} width={150} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Skeleton variant="rounded" height={400} />
          </Grid>
          <Grid size={{ xs: 12, lg: 5 }}>
            <Skeleton variant="rounded" height={300} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button startIcon={<BackIcon />} onClick={() => navigate('/members')}>
            Back
          </Button>
          <Divider orientation="vertical" flexItem />
          <Typography variant="h5" fontWeight={700}>
            Add Member
          </Typography>
        </Box>
        <Button
          type="submit"
          form="add-member-form"
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={isSubmitting}
          size="large"
        >
          {isSubmitting ? 'Saving...' : 'Add Member'}
        </Button>
      </Box>

      <form id="add-member-form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* ─── Left Column: Member Info ─── */}
          <Grid size={{ xs: 12, lg: 7 }}>
            {/* Personal Details */}
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Typography variant="subtitle1" fontWeight={600} mb={2.5}>
                  Personal Details
                </Typography>
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="Name *"
                      fullWidth
                      {...register('name')}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      autoFocus
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.gender}>
                          <InputLabel>Gender *</InputLabel>
                          <Select {...field} label="Gender *">
                            <MenuItem value="male">Male</MenuItem>
                            <MenuItem value="female">Female</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <MuiPhoneInput
                      onPhoneChange={(data) => {
                        setValue('mobile', data.nationalNumber);
                        setValue('callingCode', data.callingCode);
                        setValue('countryCode', data.countryCode);
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField label="Email" fullWidth type="email" {...register('email')} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="Membership ID"
                      fullWidth
                      {...register('membershipId')}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="Joining Date"
                      fullWidth
                      type="date"
                      slotProps={{ inputLabel: { shrink: true } }}
                      {...register('dateOfJoing')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Typography variant="subtitle1" fontWeight={600} mb={2.5}>
                  Additional Details
                </Typography>
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="Date of Birth"
                      fullWidth
                      type="date"
                      slotProps={{ inputLabel: { shrink: true } }}
                      {...register('dob')}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField label="Occupation" fullWidth {...register('occupation')} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField label="Aadhar Number" fullWidth {...register('aadharNumber')} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField label="Address" fullWidth multiline rows={2} {...register('address')} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField label="Notes" fullWidth multiline rows={2} {...register('notes')} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Batch + Plan selection side by side on desktop */}
            <Grid container spacing={3}>
              {batches.length > 0 && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                      <Typography variant="subtitle1" fontWeight={600} mb={2.5}>
                        Batch
                      </Typography>
                      <Controller
                        name="batchId"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Select Batch</InputLabel>
                            <Select {...field} label="Select Batch">
                              <MenuItem value="">None</MenuItem>
                              {batches.map((b) => (
                                <MenuItem key={b._id} value={b._id}>
                                  {b.name} ({b.startTime} — {b.endTime})
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              )}
              <Grid size={{ xs: 12, md: batches.length > 0 ? 6 : 12 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                    <Typography variant="subtitle1" fontWeight={600} mb={2.5}>
                      Membership Plan
                    </Typography>
                    <Controller
                      name="packageID"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Select Plan</InputLabel>
                          <Select {...field} label="Select Plan">
                            <MenuItem value="">No Plan</MenuItem>
                            {packages.map((p) => (
                              <MenuItem key={p._id} value={p._id}>
                                {p.name} — {p.price}
                                {p.month ? ` (${p.month}mo)` : ''}
                                {p.days ? ` (${p.days}d)` : ''}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* ─── Right Column: Payment ─── */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Box sx={{ position: 'sticky', top: 80 }}>
              <Card>
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                  <Typography variant="subtitle1" fontWeight={600} mb={2.5}>
                    Payment Details
                  </Typography>

                  {!selectedPackage ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Select a membership plan to configure payment
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {/* Selected plan info */}
                      <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, mb: 2.5 }}>
                        <Typography variant="body2" color="text.secondary">Selected Plan</Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {selectedPackage.name} — {selectedPackage.price}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedPackage.month ? `${selectedPackage.month} month${selectedPackage.month > 1 ? 's' : ''}` : ''}
                          {selectedPackage.days ? `${selectedPackage.days} days` : ''}
                        </Typography>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                          <TextField
                            label="Admission Fees"
                            fullWidth
                            type="number"
                            size="small"
                            {...register('admissionFees')}
                          />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <TextField
                            label="Discount"
                            fullWidth
                            type="number"
                            size="small"
                            {...register('discount')}
                          />
                        </Grid>
                        <Grid size={12}>
                          <Controller
                            name="discountType"
                            control={control}
                            render={({ field }) => (
                              <RadioGroup row {...field}>
                                <FormControlLabel value="percent" control={<Radio size="small" />} label="Percent (%)" />
                                <FormControlLabel value="amount" control={<Radio size="small" />} label="Amount" />
                              </RadioGroup>
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <TextField
                            label="Amount Paid"
                            fullWidth
                            type="number"
                            size="small"
                            {...register('paid')}
                          />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Controller
                            name="paymentMethod"
                            control={control}
                            render={({ field }) => (
                              <FormControl fullWidth size="small">
                                <InputLabel>Payment Method</InputLabel>
                                <Select {...field} label="Payment Method">
                                  <MenuItem value="Cash">Cash</MenuItem>
                                  <MenuItem value="Card">Card</MenuItem>
                                  <MenuItem value="UPI">UPI</MenuItem>
                                  <MenuItem value="Online">Online</MenuItem>
                                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                                  <MenuItem value="Cheque">Cheque</MenuItem>
                                </Select>
                              </FormControl>
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <TextField
                            label="Payment Date"
                            fullWidth
                            type="date"
                            size="small"
                            slotProps={{ inputLabel: { shrink: true } }}
                            {...register('paymentDate')}
                          />
                        </Grid>
                        <Grid size={12}>
                          <TextField
                            label="Comment"
                            fullWidth
                            size="small"
                            {...register('comment')}
                          />
                        </Grid>
                      </Grid>

                      {/* Price summary */}
                      <Divider sx={{ my: 2.5 }} />
                      <Box>
                        <SummaryRow label="Plan Price" value={packagePrice} />
                        {admissionFees > 0 && (
                          <SummaryRow label="Admission Fees" value={`+${admissionFees}`} />
                        )}
                        {discountAmount > 0 && (
                          <SummaryRow label="Discount" value={`-${discountAmount}`} color="success.main" />
                        )}
                        <Divider sx={{ my: 1 }} />
                        <SummaryRow label="Total" value={totalAfterDiscount} bold />
                        <SummaryRow label="Paid" value={paid} />
                        {pendingAmount > 0 && (
                          <SummaryRow label="Pending" value={pendingAmount} bold color="error.main" />
                        )}
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Bottom action — visible on smaller screens */}
              <Box sx={{ display: { xs: 'flex', lg: 'none' }, justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                <Button onClick={() => navigate('/members')}>Cancel</Button>
                <Button
                  type="submit"
                  form="add-member-form"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Add Member'}
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </form>

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
