import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Skeleton,
  Snackbar,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { ShoppingCart as PurchaseIcon } from '@mui/icons-material';
import { getActiveSubscriptionAPI } from '@/api/payment';
import { generatePaymentAuthTokenAPI } from '@/api/gym';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/theme';

const PAYMENT_BASE = 'https://devpayments.gymbook.in';

const PAYMENT_URLS: Record<string, string> = {
  sms_plan: `${PAYMENT_BASE}/sms-buy`,
  biometric_plan: `${PAYMENT_BASE}/biometric-buy`,
};

interface SubscriptionPlan {
  title: string;
  description: string[];
  btnText: string;
  type?: string;
  subID?: string;
}

export default function SubscriptionPage() {
  const { gym } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await getActiveSubscriptionAPI();
      const data = (res as any)?.data;
      setPlans(Array.isArray(data) ? data : []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handlePurchase = async (plan: SubscriptionPlan) => {
    setPurchasing(plan.title);
    try {
      const res = (await generatePaymentAuthTokenAPI()) as any;
      const token = res?.data?.token ?? res?.token;
      if (!token) {
        setToast({ message: 'Failed to generate payment token', severity: 'error' });
        return;
      }
      const subID = plan.subID ?? gym?._id;
      const baseUrl = PAYMENT_URLS[plan.type ?? ''] ?? PAYMENT_BASE;
      window.open(`${baseUrl}?token=${token}&subID=${subID}`, '_blank');
    } catch {
      setToast({ message: 'Failed to initiate purchase', severity: 'error' });
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Subscription
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.25}>
          Manage your gym subscription plans
        </Typography>
      </Box>

      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rounded" height={220} />
            </Grid>
          ))}
        </Grid>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" mb={1}>
              No subscription plans available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please check back later for available plans.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {plans.map((plan) => (
            <Grid key={plan.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ height: 4, bgcolor: Colors.primary }} />
                <CardContent sx={{ flex: 1, p: 3, '&:last-child': { pb: 3 }, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" fontWeight={700} mb={2}>
                    {plan.title}
                  </Typography>
                  <Box sx={{ flex: 1, mb: 2.5 }}>
                    {plan.description.map((desc, idx) => (
                      <Typography
                        key={idx}
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.75, lineHeight: 1.6 }}
                      >
                        {desc}
                      </Typography>
                    ))}
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<PurchaseIcon />}
                    onClick={() => handlePurchase(plan)}
                    disabled={purchasing === plan.title}
                    sx={{ fontWeight: 600 }}
                  >
                    {purchasing === plan.title ? 'Processing...' : plan.btnText}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
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
