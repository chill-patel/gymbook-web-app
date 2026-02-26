import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router';
import { addStaffAPI } from '@/api/gym';
import MuiPhoneInput from '@/components/MuiPhoneInput';
import PageHeader from '@/components/PageHeader';
import { Layout } from '@/theme';

const PERMISSIONS = [
  { value: 'ALL', label: 'Allow All Access' },
  { value: 'GET', label: 'Allow View anything' },
  { value: 'ADD', label: 'Allow Add anything' },
  { value: 'EDIT', label: 'Allow Edit anything' },
  { value: 'DELETE', label: 'Allow Delete anything' },
  { value: 'COLLECTION', label: 'View Collection Report' },
];

const ALL_INDIVIDUAL = ['ADD', 'EDIT', 'DELETE', 'GET', 'COLLECTION'];

export default function AddStaffPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [callingCode, setCallingCode] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [password, setPassword] = useState('');
  const [permission, setPermission] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const handlePermissionToggle = (perm: string) => {
    setPermission((prev) => {
      let updated = [...prev];
      if (updated.includes(perm)) {
        updated = updated.filter((p) => p !== perm);
        if (perm === 'ALL') updated = [];
        else updated = updated.filter((p) => p !== 'ALL');
      } else {
        updated.push(perm);
        if (perm === 'ALL') {
          updated = ['ALL', ...ALL_INDIVIDUAL];
        } else if (ALL_INDIVIDUAL.every((p) => updated.includes(p))) {
          updated = ['ALL', ...ALL_INDIVIDUAL];
        }
      }
      return updated;
    });
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setToast({ message: 'Name, email, and password are required', severity: 'error' });
      return;
    }

    setSaving(true);
    try {
      await addStaffAPI({
        name: name.trim(),
        email: email.trim(),
        password,
        permission,
        ...(mobile && { mobile, callingCode, countryCode }),
      });
      navigate('/gym/staff');
    } catch {
      setToast({ message: 'Failed to add staff member', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: Layout.pageMaxWidthNarrow, mx: 'auto' }}>
      <PageHeader title="Add Staff" backPath={true} />

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="body1" fontWeight={600} mb={2}>
            Staff Details
          </Typography>

          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />

          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            type="email"
            sx={{ mb: 2 }}
          />

          <MuiPhoneInput
            label="Mobile"
            onPhoneChange={(data) => {
              setMobile(data.nationalNumber);
              setCallingCode(data.callingCode);
              setCountryCode(data.countryCode);
            }}
          />

          <TextField
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            type="password"
            sx={{ mt: 2 }}
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="body1" fontWeight={600} mb={1}>
            Permissions
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Select what this staff member can do
          </Typography>

          {PERMISSIONS.map((perm) => (
            <FormControlLabel
              key={perm.value}
              control={
                <Checkbox
                  checked={permission.includes(perm.value)}
                  onChange={() => handlePermissionToggle(perm.value)}
                  color="primary"
                />
              }
              label={perm.label}
              sx={{ display: 'flex', mb: 0 }}
            />
          ))}
        </CardContent>
      </Card>

      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={handleSave}
        disabled={saving}
        sx={{ fontWeight: 600 }}
      >
        {saving ? 'Saving...' : 'Save'}
      </Button>

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
