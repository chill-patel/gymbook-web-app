import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Divider,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useNavigate, useSearchParams } from 'react-router';
import { admissionReportAPI } from '@/api/member';
import { getInitialDateRange, toInputDate, fromInputDate } from '@/config/dashboardFilter';
import { Colors, Layout } from '@/theme';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import StripedCard from '@/components/StripedCard';
import FilterToolbar from '@/components/FilterToolbar';
import { formatDate } from '@/utils/format';

interface AdmissionPackage {
  _id: string;
  name: string;
  purchaseDate?: string;
  expiryDate?: string;
  admissionFees?: number;
  totalAmount?: number;
  paid?: number;
  pendingAmount?: number;
}

interface AdmissionMember {
  _id: string;
  name: string;
  mobile?: string;
  callingCode?: string;
  packages: AdmissionPackage;
}

function formatMobile(mobile?: string, callingCode?: string): string {
  if (!mobile) return '';
  const code = callingCode ? `+${callingCode} ` : '';
  return `${code}${mobile}`;
}

export default function AdmissionReportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const context = searchParams.get('context') ?? '';
  const { startDate: initStart, endDate: initEnd } = getInitialDateRange(context);

  const [startDate, setStartDate] = useState<number | undefined>(initStart);
  const [endDate, setEndDate] = useState<number | undefined>(initEnd);
  const [members, setMembers] = useState<AdmissionMember[]>([]);
  const [totalFees, setTotalFees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const fetchData = useCallback(async (sd: number | undefined, ed: number | undefined) => {
    setFetching(true);
    try {
      const res = await admissionReportAPI({ totalItemCount: 0, startDate: sd, endDate: ed });
      const data = (res as any)?.data;
      setTotalFees(data?.admissionFees ?? 0);
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
    <Box sx={{ maxWidth: Layout.pageMaxWidth, mx: 'auto' }}>
      <PageHeader title="Admission Report" backPath={true} />

      {/* Date filters */}
      <FilterToolbar loading={fetching}>
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
      </FilterToolbar>

      {/* Summary bar */}
      <Card sx={{ mb: 3, bgcolor: Colors.secondary, color: '#fff' }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body1" fontWeight={500} color="inherit">
            Admission Fees
          </Typography>
          <Typography variant="h5" fontWeight={700} color="inherit">
            ₹{totalFees.toLocaleString()}
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
        <EmptyState title="No admission records found" />
      ) : (
        <Grid container spacing={2}>
          {members.map((member) => {
            const pkg = member.packages;
            const mobile = formatMobile(member.mobile, member.callingCode);

            return (
              <Grid key={member._id} size={{ xs: 12, sm: 6, md: 4 }}>
                <StripedCard stripeColor={Colors.primary}>
                    <CardActionArea
                      onClick={() => navigate(`/members/${member._id}`)}
                      sx={{ height: '100%' }}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        {/* Header: name */}
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
                          <Detail label="Plan" value={pkg.name} />
                          <Detail label="Purchase" value={formatDate(pkg.purchaseDate)} />
                          <Detail label="Expiry" value={formatDate(pkg.expiryDate)} />
                        </Box>

                        <Divider sx={{ mb: 1.5 }} />

                        {/* Financials */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                          {pkg.admissionFees != null && (
                            <Detail
                              label="Admission Fee"
                              value={`₹${pkg.admissionFees.toLocaleString()}`}
                              color={Colors.primary}
                            />
                          )}
                          <Detail label="Total" value={`₹${(pkg.totalAmount ?? 0).toLocaleString()}`} />
                          <Detail
                            label="Paid"
                            value={`₹${(pkg.paid ?? 0).toLocaleString()}`}
                            color={Colors.status.active}
                          />
                          <Detail
                            label="Due"
                            value={`₹${(pkg.pendingAmount ?? 0).toLocaleString()}`}
                            color={(pkg.pendingAmount ?? 0) > 0 ? Colors.financial.due : Colors.financial.paid}
                          />
                        </Box>
                      </CardContent>
                    </CardActionArea>
                </StripedCard>
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
