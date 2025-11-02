import React, { useState } from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, TextField, Button } from '@mui/material';
import { PlayArrow, Settings } from '@mui/icons-material';
import MuiNavbar from '../../compoents/Navbars/MuiNavbar';
import { useUser } from '../../contexts/UserContext';
import RewardedPipPlayer from '../../components/RewardedPipPlayer/RewardedPipPlayer';

function RewardedPlayer() {
  const { user } = useUser();
  const [videoUrl, setVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [customUrl, setCustomUrl] = useState('');

  const handleLoadVideo = () => {
    if (customUrl.trim()) {
      setVideoUrl(customUrl.trim());
    }
  };

  if (!user) {
    return (
      <MuiNavbar>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h6" color="error">
            Please sign in to access the rewarded player.
          </Typography>
        </Container>
      </MuiNavbar>
    );
  }

  return (
    <MuiNavbar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            <PlayArrow sx={{ mr: 2, verticalAlign: 'middle' }} />
            Rewarded Video Player
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Watch videos and earn points by viewing ads
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box mb={2}>
                  <Typography variant="h6" gutterBottom>
                    Player Settings
                  </Typography>
                  <Box display="flex" gap={2} mb={2}>
                    <TextField
                      fullWidth
                      label="Video URL (optional)"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="Enter a video URL to play a custom video"
                      variant="outlined"
                      size="small"
                    />
                    <Button
                      variant="contained"
                      onClick={handleLoadVideo}
                      disabled={!customUrl.trim()}
                    >
                      Load Video
                    </Button>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Leave empty to use the default sample video
                  </Typography>
                </Box>

                <RewardedPipPlayer videoSrc={videoUrl} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </MuiNavbar>
  );
}

export default RewardedPlayer;

