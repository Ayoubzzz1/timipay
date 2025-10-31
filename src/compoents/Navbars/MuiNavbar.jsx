import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Stack,
  Divider,
  Typography,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Box,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  VideoLibrary as VideoLibraryIcon,
  CalendarToday as CalendarTodayIcon,
  ShoppingCart as ShoppingCartIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Search as SearchIcon,
  CardGiftcard as RewardIcon,
  AccountBalanceWallet as WithdrawIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { supabase } from '../../lib/supabaseClient';
import {
  AppProvider,
  DashboardLayout,
  ThemeSwitcher,
  Account,
  AccountPreview,
  AccountPopoverFooter,
} from '@toolpad/core';
import { createTheme } from '@mui/material/styles';
import { useUser } from '../../contexts/UserContext';

// Create navigation with user session context
const createNavigation = (user, userData) => [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    segment: 'dashboard',
    title: 'Dashboard',
    icon: <DashboardIcon />,
    user: user,
    userData: userData,
  },
  {
    segment: 'videos-user',
    title: 'Videos',
    icon: <VideoLibraryIcon />,
    user: user,
    userData: userData,
  },
  {
    segment: 'reward',
    title: 'Reward',
    icon: <RewardIcon />,
    user: user,
    userData: userData,
  },
  {
    segment: 'withdraw',
    title: 'Withdraw',
    icon: <WithdrawIcon />,
    user: user,
    userData: userData,
  },
  {
    segment: 'historique',
    title: 'Historique',
    icon: <HistoryIcon />,
    user: user,
    userData: userData,
  },
  {
    kind: 'header',
    title: 'Settings',
  },
  {
    segment: 'settings',
    title: 'Settings',
    icon: <SettingsIcon />,
    user: user,
    userData: userData,
  },
  {
    segment: 'help',
    title: 'Help & Support',
    icon: <HelpIcon />,
    user: user,
    userData: userData,
  },
];

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function CustomToolbarActions({ searchValue, onSearchChange, userData, isLoading, error }) {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <TextField
        size="small"
        placeholder="Search your data..."
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{
          minWidth: 250,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            transition: 'box-shadow 0.15s ease',
            '&:focus-within': {
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            },
          },
        }}
      />
      <ThemeSwitcher />
    </Stack>
  );
}

function AccountSidebarPreview({ handleClick, open, mini }) {
  return (
    <Stack direction="column" p={0}>
      <Divider />
      <AccountPreview
        variant={mini ? 'condensed' : 'expanded'}
        handleClick={handleClick}
        open={open}
      />
    </Stack>
  );
}

function SidebarFooterAccountPopover({ user, userData, isLoading, error }) {
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
    try {
      document.cookie = 'tp_user=; path=/; max-age=0';
    } catch (error) {
      console.error('Cookie clear error:', error);
    }
    window.location.href = '/';
  };

  const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || userData?.name || 'User';
  const userEmail = user?.email || userData?.email || 'user@example.com';
  const userRole = userData?.role || 'User';
  const userBalance = userData?.balance || '0.00';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <Stack direction="column">
      <Typography variant="body2" mx={2} mt={1}>
        Account
      </Typography>
      
      {isLoading && (
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress size={20} />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mx: 2, mb: 1 }}>
          Failed to load user data
        </Alert>
      )}
      
      <MenuItem
        component="div"
        sx={{
          justifyContent: 'flex-start',
          width: '100%',
          columnGap: 2,
          cursor: 'default',
          '&:hover': {
            backgroundColor: 'transparent',
          },
        }}
      >
        <ListItemIcon>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              fontSize: '0.95rem',
              bgcolor: '#ffb300',
            }}
          >
            {userInitial}
          </Avatar>
        </ListItemIcon>
        <ListItemText
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            width: '100%',
          }}
          primary={userName}
          secondary={
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                {userEmail}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Role: {userRole}
              </Typography>
              <Typography variant="caption" color="primary.main" fontWeight="medium">
                Balance: ${userBalance}
              </Typography>
            </Stack>
          }
          primaryTypographyProps={{ variant: 'body2' }}
        />
      </MenuItem>
      <Divider />
      <AccountPopoverFooter>
        <button
          onClick={handleSignOut}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 16px',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            color: 'inherit',
            fontSize: '0.875rem',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          Sign Out
        </button>
      </AccountPopoverFooter>
    </Stack>
  );
}

function SidebarFooterAccount({ mini, user, userData, isLoading, error }) {
  const PreviewComponent = React.useCallback(
    (props) => <AccountSidebarPreview {...props} mini={mini} />,
    [mini]
  );

  const PopoverContent = React.useCallback(
    (props) => <SidebarFooterAccountPopover {...props} user={user} userData={userData} isLoading={isLoading} error={error} />,
    [user, userData, isLoading, error]
  );

  return (
    <Account
      slots={{
        preview: PreviewComponent,
        popoverContent: PopoverContent,
      }}
      slotProps={{
        popover: {
          transformOrigin: { horizontal: 'left', vertical: 'bottom' },
          anchorOrigin: { horizontal: 'right', vertical: 'bottom' },
          disableAutoFocus: true,
          slotProps: {
            paper: {
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: (theme) =>
                  `drop-shadow(0px 2px 8px ${
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.10)'
                      : 'rgba(0,0,0,0.32)'
                  })`,
                mt: 1,
                '&::before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  bottom: 10,
                  left: 0,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translate(-50%, -50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            },
          },
        },
      }}
    />
  );
}

function MuiNavbar({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get user data from context
  const { user, userData, isLoading, error } = useUser();
  
  // State for search functionality
  const [searchValue, setSearchValue] = React.useState('');
  
  // Handle search functionality
  const handleSearchChange = React.useCallback((value) => {
    setSearchValue(value);
    
    // Search within user's own data
    if (userData && value.trim()) {
      const searchTerm = value.toLowerCase();
      const searchableFields = [
        userData.name,
        userData.email,
        userData.role,
        userData.balance?.toString(),
        userData.created_at
      ].filter(Boolean);
      
      const matches = searchableFields.some(field => 
        field.toLowerCase().includes(searchTerm)
      );
      
      console.log('Search query:', value, 'Matches found:', matches);
    }
  }, [userData]);
  
  // Create navigation with user session data
  const navigationWithUser = React.useMemo(() => {
    return createNavigation(user, userData);
  }, [user, userData]);

  // Enhanced navigation with search filtering
  const filteredNavigation = React.useMemo(() => {
    if (!searchValue.trim()) return navigationWithUser;
    
    return navigationWithUser.filter(item => {
      if (item.kind === 'header') return true;
      return item.title.toLowerCase().includes(searchValue.toLowerCase());
    });
  }, [searchValue, navigationWithUser]);

  // Memoized session object
  const session = React.useMemo(() => {
    if (!user) return null;
    return {
      user: {
        name: user?.user_metadata?.name || user?.user_metadata?.full_name || userData?.name || 'User',
        email: user?.email || userData?.email || 'user@example.com',
        image: null,
      },
    };
  }, [user, userData]);

  // Memoized router object with React Router navigation
  const router = React.useMemo(() => {
    return {
      pathname: location.pathname,
      searchParams: new URLSearchParams(location.search),
      navigate: (path) => {
        navigate(String(path));
      },
    };
  }, [location.pathname, location.search, navigate]);

  // Memoized authentication object
  const authentication = React.useMemo(() => {
    return {
      signIn: () => {},
      signOut: async () => {
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.error('Sign out error:', error);
        }
        try {
          document.cookie = 'tp_user=; path=/; max-age=0';
        } catch (error) {
          console.error('Cookie clear error:', error);
        }
        window.location.href = '/';
      },
    };
  }, []);

  // Memoized toolbar actions component
  const ToolbarActions = React.useCallback(
    (props) => (
      <CustomToolbarActions
        {...props}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        userData={userData}
        isLoading={isLoading}
        error={error}
      />
    ),
    [searchValue, handleSearchChange, userData, isLoading, error]
  );

  // Memoized sidebar footer component
  const SidebarFooter = React.useCallback(
    (props) => (
      <SidebarFooterAccount
        {...props}
        user={user}
        userData={userData}
        isLoading={isLoading}
        error={error}
      />
    ),
    [user, userData, isLoading, error]
  );

  return (
    <AppProvider
      navigation={filteredNavigation}
      router={router}
      theme={demoTheme}
      authentication={authentication}
      session={session}
    >
      <DashboardLayout
        slots={{
          toolbarActions: ToolbarActions,
          sidebarFooter: SidebarFooter,
        }}
        slotProps={{
          sidebar: {
            sx: {
              '& .MuiListItemButton-root': {
                transition: 'background-color 0.15s ease',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                '&:active': {
                  transition: 'none',
                },
              },
            },
          },
        }}
      >
        {children}
      </DashboardLayout>
    </AppProvider>
  );
}

export default MuiNavbar;