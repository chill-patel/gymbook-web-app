import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Skeleton,
  Typography,
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import Grid from '@mui/material/Grid2';
import { getMemberDetailAPI, getPackagesByMemberAPI } from '@/api/member';
import type { Member, MemberPackage } from '@/api/types';
import { Colors } from '@/theme';

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [packages, setPackages] = useState<MemberPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getMemberDetailAPI(id),
      getPackagesByMemberAPI(id).catch(() => []),
    ]).then(([m, p]) => {
      setMember(m);
      setPackages(Array.isArray(p) ? p : []);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rounded" height={200} />
      </Box>
    );
  }

  if (!member) {
    return (
      <Box>
        <Typography>Member not found</Typography>
        <Button onClick={() => navigate('/members')}>Back to Members</Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/members')} sx={{ mb: 2 }}>
        Back
      </Button>

      {/* Profile card */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={member.profileImage}
              sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 24 }}
            >
              {member.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h5" fontWeight={700}>
                  {member.name}
                </Typography>
                <Chip
                  label={member.membershipStatus ?? 'inactive'}
                  size="small"
                  sx={{
                    bgcolor:
                      member.membershipStatus === 'active'
                        ? `${Colors.status.active}1A`
                        : `${Colors.status.expired}1A`,
                    color:
                      member.membershipStatus === 'active'
                        ? Colors.status.active
                        : Colors.status.expired,
                    fontWeight: 500,
                    textTransform: 'capitalize',
                  }}
                />
              </Box>
              {member.email && (
                <Typography variant="body2" color="text.secondary">
                  {member.email}
                </Typography>
              )}
              {member.mobile && (
                <Typography variant="body2" color="text.secondary">
                  {member.callingCode ? `+${member.callingCode} ` : ''}
                  {member.mobile}
                </Typography>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            {member.gender && (
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="body2" color="text.secondary">Gender</Typography>
                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>{member.gender}</Typography>
              </Grid>
            )}
            {member.dateOfBirth && (
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                <Typography variant="body1">{new Date(member.dateOfBirth).toLocaleDateString()}</Typography>
              </Grid>
            )}
            {member.joiningDate && (
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="body2" color="text.secondary">Joined</Typography>
                <Typography variant="body1">{new Date(member.joiningDate).toLocaleDateString()}</Typography>
              </Grid>
            )}
            {member.address && (
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="body2" color="text.secondary">Address</Typography>
                <Typography variant="body1">{member.address}</Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Packages */}
      <Typography variant="h6" fontWeight={600} mb={1.5}>
        Packages
      </Typography>
      {packages.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary" align="center">No packages assigned</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {packages.map((pkg) => (
            <Grid key={pkg._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="body1" fontWeight={600}>
                    {pkg.packageName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    {new Date(pkg.startDate).toLocaleDateString()} — {new Date(pkg.endDate).toLocaleDateString()}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2">
                      Paid: <strong>{pkg.paidAmount}</strong>
                    </Typography>
                    {pkg.dueAmount > 0 && (
                      <Typography variant="body2" color={Colors.financial.due}>
                        Due: {pkg.dueAmount}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
