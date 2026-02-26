import {
  Box,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Receipt as InvoiceIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
  Edit as EditIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import type { MemberPackage, MemberPtPlan, MemberService, MemberInvoice } from '@/api/types';
import { formatDate } from '@/utils/format';
import StripedCard from '@/components/StripedCard';
import StatusChip from '@/components/StatusChip';

// ─── Helpers ─────────────────────────────────────────────

export { formatDate };

export function getStripColor(expiryDate?: string): string {
  if (!expiryDate) return '#E0E0E0';
  const now = Date.now();
  const exp = new Date(expiryDate).getTime();
  if (now > exp) return '#E57373';
  if (exp <= now + 7 * 86400000) return '#FFCA28';
  return '#66BB6A';
}

// ─── Plan Card ───────────────────────────────────────────

export function PlanCard({
  pkg,
  onAddPayment,
  onDelete,
  onDeletePayment,
  onEdit,
  onShareInvoice,
}: {
  pkg: MemberPackage;
  onAddPayment: () => void;
  onDelete: () => void;
  onDeletePayment: (paymentId: string) => void;
  onEdit?: () => void;
  onShareInvoice?: (invoice: MemberInvoice) => void;
}) {
  const stripColor = getStripColor(pkg.expiryDate);
  const statusLabel = stripColor === '#66BB6A' ? 'Active' : stripColor === '#FFCA28' ? 'Expiring' : 'Expired';
  const payments = pkg.invoices ?? [];

  return (
    <StripedCard stripeColor={stripColor}>
      <CardContent sx={{ flex: 1, p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box>
            <Typography variant="body1" fontWeight={600}>{pkg.name}</Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                Purchased: <b>{formatDate(pkg.purchaseDate)}</b>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expires: <b>{formatDate(pkg.expiryDate)}</b>
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StatusChip label={statusLabel} color={stripColor} />
            <Tooltip title="Add Payment">
              <IconButton size="small" onClick={onAddPayment} sx={{ color: 'primary.main' }}>
                <PaymentIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {onEdit && (
              <Tooltip title="Edit Plan">
                <IconButton size="small" onClick={onEdit} sx={{ color: 'text.secondary' }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Delete Plan">
              <IconButton size="small" onClick={onDelete} sx={{ color: 'error.main' }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Total</Typography>
            <Typography variant="body2" fontWeight={600}>{pkg.totalAfterDiscount ?? pkg.totalAmount}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Paid</Typography>
            <Typography variant="body2" fontWeight={600} color="success.main">{pkg.paid}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Pending</Typography>
            <Typography variant="body2" fontWeight={600} sx={{ color: pkg.pendingAmount > 0 ? '#E57373' : '#81C784' }}>
              {pkg.pendingAmount}
            </Typography>
          </Box>
          {pkg.discount != null && pkg.discount > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary">Discount</Typography>
              <Typography variant="body2" fontWeight={600}>
                {pkg.discount}{pkg.discountType === 'percent' ? '%' : ''}
              </Typography>
            </Box>
          )}
          {pkg.admissionFees != null && Number(pkg.admissionFees) > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary">Admission</Typography>
              <Typography variant="body2" fontWeight={600}>{pkg.admissionFees}</Typography>
            </Box>
          )}
        </Box>

        {pkg.comments && pkg.comments.filter((c) => c.text).length > 0 && (
          <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Comments</Typography>
            {pkg.comments.filter((c) => c.text).map((c) => (
              <Box key={c._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.25 }}>
                <Typography variant="body2">{c.text}</Typography>
                {c.createdAt && <Typography variant="caption" color="text.secondary">{formatDate(c.createdAt)}</Typography>}
              </Box>
            ))}
          </Box>
        )}

        {payments.length > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} mb={0.5} display="block">
              Payments
            </Typography>
            {payments.map((inv) => (
              <Box
                key={inv._id}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}
              >
                <InvoiceIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {inv.invoiceNumber} — ₹{inv.paidAmount} ({formatDate(inv.paymentDate)})
                </Typography>
                {onShareInvoice && (
                  <Tooltip title="Share Invoice">
                    <IconButton size="small" onClick={() => onShareInvoice(inv)} sx={{ color: 'primary.main' }}>
                      <ShareIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Delete Payment">
                  <IconButton size="small" onClick={() => onDeletePayment(inv._id)} sx={{ color: 'error.light' }}>
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </StripedCard>
  );
}

// ─── PT Plan Card ────────────────────────────────────────

export function PtPlanCard({
  plan,
  onAddPayment,
  onDelete,
  onDeletePayment,
  onEdit,
  onShareInvoice,
}: {
  plan: MemberPtPlan;
  onAddPayment: () => void;
  onDelete: () => void;
  onDeletePayment: (paymentId: string) => void;
  onEdit?: () => void;
  onShareInvoice?: (invoice: MemberInvoice) => void;
}) {
  const stripColor = getStripColor(plan.expiryDate);
  const statusLabel = stripColor === '#66BB6A' ? 'Active' : stripColor === '#FFCA28' ? 'Expiring' : 'Expired';
  const isFrozen = !!plan.freezeStatus;

  return (
    <StripedCard stripeColor={isFrozen ? '#42A5F5' : stripColor}>
      <CardContent sx={{ flex: 1, p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box>
            <Typography variant="body1" fontWeight={600}>{plan.name}</Typography>
            {plan.purchaseDate && plan.expiryDate && (
              <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                <Typography variant="body2" color="text.primary">
                  Purchased: <b>{formatDate(plan.purchaseDate)}</b>
                </Typography>
                <Typography variant="body2" color="text.primary">
                  Expires: <b>{formatDate(plan.expiryDate)}</b>
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {isFrozen && (
              <StatusChip label="Frozen" color="#42A5F5" />
            )}
            <StatusChip label={statusLabel} color={stripColor} />
            <Tooltip title="Add Payment">
              <IconButton size="small" onClick={onAddPayment} sx={{ color: 'primary.main' }}>
                <PaymentIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {onEdit && (
              <Tooltip title="Edit PT Plan">
                <IconButton size="small" onClick={onEdit} sx={{ color: 'text.secondary' }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Delete PT Plan">
              <IconButton size="small" onClick={onDelete} sx={{ color: 'error.main' }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {plan.totalSessions != null && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">Sessions:</Typography>
            <Typography variant="body2" fontWeight={600}>
              {plan.completedSessions ?? 0} / {plan.totalSessions}
            </Typography>
            <Box sx={{ flex: 1, height: 6, bgcolor: '#E0E0E0', borderRadius: 3, overflow: 'hidden', ml: 1 }}>
              <Box
                sx={{
                  height: '100%',
                  width: `${Math.min(100, ((plan.completedSessions ?? 0) / plan.totalSessions) * 100)}%`,
                  bgcolor: '#66BB6A',
                  borderRadius: 3,
                }}
              />
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Total</Typography>
            <Typography variant="body2" fontWeight={600}>{plan.totalAfterDiscount ?? plan.totalAmount}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Paid</Typography>
            <Typography variant="body2" fontWeight={600} color="success.main">{plan.paid ?? 0}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Pending</Typography>
            <Typography variant="body2" fontWeight={600} sx={{ color: (plan.pendingAmount ?? 0) > 0 ? '#E57373' : '#81C784' }}>
              {plan.pendingAmount ?? 0}
            </Typography>
          </Box>
          {plan.discount != null && plan.discount > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary">Discount</Typography>
              <Typography variant="body2" fontWeight={600}>
                {plan.discount}{plan.discountType === 'percent' ? '%' : ''}
              </Typography>
            </Box>
          )}
        </Box>

        {isFrozen && (
          <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#42A5F50A', borderRadius: 1, border: '1px solid #42A5F530' }}>
            <Box sx={{ display: 'flex', gap: 3 }}>
              {plan.freezeStartDate && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Freeze From</Typography>
                  <Typography variant="body2" fontWeight={500}>{formatDate(plan.freezeStartDate)}</Typography>
                </Box>
              )}
              {plan.freezeEndDate && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Freeze Until</Typography>
                  <Typography variant="body2" fontWeight={500}>{formatDate(plan.freezeEndDate)}</Typography>
                </Box>
              )}
            </Box>
            {plan.freezeReason && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Reason: {plan.freezeReason}
              </Typography>
            )}
          </Box>
        )}

        {plan.comments && plan.comments.filter((c) => c.text).length > 0 && (
          <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Comments</Typography>
            {plan.comments.filter((c) => c.text).map((c) => (
              <Box key={c._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.25 }}>
                <Typography variant="body2">{c.text}</Typography>
                {c.createdAt && <Typography variant="caption" color="text.secondary">{formatDate(c.createdAt)}</Typography>}
              </Box>
            ))}
          </Box>
        )}

        {plan.invoices && plan.invoices.length > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} mb={0.5} display="block">
              Payments
            </Typography>
            {plan.invoices.map((inv) => (
              <Box
                key={inv._id}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}
              >
                <InvoiceIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {inv.invoiceNumber} — ₹{inv.paidAmount} ({formatDate(inv.paymentDate)})
                </Typography>
                {onShareInvoice && (
                  <Tooltip title="Share Invoice">
                    <IconButton size="small" onClick={() => onShareInvoice(inv)} sx={{ color: 'primary.main' }}>
                      <ShareIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Delete Payment">
                  <IconButton size="small" onClick={() => onDeletePayment(inv._id)} sx={{ color: 'error.light' }}>
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </StripedCard>
  );
}

// ─── Service Card ────────────────────────────────────────

export function ServiceCardItem({
  service,
  onDelete,
  onEdit,
}: {
  service: MemberService;
  onDelete: () => void;
  onEdit?: () => void;
}) {
  return (
    <StripedCard stripeColor="#7B1FA2">
      <CardContent sx={{ flex: 1, p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body1" fontWeight={600} mb={0.5}>{service.name}</Typography>
            {service.purchaseDate && (
              <Typography variant="caption" color="text.secondary">
                Purchased: {formatDate(service.purchaseDate)}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {onEdit && (
              <Tooltip title="Edit Service">
                <IconButton size="small" onClick={onEdit} sx={{ color: 'text.secondary' }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Delete Service">
              <IconButton size="small" onClick={onDelete} sx={{ color: 'error.main' }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Total</Typography>
            <Typography variant="body2" fontWeight={600}>
              {service.totalAfterDiscount ?? service.totalAmount ?? service.price}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Paid</Typography>
            <Typography variant="body2" fontWeight={600} color="success.main">{service.paid ?? 0}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Pending</Typography>
            <Typography variant="body2" fontWeight={600} sx={{ color: (service.pendingAmount ?? 0) > 0 ? '#E57373' : '#81C784' }}>
              {service.pendingAmount ?? 0}
            </Typography>
          </Box>
          {service.discount != null && service.discount > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary">Discount</Typography>
              <Typography variant="body2" fontWeight={600}>
                {service.discount}{service.discountType === 'percent' ? '%' : ''}
              </Typography>
            </Box>
          )}
        </Box>

        {service.comments && service.comments.filter((c) => c.text).length > 0 && (
          <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Comments</Typography>
            {service.comments.filter((c) => c.text).map((c) => (
              <Box key={c._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.25 }}>
                <Typography variant="body2">{c.text}</Typography>
                {c.createdAt && <Typography variant="caption" color="text.secondary">{formatDate(c.createdAt)}</Typography>}
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </StripedCard>
  );
}
