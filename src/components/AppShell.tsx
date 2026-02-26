import { useState } from 'react';
import { Outlet } from 'react-router';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assessment as ReportsIcon,
  Logout as LogoutIcon,
  FitnessCenter as GymIcon,
  StoreMallDirectory as GymSettingsIcon,
  ContactPhone as EnquiriesIcon,
  Receipt as ExpensesIcon,
  SwapHoriz as SwitchIcon,
  CardMembership as SubscriptionIcon,
  Lock as LockIcon,
  HelpOutline as HelpIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { logoutAPI } from '@/api/auth';

const DRAWER_WIDTH = 260;

const mainNavItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { label: 'Members', icon: <PeopleIcon />, path: '/members' },
  { label: 'Gym', icon: <GymSettingsIcon />, path: '/gym' },
  { label: 'Enquiries', icon: <EnquiriesIcon />, path: '/visitors' },
  { label: 'Expenses', icon: <ExpensesIcon />, path: '/expenses' },
  { label: 'Reports', icon: <ReportsIcon />, path: '/reports' },
];

const managementItems = [
  { label: 'Manage Branch', icon: <SwitchIcon />, path: '/branches' },
  { label: 'Subscription', icon: <SubscriptionIcon />, path: '/subscription' },
];

const accountItems = [
  { label: 'Forgot Password', icon: <LockIcon />, path: '/forgot-password' },
  { label: 'Help & Support', icon: <HelpIcon />, path: '/help' },
];

export default function AppShell() {
  const { gym, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogout = async () => {
    try {
      await logoutAPI();
    } catch {
      // ignore
    }
    logout();
    navigate('/login');
  };

  const isSelected = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const navLink = (item: { label: string; icon: React.ReactNode; path: string }) => (
    <ListItemButton
      key={item.path}
      selected={isSelected(item.path)}
      onClick={() => { navigate(item.path); setMobileOpen(false); }}
      sx={{ borderRadius: 2, mb: 0.5 }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
      <ListItemText primary={item.label} primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} />
    </ListItemButton>
  );

  const sectionLabel = (text: string) => (
    <Typography
      variant="caption"
      color="text.secondary"
      fontWeight={600}
      sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}
    >
      {text}
    </Typography>
  );

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ gap: 1.5, px: 2 }}>
        <GymIcon color="primary" />
        <Typography variant="h6" noWrap color="primary" fontWeight={700}>
          GymBook
        </Typography>
      </Toolbar>
      <Divider />
      <Box
        sx={{
          px: 2,
          py: 1.5,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          '&:hover': { bgcolor: 'action.hover' },
        }}
        onClick={() => { navigate('/branches'); setMobileOpen(false); }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {gym?.subName ?? 'Select Branch'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {gym?.admin?.email ?? gym?.email}
          </Typography>
        </Box>
        <SwitchIcon sx={{ fontSize: 18, color: 'text.disabled', ml: 1, flexShrink: 0 }} />
      </Box>
      <Divider />
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ px: 1, pt: 1 }}>
          {mainNavItems.map(navLink)}
        </List>
        <Divider sx={{ mx: 2 }} />
        {sectionLabel('Management')}
        <List sx={{ px: 1, pt: 0 }}>
          {managementItems.map(navLink)}
        </List>
        <Divider sx={{ mx: 2 }} />
        {sectionLabel('Account')}
        <List sx={{ px: 1, pt: 0 }}>
          {accountItems.map(navLink)}
          {gym?.isAdmin && (
            <ListItemButton
              selected={isSelected('/delete-account')}
              onClick={() => { navigate('/delete-account'); setMobileOpen(false); }}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}><DeleteIcon color="error" /></ListItemIcon>
              <ListItemText primary="Delete Account" primaryTypographyProps={{ variant: 'body2', fontWeight: 500, color: 'error' }} />
            </ListItemButton>
          )}
        </List>
      </Box>
      <Divider />
      <List sx={{ px: 1, pb: 1 }}>
        <ListItemButton
          onClick={() => { handleLogout(); setMobileOpen(false); }}
          sx={{ borderRadius: 2 }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}><LogoutIcon color="error" /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ variant: 'body2', fontWeight: 500, color: 'error' }} />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar — responsive */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: 0 }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, borderRight: '1px solid', borderColor: 'divider' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ flex: 1 }} />
            <Tooltip title="Switch Branch">
              <Button
                variant="outlined"
                size="small"
                startIcon={<SwitchIcon />}
                onClick={() => navigate('/branches')}
                sx={{ mr: 1.5, textTransform: 'none', fontWeight: 600 }}
              >
                {gym?.subName ?? 'Select Branch'}
              </Button>
            </Tooltip>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar
                sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}
              >
                {(gym?.admin?.name ?? gym?.subName ?? 'G').charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={!!anchorEl}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem onClick={() => { setAnchorEl(null); navigate('/branches'); }}>
                <ListItemIcon>
                  <SwitchIcon fontSize="small" />
                </ListItemIcon>
                Switch Branch
              </MenuItem>
              <MenuItem onClick={() => { setAnchorEl(null); navigate('/subscription'); }}>
                <ListItemIcon>
                  <SubscriptionIcon fontSize="small" />
                </ListItemIcon>
                Subscription
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ flex: 1, p: 3, bgcolor: 'background.default' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
