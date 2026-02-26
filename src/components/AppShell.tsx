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
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { logoutAPI } from '@/api/auth';

const DRAWER_WIDTH = 260;

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { label: 'Members', icon: <PeopleIcon />, path: '/members' },
  { label: 'Gym', icon: <GymSettingsIcon />, path: '/gym' },
  { label: 'Enquiries', icon: <EnquiriesIcon />, path: '/visitors' },
  { label: 'Expenses', icon: <ExpensesIcon />, path: '/expenses' },
  { label: 'Reports', icon: <ReportsIcon />, path: '/reports' },
  { label: 'Subscription', icon: <SubscriptionIcon />, path: '/subscription' },
  { label: 'Manage Branch', icon: <SwitchIcon />, path: '/branches' },
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

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ gap: 1.5, px: 2 }}>
        <GymIcon color="primary" />
        <Typography variant="h6" noWrap color="primary" fontWeight={700}>
          GymBook
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flex: 1, px: 1, pt: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path)
            }
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <List sx={{ px: 1, pb: 1 }}>
        <ListItemButton
          onClick={() => { handleLogout(); setMobileOpen(false); }}
          sx={{ borderRadius: 2 }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
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
