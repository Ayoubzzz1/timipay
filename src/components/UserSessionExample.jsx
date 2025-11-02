import React from 'react';
import { Box, Typography, Card, CardContent, Chip, Button } from '@mui/material';
import { useUserSession } from '../../hooks/useUserSession';

/**
 * Example component demonstrating how to access user session credentials
 * in any sidebar or page component
 */
function UserSessionExample() {
  const { 
    user, 
    userData, 
    session, 
    isLoading, 
    error, 
    hasRole, 
    hasMinimumBalance 
  } = useUserSession();

  if (isLoading) {
    return <Typography>Loading user session...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  if (!session.isAuthenticated) {
    return <Typography>User not authenticated</Typography>;
  }

  return (
    <Card sx={{ maxWidth: 400, m: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          User Session Data
        </Typography>
        
        {/* Basic User Info */}
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary">
            Name: {session.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Email: {session.email}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            User ID: {session.userId}
          </Typography>
        </Box>

        {/* User Role */}
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary">
            Role: 
          </Typography>
          <Chip 
            label={session.role || 'User'} 
            color={hasRole('Premium User') ? 'primary' : 'default'}
            size="small"
          />
        </Box>

        {/* Balance */}
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary">
            Balance: ${session.balance || '0.00'}
          </Typography>
          {hasMinimumBalance(100) && (
            <Chip label="High Balance" color="success" size="small" />
          )}
        </Box>

        {/* Authentication Status */}
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary">
            Status: 
          </Typography>
          <Chip 
            label={session.emailVerified ? 'Verified' : 'Unverified'} 
            color={session.emailVerified ? 'success' : 'warning'}
            size="small"
          />
        </Box>

        {/* Session Tokens (for debugging - remove in production) */}
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary">
            Access Token: {session.accessToken ? 'Available' : 'Not Available'}
          </Typography>
        </Box>

        {/* Example Actions */}
        <Box>
          <Button 
            variant="outlined" 
            size="small" 
            disabled={!hasMinimumBalance(10)}
          >
            Withdraw (Min $10)
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default UserSessionExample;






