import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  AccountBalanceWallet as WalletIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import MuiNavbar from '../../compoents/Navbars/MuiNavbar';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../lib/supabaseClient';

function Dashboard() {
  const { user, userData, isLoading: userLoading, error: userError, refreshUserData } = useUser();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [realUserData, setRealUserData] = useState(null);
  const [isLoadingRealData, setIsLoadingRealData] = useState(true);
  const [realDataError, setRealDataError] = useState(null);

  // Fetch real user data from data_user table
  const fetchRealUserData = async () => {
    if (!user?.id) {
      setIsLoadingRealData(false);
      return;
    }

    try {
      setIsLoadingRealData(true);
      setRealDataError(null);

      // Try different approaches to find the user data
      let data = null;
      let error = null;

      // First try: search by id field
      const { data: dataById, error: errorById } = await supabase
        .from('data_user')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!errorById && dataById) {
        data = dataById;
      } else {
        // Second try: search by user_id field
        const { data: dataByUserId, error: errorByUserId } = await supabase
          .from('data_user')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!errorByUserId && dataByUserId) {
          data = dataByUserId;
        } else {
          // Third try: search by email
          const { data: dataByEmail, error: errorByEmail } = await supabase
            .from('data_user')
            .select('*')
            .eq('email', user.email)
            .single();

          if (!errorByEmail && dataByEmail) {
            data = dataByEmail;
          } else {
            // If no data found, that's okay - user might not exist in data_user table yet
            console.log('No user data found in data_user table for user:', user.id);
            setRealUserData(null);
            setIsLoadingRealData(false);
            return;
          }
        }
      }

      console.log('Real user data fetched:', data);
      setRealUserData(data);
    } catch (err) {
      console.error('Error fetching real user data:', err);
      setRealDataError(err.message);
    } finally {
      setIsLoadingRealData(false);
    }
  };

  useEffect(() => {
    fetchRealUserData();
  }, [user]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshUserData(),
        fetchRealUserData()
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Test function to check database connection
  const testDatabaseConnection = async () => {
    try {
      console.log('Testing database connection...');
      const { data, error } = await supabase
        .from('data_user')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('Database connection error:', error);
        alert('Database connection failed: ' + error.message);
      } else {
        console.log('Database connection successful:', data);
        alert('Database connection successful! Found ' + (data?.length || 0) + ' records.');
      }
    } catch (err) {
      console.error('Database test error:', err);
      alert('Database test failed: ' + err.message);
    }
  };

  // Calculate membership duration
  const getMembershipDuration = () => {
    const createdDate = realUserData?.created_at || userData?.created_at;
    if (!createdDate) return 'Unknown';
    
    const created = new Date(createdDate);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  // Get display data (prioritize real data, fallback to context data)
  const displayData = {
    name: realUserData?.name || realUserData?.username || realUserData?.full_name || userData?.name || user?.user_metadata?.name || 'User',
    email: realUserData?.email || realUserData?.email_address || userData?.email || user?.email || 'No email provided',
    role: realUserData?.role || realUserData?.user_role || userData?.role || 'User',
    balance: '125.50', // Static balance as requested
    created_at: realUserData?.created_at || userData?.created_at,
    phone: realUserData?.phone || realUserData?.phone_number || 'Not provided',
    status: realUserData?.status || realUserData?.user_status || 'Active'
  };

  return (
    <MuiNavbar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center">
              <DashboardIcon sx={{ mr: 2, fontSize: 32 }} color="primary" />
              <Typography variant="h4" component="h1">
                Dashboard
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={isRefreshing || userLoading || isLoadingRealData}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </Box>
          <Typography variant="subtitle1" color="text.secondary">
            Your personal dashboard and account information
          </Typography>
        </Box>

        {/* Loading State */}
        {(userLoading || isLoadingRealData) && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Loading your account information...
            </Typography>
          </Box>
        )}

        {/* Error State */}
        {(userError || realDataError) && (
          <Alert severity="error" sx={{ mb: 4 }}>
            Error loading account data: {userError || realDataError}
          </Alert>
        )}

        {/* Account Statistics Cards */}
        {(userData || realUserData) && !userLoading && !isLoadingRealData && (
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <WalletIcon color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h4" color="primary">
                        ${displayData.balance}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Account Balance
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <SecurityIcon color="success" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h4" color="success.main">
                        {displayData.role}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Account Role
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <CalendarIcon color="info" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h4" color="info.main">
                        {getMembershipDuration()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Member Since
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <PersonIcon color="warning" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h4" color="warning.main">
                        {displayData.status}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Account Status
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Account Information Section */}
        {(userData || realUserData) && !userLoading && !isLoadingRealData && (
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <InfoIcon sx={{ mr: 2 }} color="primary" />
                <Typography variant="h6">
                  Account Information
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                {/* Profile Section */}
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" mb={3}>
                    <Avatar 
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        fontSize: '2rem',
                        bgcolor: 'primary.main',
                        mr: 3
                      }}
                    >
                      {displayData.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" gutterBottom>
                        {displayData.name}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        {displayData.email}
                      </Typography>
                      <Chip 
                        label={displayData.role} 
                        color="primary" 
                        size="small"
                      />
                    </Box>
                  </Box>
                </Grid>

                {/* Account Details */}
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Email Address"
                        secondary={displayData.email}
                      />
                    </ListItem>
                    
                    <Divider />
                    
                    <ListItem>
                      <ListItemIcon>
                        <SecurityIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Account Role"
                        secondary={displayData.role}
                      />
                    </ListItem>
                    
                    <Divider />
                    
                    <ListItem>
                      <ListItemIcon>
                        <WalletIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Account Balance"
                        secondary={`$${displayData.balance}`}
                      />
                    </ListItem>
                    
                    <Divider />
                    
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Member Since"
                        secondary={
                          displayData.created_at 
                            ? new Date(displayData.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'Unknown'
                        }
                      />
                    </ListItem>

                    {displayData.phone !== 'Not provided' && (
                      <>
                        <Divider />
                        <ListItem>
                          <ListItemIcon>
                            <PersonIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Phone Number"
                            secondary={displayData.phone}
                          />
                        </ListItem>
                      </>
                    )}
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && (
          <Card sx={{ mb: 4, bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Debug Information
              </Typography>
              <Box sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                <Typography variant="body2" gutterBottom>
                  <strong>User ID:</strong> {user?.id || 'Not available'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>User Email:</strong> {user?.email || 'Not available'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Real User Data:</strong> {realUserData ? 'Found' : 'Not found'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Context User Data:</strong> {userData ? 'Found' : 'Not found'}
                </Typography>
                {realUserData && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Available fields in realUserData:</strong>
                    </Typography>
                    <pre style={{ fontSize: '0.7rem', overflow: 'auto' }}>
                      {JSON.stringify(realUserData, null, 2)}
                    </pre>
                  </Box>
                )}
              </Box>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={testDatabaseConnection}
                sx={{ mt: 2 }}
              >
                Test Database Connection
              </Button>
            </CardContent>
          </Card>
        )}

        {/* No Data State */}
        {!userData && !realUserData && !userLoading && !isLoadingRealData && !userError && !realDataError && (
          <Card>
            <CardContent>
              <Box textAlign="center" py={4}>
                <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Account Data Available
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  We couldn't find your account information. Please try refreshing or contact support.
                </Typography>
                <Button variant="contained" onClick={handleRefresh}>
                  Refresh Data
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
    </MuiNavbar>
  );
}

export default Dashboard;