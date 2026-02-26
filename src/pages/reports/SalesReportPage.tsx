import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import Grid from '@mui/material/Grid2';
import { useNavigate, useSearchParams } from 'react-router';
import { salesReportAPI } from '@/api/member';
import {
  getInitialDateRange,
  toInputDate,
  fromInputDate,
  SUPPORTED_PAYMENT_METHODS,
  PLAN_TYPE_FILTERS,
} from '@/config/dashboardFilter';
import { Colors } from '@/theme';

interface InvoiceItem {
  _id: string;
  invoiceNumber?: string;
  memberName?: string;
  memberId?: string;
  planName?: string;
  planType?: string;
  paymentDate?: string;
  paidAmount?: number;
  pendingAmount?: number;
  totalAmount?: number;
  paymentMethod?: string;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function SalesReportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const context = searchParams.get('context') ?? '';
  const { startDate: initStart, endDate: initEnd } = getInitialDateRange(context);

  const [startDate, setStartDate] = useState<number | undefined>(initStart);
  const [endDate, setEndDate] = useState<number | undefined>(initEnd);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [planType, setPlanType] = useState('');
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const fetchData = useCallback(
    async (sd: number | undefined, ed: number | undefined, pm: string, pt: string) => {
      setFetching(true);
      try {
        const res = await salesReportAPI({
          totalItemCount: 0,
          startDate: sd,
          endDate: ed,
          paymentMethod: pm || undefined,
          planType: pt || undefined,
        });
        const data = (res as any)?.data;
        setPaidAmount(data?.paidAmount ?? 0);
        setInvoices(Array.isArray(data?.invoiceList) ? data.invoiceList : []);
      } catch {
        // fail silently
      } finally {
        setLoading(false);
        setFetching(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchData(startDate, endDate, paymentMethod, planType);
  }, [startDate, endDate, paymentMethod, planType, fetchData]);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} size="small">
          Back
        </Button>
        <Typography variant="h5" fontWeight={700}>
          Sales Report
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Start Date"
            type="date"
            size="small"
            value={toInputDate(startDate)}
            onChange={(e) => setStartDate(fromInputDate(e.target.value, false))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="End Date"
            type="date"
            size="small"
            value={toInputDate(endDate)}
            onChange={(e) => setEndDate(fromInputDate(e.target.value, true))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              label="Payment Method"
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {SUPPORTED_PAYMENT_METHODS.map((m) => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Plan Type</InputLabel>
            <Select
              value={planType}
              label="Plan Type"
              onChange={(e) => setPlanType(e.target.value)}
            >
              {PLAN_TYPE_FILTERS.map((p) => (
                <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {fetching && <LinearProgress sx={{ height: 2 }} />}
      </Card>

      {/* Summary bar */}
      <Card sx={{ mb: 3, bgcolor: Colors.secondary, color: '#fff' }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body1" fontWeight={500} color="inherit">
            Collection
          </Typography>
          <Typography variant="h5" fontWeight={700} color="inherit">
            ₹{paidAmount.toLocaleString()}
          </Typography>
        </CardContent>
      </Card>

      {/* Invoice list */}
      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rounded" height={160} />
            </Grid>
          ))}
        </Grid>
      ) : invoices.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary">No invoices found for the selected filters.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {invoices.map((inv) => (
            <Grid key={inv._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ display: 'flex', overflow: 'hidden', height: '100%' }}>
                <Box sx={{ width: 4, bgcolor: Colors.status.active, flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <CardActionArea
                    onClick={() => inv.memberId && navigate(`/members/${inv.memberId}`)}
                    sx={{ height: '100%' }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      {/* Invoice header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {inv.invoiceNumber}
                        </Typography>
                        {inv.paymentMethod && (
                          <Chip label={inv.paymentMethod} size="small" sx={{ fontSize: 11, height: 22 }} />
                        )}
                      </Box>

                      {/* Member name + date */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="body1" fontWeight={600} noWrap sx={{ flex: 1, mr: 1 }}>
                          {inv.memberName ?? '—'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" flexShrink={0}>
                          {formatDate(inv.paymentDate)}
                        </Typography>
                      </Box>

                      {/* Details grid */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                        <Detail label="Plan" value={inv.planName ?? '—'} />
                        <Detail
                          label="Paid"
                          value={`₹${(inv.paidAmount ?? 0).toLocaleString()}`}
                          color={Colors.status.active}
                        />
                        <Detail
                          label="Remaining"
                          value={`₹${(inv.pendingAmount ?? 0).toLocaleString()}`}
                          color={(inv.pendingAmount ?? 0) > 0 ? Colors.financial.due : Colors.financial.paid}
                        />
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

function Detail({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={600} sx={color ? { color } : undefined}>{value}</Typography>
    </Box>
  );
}
