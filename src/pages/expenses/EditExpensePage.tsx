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
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Save as SaveIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router';
import { editExpenseAPI, getExpenseCategoriesAPI } from '@/api/expense';
import PageHeader from '@/components/PageHeader';
import { Layout } from '@/theme';

interface ExpenseData {
  _id: string;
  category: string;
  desc: string;
  amount: number;
  expenseDate: string;
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

export default function EditExpensePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { expense?: ExpenseData; categories?: string[] } | null;
  const expense = state?.expense;
  const passedCategories = state?.categories;

  const [categories, setCategories] = useState<string[]>(passedCategories ?? []);
  const [loading, setLoading] = useState(!passedCategories?.length);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const [category, setCategory] = useState(expense?.category ?? '');
  const [desc, setDesc] = useState(expense?.desc ?? '');
  const [amount, setAmount] = useState(expense?.amount?.toString() ?? '');
  const [expenseDate, setExpenseDate] = useState(toDateInputValue(expense?.expenseDate));

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getExpenseCategoriesAPI();
      const data = (res as any)?.data;
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!expense) {
      navigate('/expenses', { replace: true });
      return;
    }
    if (!passedCategories?.length) {
      fetchCategories();
    } else {
      setLoading(false);
    }
  }, [fetchCategories, expense, navigate]);

  const handleSave = async () => {
    if (!expense) return;
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
      await editExpenseAPI(expense._id, {
        category,
        desc: desc.trim(),
        amount: Number(amount),
        expenseDate: new Date(expenseDate).toISOString(),
      });
      setToast({ message: 'Expense updated', severity: 'success' });
      setTimeout(() => navigate('/expenses'), 500);
    } catch {
      setToast({ message: 'Failed to update expense', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (!expense) return null;

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
        title="Edit Expense"
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
