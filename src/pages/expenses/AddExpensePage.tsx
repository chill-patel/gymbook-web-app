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
import { addExpenseAPI, getExpenseCategoriesAPI } from '@/api/expense';

export default function AddExpensePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const passedCategories = (location.state as { categories?: string[] })?.categories;

  const [categories, setCategories] = useState<string[]>(passedCategories ?? []);
  const [loading, setLoading] = useState(!passedCategories?.length);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const [category, setCategory] = useState('');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0] ?? '');

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getExpenseCategoriesAPI();
      const data = (res as any)?.data;
      const cats = Array.isArray(data) ? data : [];
      setCategories(cats);
      if (cats.length > 0 && !category) setCategory(cats[0]!);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (passedCategories?.length) {
      setCategory(passedCategories[0]!);
      setLoading(false);
    } else {
      fetchCategories();
    }
  }, [fetchCategories]);

  const handleSave = async () => {
    if (!category) {
      setToast({ message: 'Category is required', severity: 'error' });
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setToast({ message: 'Amount is required', severity: 'error' });
      return;
    }

    setSaving(true);
    try {
      await addExpenseAPI({
        category,
        desc: desc.trim(),
        amount: Number(amount),
        expenseDate: new Date(expenseDate).toISOString(),
      });
      setToast({ message: 'Expense added', severity: 'success' });
      setTimeout(() => navigate('/expenses'), 500);
    } catch {
      setToast({ message: 'Failed to add expense', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ maxWidth: 700, mx: 'auto' }}>
        <Skeleton variant="rounded" height={40} width={150} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={300} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button startIcon={<BackIcon />} onClick={() => navigate('/expenses')}>
            Back
          </Button>
          <Divider orientation="vertical" flexItem />
          <Typography variant="h5" fontWeight={700}>
            Add Expense
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

      <Card>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Category *</InputLabel>
                <Select
                  value={category}
                  label="Category *"
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Amount *"
                fullWidth
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Date"
                fullWidth
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Description"
                fullWidth
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
