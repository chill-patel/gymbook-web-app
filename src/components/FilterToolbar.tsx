import { Box, Card, LinearProgress } from '@mui/material';
import type { ReactNode } from 'react';

interface FilterToolbarProps {
  loading?: boolean;
  children: ReactNode;
}

export default function FilterToolbar({ loading, children }: FilterToolbarProps) {
  return (
    <Card sx={{ mb: 2 }}>
      <Box sx={{ p: 2, display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
        {children}
      </Box>
      {loading && <LinearProgress sx={{ height: 2 }} />}
    </Card>
  );
}
