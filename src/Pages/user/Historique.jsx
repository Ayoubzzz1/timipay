import React from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { History, TrendingUp, TrendingDown, AttachMoney } from '@mui/icons-material';
import MuiNavbar from '../../compoents/Navbars/MuiNavbar';
import { useUser } from '../../contexts/UserContext';

function Historique() {
  const { user, userData } = useUser();
  // Mock transaction data
  const transactions = [
    {
      id: 1,
      type: 'Earning',
      amount: '+$25.50',
      description: 'Video view reward',
      date: '2024-01-15',
      status: 'Completed',
      color: 'success'
    },
    {
      id: 2,
      type: 'Withdrawal',
      amount: '-$50.00',
      description: 'PayPal withdrawal',
      date: '2024-01-14',
      status: 'Processing',
      color: 'warning'
    },
    {
      id: 3,
      type: 'Earning',
      amount: '+$15.75',
      description: 'Referral bonus',
      date: '2024-01-13',
      status: 'Completed',
      color: 'success'
    },
    {
      id: 4,
      type: 'Earning',
      amount: '+$8.25',
      description: 'Daily login bonus',
      date: '2024-01-12',
      status: 'Completed',
      color: 'success'
    },
    {
      id: 5,
      type: 'Withdrawal',
      amount: '-$30.00',
      description: 'Bank transfer',
      date: '2024-01-10',
      status: 'Completed',
      color: 'success'
    }
  ];

  return (
    <MuiNavbar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            <History sx={{ mr: 2, verticalAlign: 'middle' }} />
            Transaction History
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            View all your earnings, withdrawals, and account activities
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <TrendingUp color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Earnings</Typography>
                </Box>
                <Typography variant="h4" color="success.main" gutterBottom>
                  $89.50
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This month
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <TrendingDown color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Withdrawals</Typography>
                </Box>
                <Typography variant="h4" color="error.main" gutterBottom>
                  $80.00
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This month
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <AttachMoney color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Net Balance</Typography>
                </Box>
                <Typography variant="h4" color="primary.main" gutterBottom>
                  $9.50
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current balance
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <History color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">Transactions</Typography>
                </Box>
                <Typography variant="h4" color="info.main" gutterBottom>
                  {transactions.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This month
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Transactions
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <Chip
                              label={transaction.type}
                              color={transaction.color}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              color={transaction.type === 'Earning' ? 'success.main' : 'error.main'}
                              fontWeight="medium"
                            >
                              {transaction.amount}
                            </Typography>
                          </TableCell>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell>
                            <Chip
                              label={transaction.status}
                              color={transaction.status === 'Completed' ? 'success' : 'warning'}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </MuiNavbar>
  );
}

export default Historique;
