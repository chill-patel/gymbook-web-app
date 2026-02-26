import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CardContent,
  FormControl,
  IconButton,
  InputAdornment,
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
  Search as SearchIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Event as EventIcon,
  LocalOffer as PlanIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { getVisitorsAPI, deleteVisitorAPI } from '@/api/visitor';
import { Colors, Layout } from '@/theme';
import { formatDate } from '@/utils/format';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import StatusChip from '@/components/StatusChip';
import StripedCard from '@/components/StripedCard';
import FilterToolbar from '@/components/FilterToolbar';

const PAGE_SIZE = 40;

const LEAD_STATUSES = [
  { value: '', label: 'All Status' },
  { value: 'Initial Discussion', label: 'Initial Discussion' },
  { value: 'Payment issue', label: 'Payment Issue' },
  { value: 'Blocked', label: 'Blocked' },
  { value: 'Closed', label: 'Closed' },
];

const statusColorMap: Record<string, string> = {
  'Initial Discussion': '#2196F3',
  'Payment issue': '#FF9800',
  'Blocked': '#F44336',
  'Closed': '#9E9E9E',
  hot: '#F44336',
  cold: '#2196F3',
};

interface VisitorPackage {
  _id?: string;
  name: string;
  price: number;
  month?: number;
  days?: number | null;
}

interface VisitorComment {
  text: string;
  _id?: string;
  createdAt?: string;
}

interface Visitor {
  _id: string;
  name: string;
  mobile?: string;
  callingCode?: string;
  countryCode?: string;
  leadStatus?: string;
  fallowUpDate?: string;
  packages?: VisitorPackage;
  comments?: VisitorComment[] | null;
  createdAt?: string;
  updatedAt?: string;
}

function formatMobile(mobile?: string, callingCode?: string): string {
  if (!mobile) return '';
  const code = callingCode ? `+${callingCode} ` : '';
  return `${code}${mobile}`;
}

export default function VisitorListPage() {
  const navigate = useNavigate();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [leadStatus, setLeadStatus] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(0);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const fetchVisitors = useCallback(async (pageNum: number, search: string, status: string) => {
    setFetching(true);
    try {
      const res = await getVisitorsAPI({
        startIndex: pageNum * PAGE_SIZE,
        query: search || undefined,
        leadStatus: status || undefined,
      });
      const data = (res as any)?.data;
      const list: Visitor[] = Array.isArray(data) ? data : [];
      setVisitors(list);
      setHasMore(list.length >= PAGE_SIZE);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchVisitors(page, debouncedQuery, leadStatus);
  }, [page, debouncedQuery, leadStatus, fetchVisitors]);

  const handleDelete = async (visitor: Visitor) => {
    if (!confirm(`Delete enquiry for "${visitor.name}"?`)) return;
    try {
      await deleteVisitorAPI(visitor._id);
      setVisitors((prev) => prev.filter((v) => v._id !== visitor._id));
      setToast({ message: `Deleted ${visitor.name}`, severity: 'success' });
    } catch {
      setToast({ message: 'Failed to delete', severity: 'error' });
    }
  };

  const handleCall = (visitor: Visitor) => {
    if (visitor.mobile) {
      window.open(`tel:${visitor.callingCode ? `+${visitor.callingCode}` : ''}${visitor.mobile}`);
    }
  };

  const handleWhatsApp = (visitor: Visitor) => {
    if (visitor.mobile) {
      const phone = `${visitor.callingCode ?? '91'}${visitor.mobile}`;
      window.open(`https://wa.me/${phone}`, '_blank');
    }
  };

  const lastComment = (comments?: VisitorComment[] | null): string => {
    if (!comments || comments.length === 0) return '';
    const last = comments[comments.length - 1];
    return last?.text ?? '';
  };

  return (
    <Box sx={{ maxWidth: Layout.pageMaxWidth, mx: 'auto' }}>
      <PageHeader
        title="Enquiries"
        subtitle={!loading ? (visitors.length > 0 ? `Showing ${page * PAGE_SIZE + 1}–${page * PAGE_SIZE + visitors.length}` : 'No enquiries') : undefined}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/visitors/add')}>
            Add Enquiry
          </Button>
        }
      />

      <FilterToolbar loading={fetching}>
          <TextField
            placeholder="Search by name, mobile..."
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
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Lead Status</InputLabel>
            <Select
              value={leadStatus}
              label="Lead Status"
              onChange={(e) => { setLeadStatus(e.target.value); setPage(0); }}
            >
              {LEAD_STATUSES.map((s) => (
                <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
      </FilterToolbar>

      {/* Visitor list */}
      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 9 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rounded" height={160} />
            </Grid>
          ))}
        </Grid>
      ) : visitors.length === 0 && !fetching ? (
        <EmptyState
          title="No enquiries found"
          description={debouncedQuery || leadStatus ? 'Try adjusting your search or filters' : 'No visitor enquiries yet'}
        />
      ) : (
        <>
          <Grid
            container
            spacing={2}
            sx={{ opacity: fetching ? 0.5 : 1, transition: 'opacity 0.15s ease' }}
          >
            {visitors.map((v) => {
              const mobile = formatMobile(v.mobile, v.callingCode);
              const statusColor = statusColorMap[v.leadStatus ?? ''] ?? '#9E9E9E';
              const comment = lastComment(v.comments);

              return (
                <Grid key={v._id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <StripedCard stripeColor={statusColor}>
                      <CardContent sx={{ flex: 1, p: 2, '&:last-child': { pb: 1.5 } }}>
                        {/* Name + status */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body1" fontWeight={600} noWrap sx={{ flex: 1 }}>
                            {v.name}
                          </Typography>
                          {v.leadStatus && (
                            <StatusChip label={v.leadStatus} color={statusColor} />
                          )}
                        </Box>

                        {/* Details */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                          {mobile && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <PhoneIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                              <Typography variant="body2" color="text.secondary">{mobile}</Typography>
                            </Box>
                          )}
                          {v.packages?.name && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <PlanIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                              <Typography variant="body2" color="text.secondary">
                                {v.packages.name} — ₹{v.packages.price?.toLocaleString()}
                              </Typography>
                            </Box>
                          )}
                          {v.fallowUpDate && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <EventIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                              <Typography variant="body2" color="text.secondary">
                                Follow-up: {formatDate(v.fallowUpDate)}
                              </Typography>
                            </Box>
                          )}
                          {comment && (
                            <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.25, fontStyle: 'italic' }}>
                              "{comment}"
                            </Typography>
                          )}
                        </Box>
                      </CardContent>

                      {/* Actions */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 1, py: 0.5, gap: 0.5, borderTop: '1px solid', borderColor: 'divider' }}>
                        {v.mobile && (
                          <Tooltip title="Call">
                            <IconButton size="small" onClick={() => handleCall(v)} sx={{ color: 'text.secondary' }}>
                              <PhoneIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {v.mobile && (
                          <Tooltip title="WhatsApp">
                            <IconButton size="small" onClick={() => handleWhatsApp(v)} sx={{ color: '#25D366' }}>
                              <WhatsAppIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => navigate('/visitors/edit', { state: { visitor: v } })} sx={{ color: 'text.secondary' }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDelete(v)} sx={{ color: Colors.financial.due }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                  </StripedCard>
                </Grid>
              );
            })}
          </Grid>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Page {page + 1}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" size="small" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button variant="outlined" size="small" disabled={!hasMore} onClick={() => setPage((p) => p + 1)}>
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
