import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
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
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router';
import { getAllPackagesAPI } from '@/api/gym';
import { updateVisitorAPI } from '@/api/visitor';
import type { Package } from '@/api/types';
import MuiPhoneInput from '@/components/MuiPhoneInput';

const LEAD_STATUSES = [
  'Initial Discussion',
  'Payment issue',
  'Blocked',
  'Closed',
];

interface VisitorComment {
  text: string;
  _id?: string;
  createdAt?: string;
}

interface VisitorData {
  _id: string;
  name: string;
  mobile?: string;
  callingCode?: string;
  countryCode?: string;
  leadStatus?: string;
  fallowUpDate?: string;
  packages?: { _id?: string; name: string; price: number; month?: number };
  comments?: VisitorComment[] | null;
}

function formatCommentDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function toDateInputValue(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function EditVisitorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const visitor = (location.state as { visitor?: VisitorData })?.visitor;

  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const [name, setName] = useState(visitor?.name ?? '');
  const [mobile, setMobile] = useState(visitor?.mobile ?? '');
  const [callingCode, setCallingCode] = useState(visitor?.callingCode ?? '');
  const [countryCode, setCountryCode] = useState(visitor?.countryCode ?? '');
  const [packageId, setPackageId] = useState(visitor?.packages?._id ?? '');
  const [leadStatus, setLeadStatus] = useState(visitor?.leadStatus ?? LEAD_STATUSES[0]!);
  const [followUpDate, setFollowUpDate] = useState(toDateInputValue(visitor?.fallowUpDate));
  const [newComment, setNewComment] = useState('');

  const oldComments: VisitorComment[] = visitor?.comments ?? [];

  const fetchPackages = useCallback(async () => {
    try {
      const res = await getAllPackagesAPI();
      const pkgs = res.data ?? [];
      setPackages(pkgs);
      if (!packageId && pkgs.length > 0) setPackageId(pkgs[0]!._id);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!visitor) {
      navigate('/visitors', { replace: true });
      return;
    }
    fetchPackages();
  }, [fetchPackages, visitor, navigate]);

  const selectedPackage = packages.find((p) => p._id === packageId);

  const initialPhone = visitor?.mobile
    ? `+${visitor.callingCode ?? '91'}${visitor.mobile}`
    : undefined;

  const handleSave = async () => {
    if (!visitor) return;
    if (!name.trim()) {
      setToast({ message: 'Name is required', severity: 'error' });
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        _id: visitor._id,
        name: name.trim(),
        leadStatus,
        mobile,
        callingCode,
        countryCode,
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

      if (newComment.trim()) {
        body.comments = { text: newComment.trim() };
      }

      await updateVisitorAPI(body);
      setToast({ message: 'Enquiry updated', severity: 'success' });
      setTimeout(() => navigate('/visitors'), 500);
    } catch {
      setToast({ message: 'Failed to update enquiry', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (!visitor) return null;

  if (loading) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <Skeleton variant="rounded" height={40} width={150} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={300} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button startIcon={<BackIcon />} onClick={() => navigate('/visitors')}>
            Back
          </Button>
          <Divider orientation="vertical" flexItem />
          <Typography variant="h5" fontWeight={700}>
            Edit Enquiry
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={saving}
          onClick={handleSave}
          size="large"
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </Box>

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
                    initialPhone={initialPhone}
                    defaultCountry={(countryCode || 'IN').toLowerCase() as 'in'}
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
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Old Comments */}
        {oldComments.length > 0 && (
          <Grid size={12}>
            <Card>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                  Previous Discussion Notes
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {oldComments.map((c, i) => (
                    <Box
                      key={c._id ?? i}
                      sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}
                    >
                      <Typography variant="body2">{c.text}</Typography>
                      {c.createdAt && (
                        <Typography variant="caption" color="text.secondary">
                          {formatCommentDate(c.createdAt)}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* New Comment */}
        <Grid size={12}>
          <Card>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2.5}>
                Add Discussion Note
              </Typography>
              <TextField
                label="Discussion Notes"
                fullWidth
                multiline
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom save — visible on smaller screens */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'flex-end', gap: 1, mt: 2 }}>
        <Button onClick={() => navigate('/visitors')}>Cancel</Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </Box>

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
