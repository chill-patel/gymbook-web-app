import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Save as SaveIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { getAllPackagesAPI } from '@/api/gym';
import { addVisitorAPI } from '@/api/visitor';
import type { Package } from '@/api/types';
import MuiPhoneInput from '@/components/MuiPhoneInput';
import PageHeader from '@/components/PageHeader';
import { Layout } from '@/theme';

const LEAD_STATUSES = [
  'Initial Discussion',
  'Payment issue',
  'Blocked',
  'Closed',
];

export default function AddVisitorPage() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [callingCode, setCallingCode] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [packageId, setPackageId] = useState('');
  const [leadStatus, setLeadStatus] = useState(LEAD_STATUSES[0]!);
  const [followUpDate, setFollowUpDate] = useState('');
  const [comment, setComment] = useState('');

  const fetchPackages = useCallback(async () => {
    try {
      const res = await getAllPackagesAPI();
      const pkgs = res.data ?? [];
      setPackages(pkgs);
      if (pkgs.length > 0) setPackageId(pkgs[0]!._id);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const selectedPackage = packages.find((p) => p._id === packageId);

  const handleSave = async () => {
    if (!name.trim()) {
      setToast({ message: 'Name is required', severity: 'error' });
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        leadStatus,
        ...(mobile && { mobile, callingCode, countryCode }),
      };

      if (selectedPackage) {
        body.packages = {
          _id: selectedPackage._id,
          name: selectedPackage.name,
          price: selectedPackage.price,
          month: selectedPackage.month ?? null,
        };
      }

      if (followUpDate) {
        body.fallowUpDate = new Date(followUpDate).getTime();
      }

      if (comment.trim()) {
        body.comments = [{ text: comment.trim() }];
      }

      await addVisitorAPI(body);
      setToast({ message: 'Enquiry added', severity: 'success' });
      setTimeout(() => navigate('/visitors'), 500);
    } catch {
      setToast({ message: 'Failed to add enquiry', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ maxWidth: Layout.pageMaxWidthNarrow, mx: 'auto' }}>
        <Skeleton variant="rounded" height={40} width={150} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={300} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: Layout.pageMaxWidthNarrow, mx: 'auto' }}>
      <PageHeader
        title="Add Enquiry"
        backPath={true}
        action={
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={saving}
            onClick={handleSave}
            size="large"
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        }
      />

      {packages.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" mb={1}>
              No plans found
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Please add a membership plan before creating enquiries.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/gym/plans')}>
              Add Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {/* Profile Section */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Typography variant="subtitle1" fontWeight={600} mb={2.5}>
                  Visitor Details
                </Typography>
                <Grid container spacing={2.5}>
                  <Grid size={12}>
                    <TextField
                      label="Name *"
                      fullWidth
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoFocus
                    />
                  </Grid>
                  <Grid size={12}>
                    <MuiPhoneInput
                      onPhoneChange={(data) => {
                        setMobile(data.nationalNumber);
                        setCallingCode(data.callingCode);
                        setCountryCode(data.countryCode);
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Plan Enquiry Section */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Typography variant="subtitle1" fontWeight={600} mb={2.5}>
                  Plan Enquiry
                </Typography>
                <Grid container spacing={2.5}>
                  <Grid size={12}>
                    <FormControl fullWidth>
                      <InputLabel>Select Plan</InputLabel>
                      <Select
                        value={packageId}
                        label="Select Plan"
                        onChange={(e) => setPackageId(e.target.value)}
                      >
                        {packages.map((p) => (
                          <MenuItem key={p._id} value={p._id}>
                            {p.name} — ₹{p.price.toLocaleString()}
                            {p.month ? ` (${p.month}mo)` : ''}
                            {p.days ? ` (${p.days}d)` : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={12}>
                    <FormControl fullWidth>
                      <InputLabel>Lead Status</InputLabel>
                      <Select
                        value={leadStatus}
                        label="Lead Status"
                        onChange={(e) => setLeadStatus(e.target.value)}
                      >
                        {LEAD_STATUSES.map((s) => (
                          <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="Follow-up Date"
                      fullWidth
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="Discussion Notes"
                      fullWidth
                      multiline
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

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
