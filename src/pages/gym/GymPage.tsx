import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import {
  CardMembership as PlansIcon,
  FitnessCenter as ServicesIcon,
  SportsKabaddi as PtPlanIcon,
  Groups as BatchIcon,
  Sms as SmsIcon,
  Language as LanguageIcon,
  CurrencyExchange as CurrencyIcon,
  AdminPanelSettings as AdminIcon,
  Receipt as InvoiceIcon,
  HelpOutline as HelpIcon,
  ChevronRight as ChevronIcon,
  Edit as EditIcon,
  BugReport as ReportIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/theme';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  value?: string | number;
  disabled?: boolean;
}

function MenuSection({ title, items }: { title: string; items: MenuItem[] }) {
  const navigate = useNavigate();

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ pb: '0 !important', px: 0 }}>
        <Typography variant="body1" fontWeight={600} sx={{ px: 2, pb: 1 }}>
          {title}
        </Typography>
        <List disablePadding>
          {items.map((item, idx) => (
            <Box key={item.label}>
              {idx > 0 && <Divider sx={{ mx: 2 }} />}
              <ListItemButton
                onClick={() => item.path && navigate(item.path)}
                disabled={item.disabled}
                sx={{ px: 2, py: 1.25 }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: Colors.primary }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ variant: 'body1' }}
                />
                {item.value != null && (
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    {item.value}
                  </Typography>
                )}
                <ChevronIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </ListItemButton>
            </Box>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export default function GymPage() {
  const { gym } = useAuth();

  const managePlans: MenuItem[] = [
    {
      label: 'Membership Plans',
      icon: <PlansIcon />,
      path: '/gym/plans',
      value: gym?.totalPackage ?? 0,
    },
    {
      label: 'PT Plans',
      icon: <PtPlanIcon />,
      path: '/gym/pt-plans',
      value: gym?.totalPtPlan ?? 0,
      disabled: true,
    },
    {
      label: 'Gym Services',
      icon: <ServicesIcon />,
      path: '/gym/services',
      value: gym?.totalService ?? 0,
      disabled: true,
    },
    {
      label: 'Batches',
      icon: <BatchIcon />,
      path: '/gym/batches',
      disabled: true,
    },
  ];

  const gymSettings: MenuItem[] = [
    {
      label: 'SMS / WhatsApp Settings',
      icon: <SmsIcon />,
      path: '/gym/sms-settings',
      disabled: true,
    },
    {
      label: 'Staff Management',
      icon: <AdminIcon />,
      path: '/gym/staff',
      disabled: true,
    },
    {
      label: 'Invoice Settings',
      icon: <InvoiceIcon />,
      path: '/gym/invoice-settings',
      disabled: true,
    },
  ];

  const appPreferences: MenuItem[] = [
    {
      label: 'Language',
      icon: <LanguageIcon />,
      path: '/gym/language',
      disabled: true,
    },
    {
      label: 'Currency',
      icon: <CurrencyIcon />,
      path: '/gym/currency',
      disabled: true,
    },
  ];

  const support: MenuItem[] = [
    {
      label: 'Report Issue',
      icon: <ReportIcon />,
      disabled: true,
    },
    {
      label: 'Help & Support',
      icon: <HelpIcon />,
      disabled: true,
    },
  ];

  return (
    <Box>
      {/* Gym Header / Profile Card */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={gym?.logo}
              sx={{
                width: 72,
                height: 72,
                bgcolor: Colors.primary,
                fontSize: 28,
              }}
            >
              {(gym?.gymName ?? gym?.subName ?? 'G').charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" fontWeight={700} noWrap>
                {gym?.gymName ?? gym?.subName}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {gym?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {gym?.email}
              </Typography>
              {gym?.mobile && (
                <Typography variant="body2" color="text.secondary" noWrap>
                  +{gym.callingCode ?? ''} {gym.mobile}
                </Typography>
              )}
            </Box>
            <Box>
              <EditIcon sx={{ color: 'text.secondary', cursor: 'pointer' }} />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Menu Sections */}
      <MenuSection title="Manage Plans" items={managePlans} />
      <MenuSection title="Gym Settings" items={gymSettings} />
      <MenuSection title="App Preferences" items={appPreferences} />
      <MenuSection title="Support" items={support} />
    </Box>
  );
}
