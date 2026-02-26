import { Card, CardContent, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card>
      <CardContent sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" mb={1}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" mb={action ? 3 : 0}>
            {description}
          </Typography>
        )}
        {action}
      </CardContent>
    </Card>
  );
}
