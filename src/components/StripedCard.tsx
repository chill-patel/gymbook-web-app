import { Box, Card } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import type { ReactNode } from 'react';
import { Layout } from '@/theme';

interface StripedCardProps {
  stripeColor: string;
  children: ReactNode;
  sx?: SxProps<Theme>;
}

export default function StripedCard({ stripeColor, children, sx }: StripedCardProps) {
  return (
    <Card sx={{ display: 'flex', overflow: 'hidden', height: '100%', ...sx }}>
      <Box sx={{ width: Layout.cardStripeWidth, bgcolor: stripeColor, flexShrink: 0 }} />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
    </Card>
  );
}
