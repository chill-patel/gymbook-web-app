import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface DetailRowProps {
  icon: ReactNode;
  text: string;
}

export default function DetailRow({ icon, text }: DetailRowProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <Box sx={{ display: 'flex', fontSize: 15, color: 'text.disabled' }}>{icon}</Box>
      <Typography variant="body2" color="text.secondary">{text}</Typography>
    </Box>
  );
}
