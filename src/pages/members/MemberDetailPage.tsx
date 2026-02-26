import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Skeleton,
  Snackbar,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  ArrowBack as BackIcon,
  CalendarMonth as CalendarIcon,
  Schedule as TimeIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  ChevronLeft as ChevLeft,
  ChevronRight as ChevRight,
  Login as EntryIcon,
  Logout as ExitIcon,
  EventBusy as EmptyCalIcon,
  Phone as PhoneIcon,
  Chat as WhatsAppIcon,
  Fingerprint as PunchIcon,
  Block as BlockIcon,
  LockOpen as UnblockIcon,
  Autorenew as RenewIcon,
  FitnessCenter as PtIcon,
  BuildCircle as ServiceIcon,
  Straighten as MeasureIcon,
  Fingerprint as BiometricIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import {
  getMemberDetailAPI,
  getAttendanceReportAPI,
  punchInOutAPI,
  deleteMemberAPI,
  addPackageForMemberAPI,
  getMemberPackagesAPI,
  deleteMemberPackageAPI,
  addPlanPaymentAPI,
  deletePlanPaymentAPI,
  getMemberPtPlansAPI,
  addPtPlanForMemberAPI,
  deleteMemberPtPlanAPI,
  addPtPlanPaymentAPI,
  deletePtPlanPaymentAPI,
  getMemberServicesAPI,
  addServiceForMemberAPI,
  deleteMemberServiceAPI,
  updateMemberAPI,
  updateMemberPlanAPI,
  updateMemberPtPlanAPI,
  updateMemberServiceAPI,
  addMeasurementAPI,
  updateMeasurementAPI,
  deleteMeasurementAPI,
  registerFingerprintAPI,
  deleteFingerprintAPI,
} from '@/api/member';
import type { Member, MemberPackage, MemberPtPlan, MemberService, MemberMeasurement, AttendanceRecord, MemberInvoice } from '@/api/types';
import { Colors } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import { openInvoice } from '@/utils/generateInvoice';
import DeleteConfirmDialog from './dialogs/DeleteConfirmDialog';
import AddPaymentDialog from './dialogs/AddPaymentDialog';
import AddPlanDialog from './dialogs/AddPlanDialog';
import AddPtPlanDialog from './dialogs/AddPtPlanDialog';
import AddServiceDialog from './dialogs/AddServiceDialog';
import MeasurementDialog from './dialogs/MeasurementDialog';
import EditProfileDialog from './dialogs/EditProfileDialog';
import EditPlanDialog from './dialogs/EditPlanDialog';
import EditPtPlanDialog from './dialogs/EditPtPlanDialog';
import EditServiceDialog from './dialogs/EditServiceDialog';
import { PlanCard, PtPlanCard, ServiceCardItem, formatDate } from './components/MemberCards';

// ─── Helpers ─────────────────────────────────────────────

function getMonthRange(date: Date) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const y = date.getFullYear();
  const m = date.getMonth();
  return {
    start: new Date(y, m, 1).getTime(),
    end: new Date(y, m + 1, 0, 23, 59, 59, 999).getTime(),
    label: `${months[m]} ${y}`,
  };
}

// ─── Detail Item (matches mobile DetailItem) ─────────────

function DetailItem({ label, value }: { label: string; value: string | number }) {
  return (
    <Box sx={{ flex: 1, minWidth: 0, py: 0.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500} sx={{ mt: 0.25 }} noWrap>
        {value}
      </Typography>
    </Box>
  );
}

// ─── Consistent Section Title ────────────────────────────

function SectionTitle({
  icon,
  title,
  count,
  action,
  onViewAll,
}: {
  icon?: React.ReactNode;
  title: string;
  count?: number;
  action?: React.ReactNode;
  onViewAll?: () => void;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
      {icon}
      <Typography variant="body1" fontWeight={600} color="text.primary">{title}</Typography>
      {count != null && (
        <Chip label={count} size="small" sx={{ height: 20, fontSize: 11, fontWeight: 600, bgcolor: 'action.hover' }} />
      )}
      {onViewAll && (count ?? 0) > 0 && (
        <Button size="small" endIcon={<ChevRight />} onClick={onViewAll} sx={{ textTransform: 'none', fontSize: 12 }}>
          View All
        </Button>
      )}
      <Box sx={{ flex: 1 }} />
      {action}
    </Box>
  );
}

// ─── Profile Section ─────────────────────────────────────

function ProfileSection({ member, onEdit }: { member: Member; onEdit?: () => void }) {
  const statusActive = member.membershipStatus === true;
  const statusColor = statusActive ? Colors.status.active : Colors.status.expired;
  const statusLabel = statusActive ? 'Active' : 'Inactive';

  const formattedMobile = member.mobile
    ? `${member.callingCode ? `+${member.callingCode} - ` : ''}${member.mobile}`
    : null;

  return (
    <Card sx={{ display: 'flex', overflow: 'hidden' }}>
      <Box sx={{ width: 5, bgcolor: statusColor, flexShrink: 0 }} />
      <CardContent sx={{ flex: 1, p: 3, '&:last-child': { pb: 3 } }}>
        <SectionTitle
          icon={<PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />}
          title="Member Profile"
          action={onEdit ? (
            <Tooltip title="Edit Profile">
              <IconButton size="small" onClick={onEdit} sx={{ color: 'text.secondary' }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : undefined}
        />

        {/* Header row: avatar + name/status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 2.5 }}>
          <Avatar
            src={member.photo}
            sx={{ width: 96, height: 96, bgcolor: 'primary.main', fontSize: 36, fontWeight: 600, flexShrink: 0 }}
          >
            {member.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" fontWeight={600} noWrap sx={{ fontSize: '1.1rem' }}>
                {member.name}
              </Typography>
              <Chip
                label={statusLabel}
                size="small"
                sx={{
                  bgcolor: `${statusColor}1A`,
                  color: statusColor,
                  fontWeight: 600,
                  height: 22,
                  fontSize: 11,
                }}
              />
            </Box>
            {member.membershipId != null && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                ID: {member.membershipId}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Detail grid — 4 cols on desktop, 2 on mobile */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
            gap: 2,
          }}
        >
          {formattedMobile && <DetailItem label="Mobile" value={formattedMobile} />}
          {member.email && <DetailItem label="Email" value={member.email} />}
          {member.gender && (
            <DetailItem
              label="Gender"
              value={member.gender.charAt(0).toUpperCase() + member.gender.slice(1)}
            />
          )}
          {member.dob && <DetailItem label="Date of Birth" value={formatDate(member.dob)} />}
          {member.aadharNumber && <DetailItem label="Aadhar Number" value={member.aadharNumber} />}
          {member.occupation && <DetailItem label="Occupation" value={member.occupation} />}
        </Box>

        {member.address && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, lineHeight: 1.2 }}>
              Address
            </Typography>
            <Typography variant="body2" fontWeight={500} sx={{ mt: 0.25 }}>
              {member.address}
            </Typography>
          </Box>
        )}

        {member.notes && (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, lineHeight: 1.2 }}>
              Notes
            </Typography>
            <Typography variant="body2" fontWeight={500} sx={{ mt: 0.25 }}>
              {member.notes}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Social Actions Bar ─────────────────────────────────

function SocialActions({
  member,
  onToast,
  onMemberUpdate,
  onRenewPlan,
}: {
  member: Member;
  onToast: (msg: string, severity: 'success' | 'error') => void;
  onMemberUpdate: (updated: Member) => void;
  onRenewPlan: () => void;
}) {
  const phoneNumber = member.mobile
    ? `+${member.callingCode || ''}${member.mobile}`
    : null;

  const handleCall = () => {
    if (phoneNumber) window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleWhatsApp = () => {
    if (phoneNumber) {
      const num = `${member.callingCode || ''}${member.mobile}`;
      window.open(`https://wa.me/${num}`, '_blank');
    }
  };

  const handlePunchInOut = async () => {
    try {
      const res = await punchInOutAPI(member._id) as { message?: string };
      onToast(res.message || 'Punch recorded', 'success');
    } catch {
      onToast('Failed to record attendance', 'error');
    }
  };

  const handleRenewPlan = () => {
    onRenewPlan();
  };

  const handleBlock = async () => {
    const isActive = member.membershipStatus;
    try {
      await deleteMemberAPI(member._id);
      onMemberUpdate({ ...member, membershipStatus: !isActive, isDeleted: !member.isDeleted });
      onToast(isActive ? 'Member blocked' : 'Member unblocked', 'success');
    } catch {
      onToast('Action failed', 'error');
    }
  };

  const actions = [
    { icon: <PhoneIcon />, label: 'Call', onClick: handleCall, disabled: !phoneNumber, color: '#1976D2' },
    { icon: <WhatsAppIcon />, label: 'WhatsApp', onClick: handleWhatsApp, disabled: !phoneNumber, color: '#25D366' },
    { icon: <PunchIcon />, label: 'Attendance', onClick: handlePunchInOut, color: '#FF9800' },
    { icon: <RenewIcon />, label: 'Renew Plan', onClick: handleRenewPlan, color: '#7B1FA2' },
    {
      icon: member.membershipStatus ? <BlockIcon /> : <UnblockIcon />,
      label: member.membershipStatus ? 'Block' : 'Unblock',
      onClick: handleBlock,
      color: member.membershipStatus ? '#E57373' : '#66BB6A',
    },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {actions.map((action) => (
        <Button
          key={action.label}
          size="small"
          variant="outlined"
          startIcon={action.icon}
          onClick={action.onClick}
          disabled={action.disabled}
          sx={{
            borderColor: `${action.color}40`,
            color: action.color,
            '&:hover': { bgcolor: `${action.color}0A`, borderColor: action.color },
            textTransform: 'none',
            fontWeight: 500,
            fontSize: 12,
          }}
        >
          {action.label}
        </Button>
      ))}
    </Box>
  );
}

// ─── Batch Section ───────────────────────────────────────

function BatchSection({ batch }: { batch?: Member['batch'] }) {
  if (!batch) return null;

  return (
    <Card>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <SectionTitle icon={<PeopleIcon sx={{ fontSize: 18, color: 'text.secondary' }} />} title="Batch" />
        <Typography variant="body1" fontWeight={600} mb={0.75}>{batch.name}</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
            <TimeIcon sx={{ fontSize: 15 }} />
            <Typography variant="body2">{batch.startTime} — {batch.endTime}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
            <PeopleIcon sx={{ fontSize: 15 }} />
            <Typography variant="body2">{batch.currentMember} / {batch.batchLimit}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Attendance Section ──────────────────────────────────

function formatAttendanceDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTime(dateStr?: string): string {
  if (!dateStr) return '--:--';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '--:--';
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${m} ${ampm}`;
}

function AttendanceSection({ memberId }: { memberId: string }) {
  const [monthDate, setMonthDate] = useState(new Date());
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const { start, end, label } = useMemo(() => getMonthRange(monthDate), [monthDate]);

  useEffect(() => {
    setLoading(true);
    getAttendanceReportAPI(memberId, start, end)
      .then((res) => setRecords(res.data ?? []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [memberId, start, end]);

  const changeMonth = (delta: number) => {
    setMonthDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + delta);
      return d;
    });
  };

  return (
    <Card>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <SectionTitle icon={<CalendarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />} title="Attendance" />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
          <IconButton size="small" onClick={() => changeMonth(-1)}>
            <ChevLeft />
          </IconButton>
          <Typography variant="body1" fontWeight={600} sx={{ minWidth: 150, textAlign: 'center' }}>
            {label}
          </Typography>
          <IconButton size="small" onClick={() => changeMonth(1)}>
            <ChevRight />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={36} />
            ))}
          </Box>
        ) : records.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <EmptyCalIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">No attendance this month</Typography>
          </Box>
        ) : (
          <Box>
            {records.map((r, i) => (
              <Box key={i}>
                {i > 0 && <Divider />}
                <Box sx={{ display: 'flex', alignItems: 'center', py: 1, gap: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 130 }}>
                    <CalendarIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                    <Typography variant="body2" fontWeight={500}>{formatAttendanceDate(r.date)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <EntryIcon sx={{ fontSize: 14, color: '#4CAF50' }} />
                    <Typography variant="body2" sx={{ color: '#4CAF50' }}>{formatTime(r.punchInAt)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ExitIcon sx={{ fontSize: 14, color: '#FF9800' }} />
                    <Typography variant="body2" sx={{ color: '#FF9800' }}>{formatTime(r.punchOutAt)}</Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Measurements Section ────────────────────────────────

function MeasurementsSection({
  measurements,
  onAdd,
  onEdit,
  onDelete,
}: {
  measurements: MemberMeasurement[];
  onAdd: () => void;
  onEdit: (m: MemberMeasurement) => void;
  onDelete: (m: MemberMeasurement) => void;
}) {
  return (
    <Card>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <SectionTitle
          icon={<MeasureIcon sx={{ fontSize: 18, color: 'text.secondary' }} />}
          title="Measurements"
          count={measurements.length}
          action={
            <IconButton size="small" onClick={onAdd} sx={{ color: 'primary.main' }}>
              <AddIcon fontSize="small" />
            </IconButton>
          }
        />

        {measurements.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No measurements recorded
          </Typography>
        ) : (
          measurements.map((m, idx) => (
            <Box key={m._id || idx}>
              {idx > 0 && <Divider sx={{ my: 1.5 }} />}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {formatDate(m.date)}
                </Typography>
                <Box>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => onEdit(m)}>
                      <EditIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => onDelete(m)} sx={{ color: 'error.light' }}>
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {m.measurement.map((item, i) => (
                  <Box key={i} sx={{ minWidth: 80 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                      {item.type}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>{item.value}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ─── Biometric Section ───────────────────────────────────

function BiometricSection({
  isRegistered,
  onRegister,
  onRemove,
  loading,
}: {
  isRegistered?: boolean;
  onRegister: () => void;
  onRemove: () => void;
  loading?: boolean;
}) {
  const registered = isRegistered === true;

  return (
    <Card>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <SectionTitle
          icon={<BiometricIcon sx={{ fontSize: 18, color: 'text.secondary' }} />}
          title="Biometric Access"
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
              label={registered ? 'Registered' : 'Not Registered'}
              size="small"
              sx={{
                bgcolor: registered ? '#4CAF501A' : '#9E9E9E1A',
                color: registered ? '#4CAF50' : '#9E9E9E',
                fontWeight: 600,
                fontSize: 11,
                height: 22,
              }}
            />
            {registered ? (
              <Button size="small" color="error" onClick={onRemove} disabled={loading}>
                Remove
              </Button>
            ) : (
              <Button size="small" variant="outlined" onClick={onRegister} disabled={loading}>
                Register
              </Button>
            )}
          </Box>
          }
        />
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { gym } = useAuth();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  // Independent section data (fetched via dedicated APIs like mobile app)
  const [packages, setPackages] = useState<MemberPackage[]>([]);
  const [ptPlans, setPtPlans] = useState<MemberPtPlan[]>([]);
  const [services, setServices] = useState<MemberService[]>([]);

  // Dialog states
  const [addPlanOpen, setAddPlanOpen] = useState(false);
  const [addPtPlanOpen, setAddPtPlanOpen] = useState(false);
  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const [measurementOpen, setMeasurementOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<MemberMeasurement | null>(null);

  // Payment dialog
  const [paymentDialog, setPaymentDialog] = useState<{
    open: boolean;
    type: 'plan' | 'ptPlan';
    id: string;
    name: string;
  } | null>(null);

  // Delete confirm dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    title: string;
    itemName: string;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);

  // Edit dialog states
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<MemberPackage | null>(null);
  const [editPtPlan, setEditPtPlan] = useState<MemberPtPlan | null>(null);
  const [editService, setEditService] = useState<MemberService | null>(null);

  const handleToast = useCallback((message: string, severity: 'success' | 'error') => {
    setToast({ message, severity });
  }, []);

  // Dedicated section fetchers (matching mobile app pattern)
  const fetchPackages = useCallback(async () => {
    if (!id) return;
    try {
      const res = await getMemberPackagesAPI(id);
      setPackages(res.data?.packages ?? []);
    } catch { /* silent */ }
  }, [id]);

  const fetchPtPlans = useCallback(async () => {
    if (!id) return;
    try {
      const res = await getMemberPtPlansAPI(id);
      const list = res.data?.ptPlans ?? res.data?.trainerPlans ?? [];
      setPtPlans(Array.isArray(list) ? list : []);
    } catch { /* silent */ }
  }, [id]);

  const fetchServices = useCallback(async () => {
    if (!id) return;
    try {
      const res = await getMemberServicesAPI(id);
      setServices(res.data?.services ?? []);
    } catch { /* silent */ }
  }, [id]);

  const refreshMember = useCallback(async () => {
    if (!id) return;
    try {
      const res = await getMemberDetailAPI(id);
      setMember(res.data);
    } catch {
      handleToast('Failed to refresh member data', 'error');
    }
  }, [id, handleToast]);

  useEffect(() => {
    if (!id) return;
    getMemberDetailAPI(id)
      .then((res) => setMember(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
    // Fetch sub-sections independently
    fetchPackages();
    fetchPtPlans();
    fetchServices();
  }, [id, fetchPackages, fetchPtPlans, fetchServices]);

  // ── Plan handlers ──
  const handleAddPlan = async (body: Record<string, unknown>) => {
    try {
      await addPackageForMemberAPI(id!, body);
      handleToast('Plan added successfully', 'success');
      setAddPlanOpen(false);
      await fetchPackages();
      await refreshMember();
    } catch {
      handleToast('Failed to add plan', 'error');
    }
  };

  const handleDeletePlan = (pkg: MemberPackage) => {
    setDeleteDialog({
      open: true,
      title: 'Delete Plan',
      itemName: pkg.name,
      onConfirm: async () => {
        await deleteMemberPackageAPI(id!, pkg._id);
        await fetchPackages();
        await refreshMember();
      },
    });
  };

  const handleAddPlanPayment = async (body: { paidAmount: number; paymentDate: string; paymentMethod: string }) => {
    if (!paymentDialog) return;
    try {
      if (paymentDialog.type === 'plan') {
        await addPlanPaymentAPI(id!, paymentDialog.id, body);
      } else {
        await addPtPlanPaymentAPI(id!, paymentDialog.id, body);
      }
      handleToast('Payment added successfully', 'success');
      setPaymentDialog(null);
      if (paymentDialog.type === 'plan') {
        await fetchPackages();
      } else {
        await fetchPtPlans();
      }
    } catch {
      handleToast('Failed to add payment', 'error');
    }
  };

  const handleDeletePlanPayment = (planId: string, paymentId: string, type: 'plan' | 'ptPlan' = 'plan') => {
    setDeleteDialog({
      open: true,
      title: 'Delete Payment',
      itemName: 'this payment',
      onConfirm: async () => {
        if (type === 'plan') {
          await deletePlanPaymentAPI(id!, planId, paymentId);
          await fetchPackages();
        } else {
          await deletePtPlanPaymentAPI(id!, planId, paymentId);
          await fetchPtPlans();
        }
      },
    });
  };

  // ── PT Plan handlers ──
  const handleAddPtPlan = async (body: Record<string, unknown>) => {
    try {
      await addPtPlanForMemberAPI(id!, body);
      handleToast('PT Plan added successfully', 'success');
      setAddPtPlanOpen(false);
      await fetchPtPlans();
    } catch {
      handleToast('Failed to add PT plan', 'error');
    }
  };

  const handleDeletePtPlan = (plan: MemberPtPlan) => {
    setDeleteDialog({
      open: true,
      title: 'Delete PT Plan',
      itemName: plan.name,
      onConfirm: async () => {
        await deleteMemberPtPlanAPI(id!, plan._id);
        await fetchPtPlans();
      },
    });
  };

  // ── Service handlers ──
  const handleAddService = async (body: Record<string, unknown>) => {
    try {
      await addServiceForMemberAPI(id!, body);
      handleToast('Service added successfully', 'success');
      setAddServiceOpen(false);
      await fetchServices();
    } catch {
      handleToast('Failed to add service', 'error');
    }
  };

  const handleDeleteService = (svc: MemberService) => {
    setDeleteDialog({
      open: true,
      title: 'Delete Service',
      itemName: svc.name,
      onConfirm: async () => {
        await deleteMemberServiceAPI(id!, svc._id);
        await fetchServices();
      },
    });
  };

  // ── Edit profile handler ──
  const handleEditProfile = async (body: Record<string, unknown>) => {
    try {
      await updateMemberAPI(id!, body);
      handleToast('Profile updated successfully', 'success');
      setEditProfileOpen(false);
      await refreshMember();
    } catch {
      handleToast('Failed to update profile', 'error');
    }
  };

  // ── Edit handlers ──
  const handleEditPlan = async (body: Record<string, unknown>) => {
    if (!editPlan) return;
    try {
      await updateMemberPlanAPI(editPlan._id, body);
      handleToast('Plan updated successfully', 'success');
      setEditPlan(null);
      await fetchPackages();
      await refreshMember();
    } catch {
      handleToast('Failed to update plan', 'error');
    }
  };

  const handleEditPtPlan = async (body: Record<string, unknown>) => {
    if (!editPtPlan) return;
    try {
      await updateMemberPtPlanAPI(editPtPlan._id, body);
      handleToast('PT Plan updated successfully', 'success');
      setEditPtPlan(null);
      await fetchPtPlans();
    } catch {
      handleToast('Failed to update PT plan', 'error');
    }
  };

  const handleEditService = async (body: Record<string, unknown>) => {
    if (!editService) return;
    try {
      await updateMemberServiceAPI(editService._id, body);
      handleToast('Service updated successfully', 'success');
      setEditService(null);
      await fetchServices();
    } catch {
      handleToast('Failed to update service', 'error');
    }
  };

  // ── Measurement handlers ──
  const handleSaveMeasurement = async (body: Record<string, unknown>) => {
    try {
      const res = editingMeasurement
        ? await updateMeasurementAPI(body)
        : await addMeasurementAPI(body);
      if (res && typeof res === 'object' && 'error' in res && (res as { error: boolean }).error) {
        throw new Error((res as { message?: string }).message || 'Failed to save measurement');
      }
      handleToast(editingMeasurement ? 'Measurement updated' : 'Measurement added', 'success');
      setMeasurementOpen(false);
      setEditingMeasurement(null);
      await refreshMember();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save measurement';
      handleToast(msg, 'error');
    }
  };

  const handleDeleteMeasurement = (m: MemberMeasurement) => {
    setDeleteDialog({
      open: true,
      title: 'Delete Measurement',
      itemName: `measurement from ${formatDate(m.date)}`,
      onConfirm: async () => {
        await deleteMeasurementAPI(id!, m._id);
        await refreshMember();
      },
    });
  };

  // ── Biometric handlers ──
  const handleRegisterBiometric = async () => {
    setBiometricLoading(true);
    try {
      await registerFingerprintAPI(id!);
      handleToast('Biometric registered', 'success');
      await refreshMember();
    } catch {
      handleToast('Failed to register biometric', 'error');
    } finally {
      setBiometricLoading(false);
    }
  };

  const handleRemoveBiometric = () => {
    setDeleteDialog({
      open: true,
      title: 'Remove Biometric',
      itemName: 'biometric registration',
      onConfirm: async () => {
        await deleteFingerprintAPI(id!);
        await refreshMember();
      },
    });
  };

  // ── Delete confirm handler ──
  const handleDeleteConfirm = async () => {
    if (!deleteDialog) return;
    setDeleteLoading(true);
    try {
      await deleteDialog.onConfirm();
      handleToast('Deleted successfully', 'success');
      setDeleteDialog(null);
    } catch {
      handleToast('Failed to delete', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Share invoice handlers ──
  const handleSharePlanInvoice = (pkg: MemberPackage, invoice: MemberInvoice) => {
    if (!gym || !member) return;
    openInvoice({
      invoice,
      memberName: member.name,
      planName: pkg.name,
      planType: 'Membership Plan',
      purchaseDate: pkg.purchaseDate,
      expiryDate: pkg.expiryDate,
      gym,
    });
  };

  const handleSharePtPlanInvoice = (plan: MemberPtPlan, invoice: MemberInvoice) => {
    if (!gym || !member) return;
    openInvoice({
      invoice,
      memberName: member.name,
      planName: plan.name,
      planType: 'PT Plan',
      purchaseDate: plan.purchaseDate,
      expiryDate: plan.expiryDate,
      gym,
    });
  };

  if (loading) {
    return (
      <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
        <Skeleton variant="rounded" height={40} width={150} sx={{ mb: 2 }} />
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Skeleton variant="rounded" height={180} sx={{ mb: 1.5 }} />
            <Skeleton variant="rounded" height={80} />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Skeleton variant="rounded" height={280} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!member) {
    return (
      <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
        <Typography variant="h6">Member not found</Typography>
        <Button onClick={() => navigate('/members')} sx={{ mt: 1 }}>Back to Members</Button>
      </Box>
    );
  }

  const measurements = (member.measurement ?? []) as MemberMeasurement[];

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
      {/* Top bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/members')} size="small">
          Back
        </Button>
        <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
          Member Detail
        </Typography>
      </Box>

      {/* Row 1: Profile (left) | Quick Actions, Biometric, Batch, Measurements (right) */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ProfileSection member={member} onEdit={() => setEditProfileOpen(true)} />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Card>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <SectionTitle title="Quick Actions" />
                <SocialActions member={member} onToast={handleToast} onMemberUpdate={setMember} onRenewPlan={() => setAddPlanOpen(true)} />
              </CardContent>
            </Card>
            <BiometricSection
              isRegistered={member.isFingerprintRegistered}
              onRegister={handleRegisterBiometric}
              onRemove={handleRemoveBiometric}
              loading={biometricLoading}
            />
            <BatchSection batch={member.batch} />
            <MeasurementsSection
              measurements={measurements}
              onAdd={() => { setEditingMeasurement(null); setMeasurementOpen(true); }}
              onEdit={(m) => { setEditingMeasurement(m); setMeasurementOpen(true); }}
              onDelete={handleDeleteMeasurement}
            />
          </Box>
        </Grid>
      </Grid>

      {/* Row 2: Membership Plans | PT Plans */}
      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionTitle
            icon={<RenewIcon sx={{ fontSize: 18, color: 'text.secondary' }} />}
            title="Membership Plans"
            count={packages.length}
            onViewAll={() => navigate(`/members/${id}/plans`)}
            action={
              <Button size="small" startIcon={<AddIcon />} onClick={() => setAddPlanOpen(true)}>
                Add Plan
              </Button>
            }
          />
          {packages.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">No plans assigned</Typography>
              </CardContent>
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {packages.map((pkg) => (
                <PlanCard
                  key={pkg._id}
                  pkg={pkg}
                  onAddPayment={() => setPaymentDialog({ open: true, type: 'plan', id: pkg._id, name: pkg.name })}
                  onEdit={() => setEditPlan(pkg)}
                  onDelete={() => handleDeletePlan(pkg)}
                  onDeletePayment={(paymentId) => handleDeletePlanPayment(pkg._id, paymentId)}
                  onShareInvoice={(inv) => handleSharePlanInvoice(pkg, inv)}
                />
              ))}
            </Box>
          )}
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionTitle
            icon={<PtIcon sx={{ fontSize: 18, color: 'text.secondary' }} />}
            title="PT Plans"
            count={ptPlans.length}
            onViewAll={() => navigate(`/members/${id}/pt-plans`)}
            action={
              <Button size="small" startIcon={<AddIcon />} onClick={() => setAddPtPlanOpen(true)}>
                Add PT Plan
              </Button>
            }
          />
          {ptPlans.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">No PT plans assigned</Typography>
              </CardContent>
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {ptPlans.map((plan) => (
                <PtPlanCard
                  key={plan._id}
                  plan={plan}
                  onAddPayment={() => setPaymentDialog({ open: true, type: 'ptPlan', id: plan._id, name: plan.name })}
                  onEdit={() => setEditPtPlan(plan)}
                  onDelete={() => handleDeletePtPlan(plan)}
                  onDeletePayment={(paymentId) => handleDeletePlanPayment(plan._id, paymentId, 'ptPlan')}
                  onShareInvoice={(inv) => handleSharePtPlanInvoice(plan, inv)}
                />
              ))}
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Row 3: Services, Attendance */}
      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionTitle
            icon={<ServiceIcon sx={{ fontSize: 18, color: 'text.secondary' }} />}
            title="Services"
            count={services.length}
            onViewAll={() => navigate(`/members/${id}/services`)}
            action={
              <Button size="small" startIcon={<AddIcon />} onClick={() => setAddServiceOpen(true)}>
                Add Service
              </Button>
            }
          />
          {services.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">No services assigned</Typography>
              </CardContent>
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {services.map((svc) => (
                <ServiceCardItem
                  key={svc._id}
                  service={svc}
                  onEdit={() => setEditService(svc)}
                  onDelete={() => handleDeleteService(svc)}
                />
              ))}
            </Box>
          )}
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <AttendanceSection memberId={member._id} />
        </Grid>
      </Grid>

      {/* ── Dialogs ── */}

      <AddPlanDialog
        open={addPlanOpen}
        onClose={() => setAddPlanOpen(false)}
        onSave={handleAddPlan}
        memberId={id!}
      />

      <AddPtPlanDialog
        open={addPtPlanOpen}
        onClose={() => setAddPtPlanOpen(false)}
        onSave={handleAddPtPlan}
        memberId={id!}
      />

      <AddServiceDialog
        open={addServiceOpen}
        onClose={() => setAddServiceOpen(false)}
        onSave={handleAddService}
        memberId={id!}
      />

      <AddPaymentDialog
        open={!!paymentDialog?.open}
        onClose={() => setPaymentDialog(null)}
        onSave={handleAddPlanPayment}
        planName={paymentDialog?.name}
      />

      <MeasurementDialog
        open={measurementOpen}
        onClose={() => { setMeasurementOpen(false); setEditingMeasurement(null); }}
        onSave={handleSaveMeasurement}
        existing={editingMeasurement}
        memberId={id!}
      />

      {member && (
        <EditProfileDialog
          open={editProfileOpen}
          onClose={() => setEditProfileOpen(false)}
          onSave={handleEditProfile}
          member={member}
        />
      )}

      {editPlan && (
        <EditPlanDialog
          open={!!editPlan}
          onClose={() => setEditPlan(null)}
          onSave={handleEditPlan}
          plan={editPlan}
        />
      )}

      {editPtPlan && (
        <EditPtPlanDialog
          open={!!editPtPlan}
          onClose={() => setEditPtPlan(null)}
          onSave={handleEditPtPlan}
          plan={editPtPlan}
        />
      )}

      {editService && (
        <EditServiceDialog
          open={!!editService}
          onClose={() => setEditService(null)}
          onSave={handleEditService}
          service={editService}
        />
      )}

      <DeleteConfirmDialog
        open={!!deleteDialog?.open}
        onClose={() => setDeleteDialog(null)}
        onConfirm={handleDeleteConfirm}
        title={deleteDialog?.title ?? 'Confirm Delete'}
        itemName={deleteDialog?.itemName}
        loading={deleteLoading}
      />

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
