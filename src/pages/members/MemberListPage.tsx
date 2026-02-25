import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Card,
  Chip,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  TablePagination,
  Skeleton,
  Avatar,
} from '@mui/material';
import { Search as SearchIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { getAllMembersAPI } from '@/api/member';
import type { Member } from '@/api/types';
import { Colors } from '@/theme';

const PAGE_SIZE = 40;

export default function MemberListPage() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async (pageNum: number, search: string) => {
    setLoading(true);
    try {
      const res = await getAllMembersAPI({
        startIndex: pageNum * PAGE_SIZE,
        query: search || undefined,
      });
      setMembers(res.data ?? []);
      setTotalCount(res.totalCount ?? 0);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers(page, query);
  }, [page, query, fetchMembers]);

  const statusColor = (status?: string) => {
    if (status === 'active') return Colors.status.active;
    return Colors.status.expired;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Members
        </Typography>
      </Box>

      <Card>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            placeholder="Search members..."
            size="small"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ minWidth: 300 }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Member</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : members.map((m) => (
                    <TableRow
                      key={m._id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/members/${m._id}`)}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            src={m.profileImage}
                            sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}
                          >
                            {m.name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight={500}>
                              {m.name}
                            </Typography>
                            {m.email && (
                              <Typography variant="body2" color="text.secondary">
                                {m.email}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{m.mobile ?? '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={m.membershipStatus ?? 'inactive'}
                          size="small"
                          sx={{
                            bgcolor: `${statusColor(m.membershipStatus)}1A`,
                            color: statusColor(m.membershipStatus),
                            fontWeight: 500,
                            textTransform: 'capitalize',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {m.joiningDate
                          ? new Date(m.joiningDate).toLocaleDateString()
                          : '—'}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/members/${m._id}`);
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              {!loading && members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No members found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={PAGE_SIZE}
          rowsPerPageOptions={[PAGE_SIZE]}
        />
      </Card>
    </Box>
  );
}
