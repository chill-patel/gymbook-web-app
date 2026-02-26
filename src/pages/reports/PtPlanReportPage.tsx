import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Divider,
  LinearProgress,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import Grid from '@mui/material/Grid2';
import { useNavigate, useSearchParams } from 'react-router';
import { ptPlanReportAPI } from '@/api/member';
import { getInitialDateRange, toInputDate, fromInputDate } from '@/config/dashboardFilter';
import { Colors } from '@/theme';

interface PtPlan {
  _id: string;
  name: string;
  purchaseDate?: string;
  expiryDate?: string;
  totalAmount?: number;
  paid?: number;
  pendingAmount?: number;
}

interface PtPlanMember {
  _id: string;
  name: string;
  mobile?: string;
  callingCode?: string;
  ptPlans: PtPlan;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatMobile(mobile?: string, callingCode?: string): string {
  if (!mobile) return '';
  const code = callingCode ? `+${callingCode} ` : '';
  return `${code}${mobile}`;
}

export default function PtPlanReportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const context = searchParams.get('context') ?? '';
  const { startDate: initStart, endDate: initEnd } = getInitialDateRange(context);

  const [startDate, setStartDate] = useState<number | undefined>(initStart);
  const [endDate, setEndDate] = useState<number | undefined>(initEnd);
  const [members, setMembers] = useState<PtPlanMember[]>([]);
  const [dueAmount, setDueAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const fetchData = useCallback(async (sd: number | undefined, ed: number | undefined) => {
    setFetching(true);
    try {
      const res = await ptPlanReportAPI({ totalItemCount: 0, startDate: sd, endDate: ed });
      const data = (res as any)?.data;
      setDueAmount(data?.dueAmount ?? 0);
      setMembers(Array.isArray(data?.planList) ? data.planList : []);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchData(startDate, endDate);
  }, [startDate, endDate, fetchData]);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} size="small">
          Back
        </Button>
        <Typography variant="h5" fontWeight={700}>
          PT Plan Due Report
        </Typography>
      </Box>

      {/* Date filters */}
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
        </Box>
        {fetching && <LinearProgress sx={{ height: 2 }} />}
      </Card>

      {/* Summary bar */}
      <Card sx={{ mb: 3, bgcolor: Colors.secondary, color: '#fff' }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body1" fontWeight={500} color="inherit">
            PT Due Amount
          </Typography>
          <Typography variant="h5" fontWeight={700} color="inherit">
            ₹{dueAmount.toLocaleString()}
          </Typography>
        </CardContent>
      </Card>

      {/* Member list */}
      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rounded" height={180} />
            </Grid>
          ))}
        </Grid>
      ) : members.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary">No PT plan dues found.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {members.map((member) => {
            const pt = member.ptPlans;
            const mobile = formatMobile(member.mobile, member.callingCode);

            return (
              <Grid key={member._id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{ display: 'flex', overflow: 'hidden', height: '100%' }}>
                  <Box sx={{ width: 4, bgcolor: Colors.financial.due, flexShrink: 0 }} />
                  <Box sx={{ flex: 1 }}>
                    <CardActionArea
                      onClick={() => navigate(`/members/${member._id}`)}
                      sx={{ height: '100%' }}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        {/* Header */}
                        <Typography variant="body1" fontWeight={600} noWrap mb={0.5}>
                          {member.name}
                        </Typography>
                        {mobile && (
                          <Typography variant="body2" color="text.secondary" mb={1}>
                            {mobile}
                          </Typography>
                        )}

                        {/* Plan info */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
                          <Detail label="Plan" value={pt.name} />
                          <Detail label="Purchase" value={formatDate(pt.purchaseDate)} />
                          <Detail label="Expiry" value={formatDate(pt.expiryDate)} />
                        </Box>

                        <Divider sx={{ mb: 1.5 }} />

                        {/* Financials */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                          <Detail label="Total" value={`₹${(pt.totalAmount ?? 0).toLocaleString()}`} />
                          <Detail
                            label="Due"
                            value={`₹${(pt.pendingAmount ?? 0).toLocaleString()}`}
                            color={Colors.financial.due}
                          />
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Box>
                </Card>
              </Grid>
            );
          })}
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
