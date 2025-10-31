import React from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Button, TextField, Alert } from '@mui/material';
import { AccountBalanceWallet, Send, History } from '@mui/icons-material';
import MuiNavbar from '../../compoents/Navbars/MuiNavbar';
import { useUser } from '../../contexts/UserContext';

function Withdraw() {
  const { user, userData } = useUser();
  return (
    <MuiNavbar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            <AccountBalanceWallet sx={{ mr: 2, verticalAlign: 'middle' }} />
            Withdraw Funds
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Transfer your earnings to your preferred payment method
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Withdrawal Request
                </Typography>
                
                <Box component="form" sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    placeholder="0.00"
                    margin="normal"
                    InputProps={{
                      startAdornment: '$',
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Payment Method"
                    select
                    margin="normal"
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="">Select payment method</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="crypto">Cryptocurrency</option>
                  </TextField>
                  
                  <TextField
                    fullWidth
                    label="Account Details"
                    placeholder="Enter your account information"
                    margin="normal"
                    multiline
                    rows={3}
                  />
                  
                  <Box mt={3}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Send />}
                      fullWidth
                    >
                      Request Withdrawal
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: 'fit-content' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Balance
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  $125.50
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Available for withdrawal
                </Typography>
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  Minimum withdrawal amount: $10.00
                </Alert>
              </CardContent>
            </Card>

            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <History color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Recent Withdrawals</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  No recent withdrawals
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </MuiNavbar>
  );
}

export default Withdraw;
