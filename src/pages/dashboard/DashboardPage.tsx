import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Skeleton,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  CalendarMonth as CalendarIcon,
  AttachMoney as MoneyIcon,
  Cake as CakeIcon,
  Event as EventIcon,
  AccessTime as ClockIcon,
  AccountBalance as WalletIcon,
  Warning as AlertIcon,
  People as PeopleIcon,
  PersonOff as PersonOffIcon,
  Block as BlockIcon,
  ChevronRight as ChevronIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { getMemberAnalyticsAPI } from '@/api/gym';
import type { AnalyticsSection, AnalyticsStat } from '@/api/types';
import { Colors } from '@/theme';
import { reportMapping, memberContextMap } from '@/config/dashboardFilter';

// Map server icon names to MUI icons
const iconMap: Record<string, React.ReactNode> = {
  'calendar-check': <CalendarIcon />,
  'cash-multiple': <MoneyIcon />,
  'cake-variant': <CakeIcon />,
  'calendar-alert': <EventIcon />,
  'account-clock': <ClockIcon />,
  cash: <MoneyIcon />,
  'wallet-outline': <WalletIcon />,
  'alert-circle-outline': <AlertIcon />,
  'account-check': <PeopleIcon />,
  'account-cancel': <PersonOffIcon />,
  'account-group': <PeopleIcon />,
  'account-lock': <BlockIcon />,
};

const colorMap: Record<string, string> = {
  green: Colors.status.active,
  red: Colors.status.expired,
};

const highlightTypes = new Set(['today_collection', 'currentMonthDueAmount']);

function formatValue(count: number, isCurrency: boolean, currency: string): string {
  if (isCurrency) {
    return `${currency}${count.toLocaleString()}`;
  }
  return count.toLocaleString();
}

function StatTile({
  stat,
  currency,
  onClick,
}: {
  stat: AnalyticsStat;
  currency: string;
  onClick?: () => void;
}) {
  const valueColor = stat.iconColor ? (colorMap[stat.iconColor] ?? Colors.primary) : Colors.primary;
  const isHighlighted = highlightTypes.has(stat.type);
  const icon = iconMap[stat.icon] ?? <CalendarIcon />;

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderColor: isHighlighted ? Colors.primary : 'divider',
        bgcolor: isHighlighted ? `${Colors.primary}08` : '#FAFAFA',
      }}
    >
      <CardActionArea sx={{ height: '100%' }} onClick={onClick}>
        <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
          {/* Top row: value + icon */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight={700} sx={{ color: valueColor }}>
              {formatValue(stat.count, stat.isCurrency, currency)}
            </Typography>
            <Box sx={{ color: Colors.primary, opacity: 0.6 }}>{icon}</Box>
          </Box>

          {/* Bottom row: label + chevron */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
            <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1 }}>
              {stat.name}
            </Typography>
            <ChevronIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [sections, setSections] = useState<AnalyticsSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMemberAnalyticsAPI()
      .then((res) => {
        setSections(res.data ?? []);
      })
      .catch(() => {
        // silently fail
      })
      .finally(() => setLoading(false));
  }, []);

  // TODO: get currency from gym profile context
  const currency = '₹';

  const handleTileClick = (type: string) => {
    const route = reportMapping[type];
    if (!route) return;
    if (route === '/members') {
      const ctx = memberContextMap[type] ?? '';
      navigate(ctx ? `/members?context=${encodeURIComponent(ctx)}` : '/members');
    } else {
      navigate(`${route}?context=${encodeURIComponent(type)}`);
    }
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={700} mb={3}>
          Dashboard
        </Typography>
        {[1, 2, 3].map((s) => (
          <Box key={s} mb={3}>
            <Skeleton variant="text" width={180} height={32} sx={{ mb: 1 }} />
            <Grid container spacing={1.5}>
              {[1, 2, 3, 4].map((i) => (
                <Grid key={i} size={{ xs: 6, sm: 6, md: 3 }}>
                  <Skeleton variant="rounded" height={80} />
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Dashboard
      </Typography>

      {sections.map((section) => (
        <Box key={section.header} mb={3}>
          <Typography variant="h6" fontWeight={700} color="#444" mb={1.5}>
            {section.header}
          </Typography>
          <Grid container spacing={1.5}>
            {section.child.map((stat) => (
              <Grid key={stat.type} size={{ xs: 6, sm: 6, md: 3 }}>
                <StatTile stat={stat} currency={currency} onClick={() => handleTileClick(stat.type)} />
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
}
