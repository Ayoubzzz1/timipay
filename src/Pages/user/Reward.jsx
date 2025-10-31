import React from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Chip } from '@mui/material';
import { CardGiftcard, Star, TrendingUp } from '@mui/icons-material';
import MuiNavbar from '../../compoents/Navbars/MuiNavbar';
import { useUser } from '../../contexts/UserContext';

function Reward() {
  const { user, userData } = useUser();
  return (
    <MuiNavbar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            <CardGiftcard sx={{ mr: 2, verticalAlign: 'middle' }} />
            Rewards Center
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Earn and redeem rewards for your activities
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Star color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Available Rewards</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  You have 1,250 reward points available to redeem.
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip label="Gift Cards" color="primary" />
                  <Chip label="Discounts" color="secondary" />
                  <Chip label="Premium Features" color="success" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <TrendingUp color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">Earning History</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Track your reward earning activities and progress.
                </Typography>
                <Typography variant="body2">
                  • Video views: +50 points
                </Typography>
                <Typography variant="body2">
                  • Daily login: +25 points
                </Typography>
                <Typography variant="body2">
                  • Referral bonus: +100 points
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </MuiNavbar>
  );
}

export default Reward;
