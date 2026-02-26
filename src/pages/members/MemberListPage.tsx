import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
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
  Search as SearchIcon,
  Add as AddIcon,
  Phone as PhoneIcon,
  Event as EventIcon,
  CurrencyRupee as RupeeIcon,
  Badge as IdIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  WhatsApp as WhatsAppIcon,
  FingerprintOutlined as AttendanceIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router';
import { getAllMembersAPI, punchInOutAPI } from '@/api/member';
import { getAllPackagesAPI, getAllBatchesAPI } from '@/api/gym';
import type { Member, Package, Batch } from '@/api/types';

const PAGE_SIZE = 40;

const MEMBER_CONTEXTS = [
  { id: '', label: 'All Members' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
  { id: 'notPaid', label: 'Unpaid' },
  { id: 'paid', label: 'Paid' },
  { id: 'membershipExpireInOneToThreeDays', label: 'Expiring 1-3 Days' },
  { id: 'membershipExpireInFourtoSevenDays', label: 'Expiring 4-7 Days' },
  { id: 'membershipExpireInSevenToFifteenDays', label: 'Expiring 8-15 Days' },
  { id: 'memberTodayBirthday', label: 'Birthday Today' },
  { id: 'getBlockUser', label: 'Blocked' },
];

const ORDER_OPTIONS = [
  { id: 'createdAt', label: 'Newest' },
  { id: 'pendingAmount', label: 'Pending Amount' },
  { id: 'membershipExpiryDate', label: 'Expiry Date' },
  { id: 'membershipCreatedDate', label: 'Membership Date' },
  { id: 'updatedAt', label: 'Updated' },
];

const GENDER_OPTIONS = [
  { id: '', label: 'All Genders' },
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
];

function getStripColor(membershipExpiryDate?: string): string {
  if (!membershipExpiryDate) return '#E0E0E0';
  const now = Date.now();
  const expiry = new Date(membershipExpiryDate).getTime();
  if (now > expiry) return '#E57373';
  if (expiry <= now + 7 * 24 * 60 * 60 * 1000) return '#FFCA28';
  return '#66BB6A';
}

function getStatusLabel(membershipExpiryDate?: string): string {
  if (!membershipExpiryDate) return 'No Plan';
  const now = Date.now();
  const expiry = new Date(membershipExpiryDate).getTime();
  if (now > expiry) return 'Expired';
  if (expiry <= now + 7 * 24 * 60 * 60 * 1000) return 'Expiring Soon';
  return 'Active';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ─── Mobile Member Card ──────────────────────────────────

function MemberCard({ member, onClick, onAttendance }: { member: Member; onClick: () => void; onAttendance: (m: Member) => void }) {
  const stripColor = getStripColor(member.membershipExpiryDate);
  const statusLabel = getStatusLabel(member.membershipExpiryDate);
  const mobile = member.mobile
    ? `${member.callingCode ? `+${member.callingCode}` : ''} ${member.mobile}`
    : '';
  const hasDue = member.pendingAmount != null && Number(member.pendingAmount) > 0;

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (member.mobile) {
      window.open(`tel:${member.callingCode ? `+${member.callingCode}` : ''}${member.mobile}`);
    }
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (member.mobile) {
      const phone = `${member.callingCode ?? '91'}${member.mobile}`;
      window.open(`https://wa.me/${phone}`, '_blank');
    }
  };

  const handleAttendance = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAttendance(member);
  };

  return (
    <Card sx={{ display: 'flex', overflow: 'hidden', height: '100%' }}>
      <Box sx={{ width: 5, bgcolor: stripColor, flexShrink: 0 }} />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <CardActionArea
          onClick={onClick}
          sx={{ flex: 1, display: 'flex', alignItems: 'stretch' }}
        >
          <CardContent sx={{ flex: 1, p: 2.5, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <Avatar
                src={member.photo}
                sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 24, fontWeight: 600 }}
              >
                {member.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body1" fontWeight={600} noWrap>
                  {member.name}
                </Typography>
                {member.membershipId != null && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                    <IdIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.secondary">
                      ID: {member.membershipId}
                    </Typography>
                  </Box>
                )}
              </Box>
              <Chip
                label={statusLabel}
                size="small"
                sx={{
                  bgcolor: `${stripColor}1A`,
                  color: stripColor,
                  fontWeight: 600,
                  fontSize: 11,
                  height: 24,
                }}
              />
            </Box>

            <Divider sx={{ mb: 1.5 }} />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {mobile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <PhoneIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                  <Typography variant="body2" color="text.secondary">{mobile}</Typography>
                </Box>
              )}
              {member.membershipExpiryDate && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <EventIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                  <Typography variant="body2" color="text.secondary">Exp:</Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: stripColor }}>
                    {formatDate(member.membershipExpiryDate)}
                  </Typography>
                </Box>
              )}
              {member.pendingAmount != null && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <RupeeIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                  <Typography variant="body2" color="text.secondary">Due:</Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: hasDue ? '#E57373' : '#81C784' }}>
                    {member.pendingAmount}
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </CardActionArea>

        {/* Quick Actions */}
        <Divider />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 1, py: 0.5, gap: 0.5 }}>
          {member.mobile && (
            <Tooltip title="Call">
              <IconButton size="small" onClick={handleCall} sx={{ color: 'text.secondary' }}>
                <PhoneIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {member.mobile && (
            <Tooltip title="WhatsApp">
              <IconButton size="small" onClick={handleWhatsApp} sx={{ color: '#25D366' }}>
                <WhatsAppIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Mark Attendance">
            <IconButton size="small" onClick={handleAttendance} sx={{ color: 'text.secondary' }}>
              <AttendanceIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────

export default function MemberListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlContext = searchParams.get('context') ?? '';

  const [members, setMembers] = useState<Member[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  // Filters — init from URL context if present
  const [memberContext, setMemberContext] = useState(urlContext);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [gender, setGender] = useState('');
  const [packageName, setPackageName] = useState('');
  const [batchId, setBatchId] = useState('');

  // Filter data
  const [packages, setPackages] = useState<Package[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  useEffect(() => {
    Promise.all([
      getAllPackagesAPI().catch(() => ({ data: [] })),
      getAllBatchesAPI().catch(() => ({ data: [] })),
    ]).then(([pkgRes, batchRes]) => {
      setPackages(pkgRes.data ?? []);
      setBatches(batchRes.data ?? []);
    });
  }, []);

  // Debounce search — 400ms
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(0);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const fetchMembers = useCallback(async (
    pageNum: number,
    search: string,
    ctx: string,
    order: string,
    gen: string,
    pkg: string,
    batch: string,
  ) => {
    setFetching(true);
    try {
      const res = await getAllMembersAPI({
        startIndex: pageNum * PAGE_SIZE,
        query: search || undefined,
        memberContext: ctx || undefined,
        orderBy: order || undefined,
        gender: gen || undefined,
        packageName: pkg || undefined,
        batchId: batch || undefined,
      });
      const data = res.data ?? [];
      setMembers(data);
      setHasMore(data.length >= PAGE_SIZE);
    } catch {
      // silently fail
    } finally {
      setFetching(false);
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers(page, debouncedQuery, memberContext, orderBy, gender, packageName, batchId);
  }, [page, debouncedQuery, memberContext, orderBy, gender, packageName, batchId, fetchMembers]);

  const activeFilterCount = [memberContext, gender, packageName, batchId].filter(Boolean).length
    + (orderBy !== 'createdAt' ? 1 : 0);

  const resetFilters = () => {
    setMemberContext('');
    setOrderBy('createdAt');
    setGender('');
    setPackageName('');
    setBatchId('');
    setPage(0);
  };

  const handleAttendance = async (member: Member) => {
    try {
      await punchInOutAPI(member._id);
      setToast({ message: `Attendance marked for ${member.name}`, severity: 'success' });
    } catch {
      setToast({ message: 'Failed to mark attendance', severity: 'error' });
    }
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Members
          </Typography>
          {!initialLoad && (
            <Typography variant="body2" color="text.secondary" mt={0.25}>
              {members.length > 0
                ? `Showing ${page * PAGE_SIZE + 1}–${page * PAGE_SIZE + members.length} members`
                : 'No results'}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/members/add')}
          size="large"
        >
          Add Member
        </Button>
      </Box>

      {/* Toolbar: search + filters inline on desktop */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2, display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by name, mobile, email..."
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                ...(query && {
                  endAdornment: (
                    <InputAdornment position="end">
                      <CloseIcon
                        fontSize="small"
                        sx={{ cursor: 'pointer', color: 'text.disabled' }}
                        onClick={() => setQuery('')}
                      />
                    </InputAdornment>
                  ),
                }),
              },
            }}
            sx={{ flex: 1, minWidth: 250 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={memberContext}
              label="Status"
              onChange={(e) => { setMemberContext(e.target.value); setPage(0); }}
            >
              {MEMBER_CONTEXTS.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={orderBy}
              label="Sort By"
              onChange={(e) => { setOrderBy(e.target.value); setPage(0); }}
            >
              {ORDER_OPTIONS.map((o) => (
                <MenuItem key={o.id} value={o.id}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant={showFilters ? 'contained' : 'outlined'}
            size="small"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters((v) => !v)}
            sx={{ height: 40 }}
          >
            More
            {activeFilterCount > 0 && (
              <Chip
                label={activeFilterCount}
                size="small"
                sx={{ ml: 0.75, height: 18, minWidth: 18, fontSize: 11, bgcolor: showFilters ? 'common.white' : 'primary.main', color: showFilters ? 'primary.main' : 'common.white' }}
              />
            )}
          </Button>
        </Box>

        {/* Expanded filters */}
        {showFilters && (
          <>
            <Divider />
            <Box sx={{ p: 2, display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={gender}
                  label="Gender"
                  onChange={(e) => { setGender(e.target.value); setPage(0); }}
                >
                  {GENDER_OPTIONS.map((g) => (
                    <MenuItem key={g.id} value={g.id}>{g.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {packages.length > 0 && (
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Plan</InputLabel>
                  <Select
                    value={packageName}
                    label="Plan"
                    onChange={(e) => { setPackageName(e.target.value); setPage(0); }}
                  >
                    <MenuItem value="">All Plans</MenuItem>
                    {packages.map((p) => (
                      <MenuItem key={p._id} value={p.name}>{p.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {batches.length > 0 && (
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Batch</InputLabel>
                  <Select
                    value={batchId}
                    label="Batch"
                    onChange={(e) => { setBatchId(e.target.value); setPage(0); }}
                  >
                    <MenuItem value="">All Batches</MenuItem>
                    {batches.map((b) => (
                      <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {activeFilterCount > 0 && (
                <Button size="small" color="error" onClick={resetFilters}>
                  Clear Filters
                </Button>
              )}
            </Box>
          </>
        )}

        {/* Fetching indicator */}
        {fetching && <LinearProgress sx={{ height: 2 }} />}
      </Card>

      {/* Member list */}
      {initialLoad ? (
        <Grid container spacing={2}>
          {Array.from({ length: 9 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rounded" height={170} />
            </Grid>
          ))}
        </Grid>
      ) : members.length === 0 && !fetching ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" mb={1}>
              No members found
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {debouncedQuery || activeFilterCount > 0
                ? 'Try adjusting your search or filters'
                : 'Add your first member to get started'}
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/members/add')}>
              Add Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Grid
            container
            spacing={2}
            sx={{ opacity: fetching ? 0.5 : 1, transition: 'opacity 0.15s ease' }}
          >
            {members.map((m) => (
              <Grid key={m._id} size={{ xs: 12, sm: 6, md: 4 }}>
                <MemberCard member={m} onClick={() => navigate(`/members/${m._id}`)} onAttendance={handleAttendance} />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Page {page + 1}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outlined"
                disabled={!hasMore}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </Box>
          </Box>
        </>
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
