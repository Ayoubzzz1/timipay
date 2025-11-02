import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Chip, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { CardGiftcard, Star, TrendingUp, History } from '@mui/icons-material';
import MuiNavbar from '../../compoents/Navbars/MuiNavbar';
import { useUser } from '../../contexts/UserContext';
import { getUserPoints, getPointsHistory } from '../../utils/pointsUtils';

function Reward() {
  const { user } = useUser();
  const [points, setPoints] = useState(0);
  const [adsWatched, setAdsWatched] = useState(0);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's points and history from database
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch points
        const pointsResult = await getUserPoints(user.id);
        if (pointsResult.error) {
          console.error('Error loading points:', pointsResult.error);
        } else {
          setPoints(pointsResult.points);
          setAdsWatched(pointsResult.adsWatched);
        }

        // Fetch history
        const historyResult = await getPointsHistory(user.id, 20);
        if (historyResult.error) {
          console.error('Error loading history:', historyResult.error);
        } else {
          setHistory(historyResult.history || []);
        }
      } catch (err) {
        console.error('Exception loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Refresh points every 5 seconds to catch updates
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

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
                {isLoading ? (
                  <Box display="flex" alignItems="center" gap={2}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">
                      Loading points...
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Typography variant="h4" color="primary" fontWeight="bold" paragraph>
                      {points.toLocaleString()} points
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      You have {points.toLocaleString()} reward points available to redeem.
                    </Typography>
                  </>
                )}
                <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
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
                  <Typography variant="h6">Statistics</Typography>
                </Box>
                {isLoading ? (
                  <Box display="flex" alignItems="center" gap={2}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">
                      Loading statistics...
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Typography variant="h6" color="primary" fontWeight="bold" paragraph>
                      {adsWatched.toLocaleString()} Ads Watched
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      You have watched {adsWatched.toLocaleString()} ads and earned points.
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <History color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Points History</Typography>
                </Box>
                {isLoading ? (
                  <Box display="flex" alignItems="center" gap={2}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">
                      Loading history...
                    </Typography>
                  </Box>
                ) : history.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No history yet. Watch videos with ads to earn points!
                  </Typography>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Date</strong></TableCell>
                          <TableCell><strong>Points</strong></TableCell>
                          <TableCell><strong>Action</strong></TableCell>
                          <TableCell><strong>Description</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {history.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString()}
                            </TableCell>
                            <TableCell>
                              <Typography color="success.main" fontWeight="bold">
                                +{Number(item.points_added).toFixed(0)}
                              </Typography>
                            </TableCell>
                            <TableCell>{item.action_type || 'ad_watch'}</TableCell>
                            <TableCell>{item.description || 'User watched an ad'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </MuiNavbar>
  );
}

export default Reward;
