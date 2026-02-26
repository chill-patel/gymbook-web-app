import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  AttachMoney as SalesIcon,
  AccountBalanceWallet as DueIcon,
  FitnessCenter as PtIcon,
  PersonAdd as AdmissionIcon,
  Fingerprint as AttendanceIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getMemberTrendsAPI } from '@/api/member';
import { Colors } from '@/theme';

const reportCards = [
  { label: 'Sales Report', description: 'Collection & payment invoices', icon: <SalesIcon />, path: '/reports/sales' },
  { label: 'Plan Due Report', description: 'Outstanding plan dues', icon: <DueIcon />, path: '/reports/plan-due' },
  { label: 'PT Plan Due Report', description: 'Personal training plan dues', icon: <PtIcon />, path: '/reports/pt-plan-due' },
  { label: 'Admission Report', description: 'Admission fee collection', icon: <AdmissionIcon />, path: '/reports/admission' },
  { label: 'Attendance Report', description: 'Daily punch-in/out records', icon: <AttendanceIcon />, path: '/reports/attendance' },
];

const TIME_PERIODS = [
  { value: 'week', label: 'Week' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'sixmonth', label: '6 Months' },
  { value: 'year', label: 'Year' },
];

interface TrendAxis {
  label: string;
  value: number;
}

interface TrendData {
  xAxis: TrendAxis[];
  numIntervals: number;
}

interface TrendsResponse {
  collected_payment: TrendData;
  member_registration: TrendData;
}

const EMPTY_TREND: TrendData = { xAxis: [], numIntervals: 1 };

function TrendChart({
  title,
  data,
  barColor,
  isCurrency,
}: {
  title: string;
  data: TrendData;
  barColor: string;
  isCurrency: boolean;
}) {
  const chartData = data.xAxis.map((item) => ({
    name: item.label,
    value: item.value,
  }));

  return (
    <Card sx={{ p: 2.5 }}>
      <Typography variant="body1" fontWeight={600} mb={2} textAlign="center">
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(15, 23, 42, 0.12)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(15, 23, 42, 0.12)' }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tickFormatter={(v: number) => (isCurrency ? `₹${v.toLocaleString()}` : String(v))}
          />
          <Tooltip
            formatter={(v: number) => [
              isCurrency ? `₹${v.toLocaleString()}` : v,
              isCurrency ? 'Collection' : 'Members',
            ]}
            contentStyle={{ borderRadius: 8, fontSize: 13 }}
          />
          <Bar dataKey="value" fill={barColor} radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export default function ReportsPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('week');
  const [trends, setTrends] = useState<TrendsResponse | null>(null);
  const [loadingTrends, setLoadingTrends] = useState(true);

  const fetchTrends = useCallback(async (timePeriod: string) => {
    setLoadingTrends(true);
    try {
      const res = await getMemberTrendsAPI(timePeriod);
      const data = (res as any)?.data;
      setTrends({
        collected_payment: data?.collected_payment ?? EMPTY_TREND,
        member_registration: data?.member_registration ?? EMPTY_TREND,
      });
    } catch {
      // fail silently
    } finally {
      setLoadingTrends(false);
    }
  }, []);

  useEffect(() => {
    fetchTrends(period);
  }, [period, fetchTrends]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Reports
      </Typography>

      {/* Report cards grid */}
      <Grid container spacing={2} mb={4}>
        {reportCards.map((card) => (
          <Grid key={card.path} size={{ xs: 6, sm: 4, md: 2.4 }}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea onClick={() => navigate(card.path)} sx={{ height: '100%' }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ color: Colors.primary, opacity: 0.7, mb: 1 }}>{card.icon}</Box>
                  <Typography variant="body2" fontWeight={600}>
                    {card.label}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Trends section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Trends
        </Typography>
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={(_, v) => v && setPeriod(v)}
          size="small"
        >
          {TIME_PERIODS.map((tp) => (
            <ToggleButton key={tp.value} value={tp.value} sx={{ px: 2, textTransform: 'none', fontSize: 13 }}>
              {tp.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {loadingTrends ? (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rounded" height={320} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rounded" height={320} />
          </Grid>
        </Grid>
      ) : trends ? (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TrendChart
              title="Collected Payment"
              data={trends.collected_payment}
              barColor="#A6D9A6"
              isCurrency
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TrendChart
              title="New Member Registration"
              data={trends.member_registration}
              barColor="#80B2B2"
              isCurrency={false}
            />
          </Grid>
        </Grid>
      ) : null}
    </Box>
  );
}
