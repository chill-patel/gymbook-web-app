import { Box, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  AttachMoney as SalesIcon,
  AccountBalanceWallet as DueIcon,
  FitnessCenter as PtIcon,
  PersonAdd as AdmissionIcon,
  Fingerprint as AttendanceIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { Colors } from '@/theme';

const reportCards = [
  { label: 'Sales Report', description: 'Collection & payment invoices', icon: <SalesIcon />, path: '/reports/sales' },
  { label: 'Plan Due Report', description: 'Outstanding plan dues', icon: <DueIcon />, path: '/reports/plan-due' },
  { label: 'PT Plan Due Report', description: 'Personal training plan dues', icon: <PtIcon />, path: '/reports/pt-plan-due' },
  { label: 'Admission Report', description: 'Admission fee collection', icon: <AdmissionIcon />, path: '/reports/admission' },
  { label: 'Attendance Report', description: 'Daily punch-in/out records', icon: <AttendanceIcon />, path: '/reports/attendance' },
];

export default function ReportsPage() {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Reports
      </Typography>
      <Grid container spacing={2}>
        {reportCards.map((card) => (
          <Grid key={card.path} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea onClick={() => navigate(card.path)} sx={{ height: '100%' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Box sx={{ color: Colors.primary, opacity: 0.7 }}>{card.icon}</Box>
                    <Typography variant="body1" fontWeight={600}>
                      {card.label}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {card.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
