import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  CalendarMonth as DateIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { getExpensesAPI, getExpenseCategoriesAPI, deleteExpenseAPI } from '@/api/expense';
import { Colors, Layout } from '@/theme';
import { formatDate } from '@/utils/format';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import StatusChip from '@/components/StatusChip';
import StripedCard from '@/components/StripedCard';
import FilterToolbar from '@/components/FilterToolbar';

interface Expense {
  _id: string;
  category: string;
  desc: string;
  amount: number;
  expenseDate: string;
  createdAt?: string;
  updatedAt?: string;
}

const categoryColorMap: Record<string, string> = {
  'Rent/Mortgage': '#5C6BC0',
  'Payroll/Salary': '#26A69A',
  'Utilities': '#FFA726',
  'Equipment': '#42A5F5',
  'Marketing Expenses': '#EC407A',
  'Insurance': '#AB47BC',
  'Maintenance': '#8D6E63',
  'Supplies': '#66BB6A',
};

function getCategoryColor(category: string): string {
  return categoryColorMap[category] ?? '#78909C';
}

export default function ExpenseListPage() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getExpenseCategoriesAPI();
      const data = (res as any)?.data;
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      // silently fail
    }
  }, []);

  const fetchExpenses = useCallback(async (category: string, sd: string, ed: string) => {
    setFetching(true);
    try {
      const res = await getExpensesAPI({
        startIndex: 0,
        category: category || undefined,
        startDate: sd ? new Date(sd).getTime() : undefined,
        endDate: ed ? new Date(`${ed}T23:59:59`).getTime() : undefined,
      });
      const data = (res as any)?.data;
      setExpenses(Array.isArray(data) ? data : []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchExpenses(selectedCategory, startDate, endDate);
  }, [selectedCategory, startDate, endDate, fetchExpenses]);

  const handleDelete = async (expense: Expense) => {
    if (!confirm(`Delete expense "${expense.desc}"?`)) return;
    try {
      await deleteExpenseAPI(expense._id);
      setExpenses((prev) => prev.filter((e) => e._id !== expense._id));
      setToast({ message: 'Expense deleted', severity: 'success' });
    } catch {
      setToast({ message: 'Failed to delete', severity: 'error' });
    }
  };

  return (
    <Box sx={{ maxWidth: Layout.pageMaxWidth, mx: 'auto' }}>
      <PageHeader
        title="Expenses"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/expenses/add', { state: { categories } })}>
            Add Expense
          </Button>
        }
      />

      <FilterToolbar loading={fetching}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="From Date"
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="To Date"
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          {(startDate || endDate) && (
            <Button size="small" onClick={() => { setStartDate(''); setEndDate(''); }}>
              Clear Dates
            </Button>
          )}
      </FilterToolbar>

      {/* Summary */}
      <Card sx={{ mb: 3, bgcolor: Colors.secondary, color: '#fff' }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body1" fontWeight={500} color="inherit">
            Total Expenses
          </Typography>
          <Typography variant="h5" fontWeight={700} color="inherit">
            ₹{total.toLocaleString()}
          </Typography>
        </CardContent>
      </Card>

      {/* Expense list */}
      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rounded" height={140} />
            </Grid>
          ))}
        </Grid>
      ) : expenses.length === 0 && !fetching ? (
        <EmptyState
          title="No expenses found"
          description={selectedCategory || startDate || endDate ? 'Try adjusting your filters' : 'No expenses recorded yet'}
        />
      ) : (
        <Grid
          container
          spacing={2}
          sx={{ opacity: fetching ? 0.5 : 1, transition: 'opacity 0.15s ease' }}
        >
          {expenses.map((e) => {
            const catColor = getCategoryColor(e.category);
            return (
              <Grid key={e._id} size={{ xs: 12, sm: 6, md: 4 }}>
                <StripedCard stripeColor={catColor}>
                    <CardContent sx={{ flex: 1, p: 2, '&:last-child': { pb: 1.5 } }}>
                      {/* Header: desc + amount */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="body1" fontWeight={600} sx={{ flex: 1 }} noWrap>
                          {e.desc}
                        </Typography>
                        <Typography variant="body1" fontWeight={700} sx={{ color: Colors.financial.due, ml: 1, whiteSpace: 'nowrap' }}>
                          ₹{e.amount.toLocaleString()}
                        </Typography>
                      </Box>

                      {/* Details */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <CategoryIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                          <StatusChip label={e.category} color={catColor} />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <DateIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(e.expenseDate)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 1, py: 0.5, gap: 0.5, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => navigate('/expenses/edit', { state: { expense: e, categories } })}
                          sx={{ color: 'text.secondary' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(e)} sx={{ color: Colors.financial.due }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                </StripedCard>
              </Grid>
            );
          })}
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
