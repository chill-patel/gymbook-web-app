import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  Skeleton,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Login as PunchInIcon,
  Logout as PunchOutIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { getAllUserAttendanceReportAPI } from '@/api/member';
import { Colors, Layout } from '@/theme';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import StripedCard from '@/components/StripedCard';
import StatusChip from '@/components/StatusChip';

interface AttendanceItem {
  date: string;
  punchInAt?: string;
  punchOutAt?: string;
  memberName?: string;
  isActive?: boolean;
  memberId?: string;
}

function formatTime(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDisplayDate(d: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function AttendanceReportPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [records, setRecords] = useState<AttendanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'expired'>('all');

  const fetchData = useCallback(async (date: Date) => {
    setFetching(true);
    try {
      const ts = date.getTime();
      const res = await getAllUserAttendanceReportAPI({ startDate: ts, endDate: ts });
      const data = (res as any)?.data;
      const list: AttendanceItem[] = Array.isArray(data) ? data : [];
      setRecords(list);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchData(currentDate);
  }, [currentDate, fetchData]);

  const goToPrev = () => {
    setCurrentDate((d) => {
      const prev = new Date(d);
      prev.setDate(prev.getDate() - 1);
      return prev;
    });
  };

  const goToNext = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setCurrentDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      if (next > tomorrow) return d;
      return next;
    });
  };

  const isToday = currentDate.toDateString() === new Date().toDateString();

  const activeCount = records.filter((r) => r.isActive === true).length;
  const expiredCount = records.length - activeCount;

  const filtered = records.filter((r) => {
    if (search && !(r.memberName ?? '').toLowerCase().includes(search.toLowerCase())) return false;
    if (filterTab === 'active' && r.isActive !== true) return false;
    if (filterTab === 'expired' && r.isActive === true) return false;
    return true;
  });

  return (
    <Box sx={{ maxWidth: Layout.pageMaxWidth, mx: 'auto' }}>
      <PageHeader title="Attendance Report" backPath={true} />

      {/* Day navigation */}
      <Card sx={{ mb: 2 }}>
        <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <IconButton onClick={goToPrev}>
            <PrevIcon />
          </IconButton>
          <Typography variant="body1" fontWeight={600} sx={{ minWidth: 220, textAlign: 'center', color: Colors.primary }}>
            {formatDisplayDate(currentDate)}
          </Typography>
          <IconButton onClick={goToNext} disabled={isToday}>
            <NextIcon />
          </IconButton>
        </Box>
        {fetching && <LinearProgress sx={{ height: 2 }} />}
      </Card>

      {/* Search + filter tabs */}
      <Card sx={{ mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search by name..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                ...(search && {
                  endAdornment: (
                    <InputAdornment position="end">
                      <CloseIcon
                        fontSize="small"
                        sx={{ cursor: 'pointer', color: 'text.disabled' }}
                        onClick={() => setSearch('')}
                      />
                    </InputAdornment>
                  ),
                }),
              },
            }}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <Box sx={{ display: 'flex', gap: 0.75 }}>
            <Chip
              label={`All (${records.length})`}
              variant={filterTab === 'all' ? 'filled' : 'outlined'}
              color={filterTab === 'all' ? 'primary' : 'default'}
              onClick={() => setFilterTab('all')}
              size="small"
            />
            <Chip
              label={`Active (${activeCount})`}
              variant={filterTab === 'active' ? 'filled' : 'outlined'}
              color={filterTab === 'active' ? 'success' : 'default'}
              onClick={() => setFilterTab('active')}
              size="small"
            />
            <Chip
              label={`Expired (${expiredCount})`}
              variant={filterTab === 'expired' ? 'filled' : 'outlined'}
              color={filterTab === 'expired' ? 'error' : 'default'}
              onClick={() => setFilterTab('expired')}
              size="small"
            />
          </Box>
        </Box>
      </Card>

      {/* Summary */}
      <Card sx={{ mb: 3, bgcolor: `${Colors.primary}08`, borderLeft: `4px solid ${Colors.primary}` }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Total</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: Colors.primary }}>{records.length}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Active</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: Colors.status.active }}>{activeCount}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Expired</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: Colors.status.expired }}>{expiredCount}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Attendance list */}
      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rounded" height={90} />
            </Grid>
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <EmptyState title={records.length === 0 ? 'No attendance records for this date.' : 'No matching records found.'} />
      ) : (
        <Grid container spacing={2}>
          {filtered.map((rec, idx) => (
            <Grid key={rec.memberId ?? idx} size={{ xs: 12, sm: 6, md: 4 }}>
              <StripedCard stripeColor={rec.isActive ? Colors.status.active : Colors.status.expired}>
                  <CardActionArea
                    onClick={() => rec.memberId && navigate(`/members/${rec.memberId}`)}
                    sx={{ height: '100%' }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body1" fontWeight={600} noWrap sx={{ flex: 1 }}>
                          {rec.memberName ?? '—'}
                        </Typography>
                        <StatusChip label={rec.isActive ? 'Active' : 'Expired'} color={rec.isActive ? Colors.status.active : Colors.status.expired} />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PunchInIcon sx={{ fontSize: 16, color: Colors.status.active }} />
                          <Typography variant="body2" fontWeight={600}>{formatTime(rec.punchInAt)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PunchOutIcon sx={{ fontSize: 16, color: '#FF9800' }} />
                          <Typography variant="body2" fontWeight={600}>{formatTime(rec.punchOutAt)}</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>
              </StripedCard>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
