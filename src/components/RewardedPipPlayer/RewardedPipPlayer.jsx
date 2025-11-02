import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  PictureInPicture as PipIcon,
  PlayArrow,
  Pause,
  VolumeOff,
  VolumeUp,
} from '@mui/icons-material';
import usePictureInPicture from '../../hooks/usePictureInPicture';
import { supabase } from '../../lib/supabaseClient';
import { useUser } from '../../contexts/UserContext';
import toast from 'react-hot-toast';

/**
 * RewardedPipPlayer Component
 * 
 * Plays a video with Picture-in-Picture support and shows ads every 10 seconds.
 * Awards 1 point per ad watched and saves points to the reward center.
 */
function RewardedPipPlayer({ 
  videoSrc = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  adInterval = 10, // Show ad every 10 seconds
  adDuration = 5, // Ad duration in seconds
  pointsPerAd = 1, // Points awarded per ad
  autoSave = true, // Automatically save points
}) {
  const { user } = useUser();
  const videoRef = useRef(null);
  const adTimerRef = useRef(null);
  const adTimeoutRef = useRef(null);
  const lastAdSecondRef = useRef(0);
  const eventLogRef = useRef([]);

  // Video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Ad state
  const [showAd, setShowAd] = useState(false);
  const [adTimeRemaining, setAdTimeRemaining] = useState(0);
  const [isAdPlaying, setIsAdPlaying] = useState(false);

  // Points state
  const [totalPoints, setTotalPoints] = useState(0);
  const [pointsEarnedThisSession, setPointsEarnedThisSession] = useState(0);
  const [isSavingPoints, setIsSavingPoints] = useState(false);

  // PiP state
  const {
    isPictureInPictureActive,
    togglePictureInPicture,
  } = usePictureInPicture(videoRef);
  
  // Check PiP availability
  const isPictureInPictureAvailable = typeof document !== 'undefined' && 
    (document.pictureInPictureEnabled || 
     (videoRef.current && 'webkitSupportsPresentationMode' in videoRef.current));

  // Load user's current points from database
  useEffect(() => {
    const loadUserPoints = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('data_user')
          .select('points, rewards')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error loading points:', error);
        } else if (data) {
          const points = data.points || data.rewards || 0;
          setTotalPoints(Number(points));
        }
      } catch (err) {
        console.error('Exception loading points:', err);
      }
    };

    loadUserPoints();
  }, [user?.id]);

  // Save points to database
  const savePoints = useCallback(async (pointsToAdd) => {
    if (!user?.id || !autoSave) return;

    setIsSavingPoints(true);
    try {
      // Get current points from database
      const { data: currentData } = await supabase
        .from('data_user')
        .select('points, rewards')
        .eq('id', user.id)
        .single();

      const currentPoints = Number(currentData?.points || currentData?.rewards || 0);
      const newTotalPoints = currentPoints + pointsToAdd;

      // Try updating 'points' field first, if it doesn't exist, try 'rewards'
      const { error: pointsError } = await supabase
        .from('data_user')
        .update({ points: newTotalPoints })
        .eq('id', user.id);

      if (pointsError) {
        // If 'points' field doesn't exist, try 'rewards'
        const { error: rewardsError } = await supabase
          .from('data_user')
          .update({ rewards: newTotalPoints })
          .eq('id', user.id);

        if (rewardsError) {
          // If neither field exists, create a new record or update with points
          await supabase
            .from('data_user')
            .upsert({ id: user.id, points: newTotalPoints }, { onConflict: 'id' });
        }
      }

      setTotalPoints(newTotalPoints);
      logEvent(`Points saved to database: ${newTotalPoints} total`);
    } catch (err) {
      console.error('Error saving points:', err);
      toast.error('Failed to save points. Please try again.');
    } finally {
      setIsSavingPoints(false);
    }
  }, [user?.id, autoSave]);

  // Event logging
  const logEvent = useCallback((message) => {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message };
    eventLogRef.current.push(logEntry);
    console.log(`[RewardedPipPlayer] ${timestamp}: ${message}`);
    
    // Keep only last 50 events
    if (eventLogRef.current.length > 50) {
      eventLogRef.current.shift();
    }
  }, []);

  // Track video time and check for ad intervals
  useEffect(() => {
    if (!videoRef.current || showAd) return;

    const video = videoRef.current;

    const handleTimeUpdate = () => {
      const current = Math.floor(video.currentTime);
      setCurrentTime(current);

      // Check if we've reached an ad interval (every 10 seconds)
      const secondsSinceLastAd = current - lastAdSecondRef.current;
      
      if (current > 0 && secondsSinceLastAd >= adInterval && !showAd && !isAdPlaying) {
        // Pause main video
        video.pause();
        setIsPlaying(false);
        
        // Show ad
        setShowAd(true);
        setIsAdPlaying(true);
        setAdTimeRemaining(adDuration);
        lastAdSecondRef.current = current;
        
        logEvent(`Ad started at second ${current}`);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [showAd, isAdPlaying, adInterval, adDuration, logEvent]);

  // Handle ad countdown
  useEffect(() => {
    if (!showAd || !isAdPlaying) return;

    adTimeoutRef.current = setInterval(() => {
      setAdTimeRemaining((prev) => {
        if (prev <= 1) {
          // Ad finished - award points
          handleAdComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (adTimeoutRef.current) {
        clearInterval(adTimeoutRef.current);
      }
    };
  }, [showAd, isAdPlaying]);

  // Handle ad completion
  const handleAdComplete = useCallback(() => {
    logEvent(`Ad finished at second ${Math.floor(videoRef.current?.currentTime || 0)}`);
    
    // Award points
    setPointsEarnedThisSession((prev) => prev + pointsPerAd);
    logEvent(`User earned ${pointsPerAd} point`);
    
    // Save points to database
    savePoints(pointsPerAd);

    // Hide ad and resume video
    setShowAd(false);
    setIsAdPlaying(false);
    
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [pointsPerAd, savePoints, logEvent]);

  // Handle video loaded
  const handleVideoLoaded = () => {
    setIsLoading(false);
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      logEvent('Video loaded and ready');
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (showAd) {
      // Can't control video while ad is showing
      return;
    }

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get event logs (for debugging/display)
  const getEventLogs = () => {
    return eventLogRef.current.slice(-10); // Last 10 events
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: '800px', mx: 'auto' }}>
      {/* Points Counter */}
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
          p: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" color="primary" fontWeight="bold">
          Total Points: {totalPoints}
        </Typography>
        {pointsEarnedThisSession > 0 && (
          <Typography variant="body2" color="success.main">
            +{pointsEarnedThisSession} this session
          </Typography>
        )}
        {isSavingPoints && (
          <CircularProgress size={16} sx={{ mt: 1 }} />
        )}
      </Paper>

      {/* Video Container */}
      <Box sx={{ position: 'relative', backgroundColor: '#000', borderRadius: 2, overflow: 'hidden' }}>
        {/* Loading indicator */}
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 5,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* Ad Overlay */}
        {showAd && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
            }}
          >
            <Typography variant="h4" color="white" fontWeight="bold">
              Ad Playing
            </Typography>
            
            {/* Ad placeholder image/video */}
            <Box
              sx={{
                width: '80%',
                maxWidth: '400px',
                height: '225px',
                backgroundColor: '#1a1a1a',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #fff',
              }}
            >
              {/* Placeholder ad content */}
              <Box sx={{ textAlign: 'center', color: 'white' }}>
                <Typography variant="h5" mb={2}>
                  🎬 ADVERTISEMENT
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sample Ad Content
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Watch this ad to earn {pointsPerAd} point!
                </Typography>
              </Box>
            </Box>

            {/* Ad countdown timer */}
            <Typography variant="h3" color="primary" fontWeight="bold">
              {adTimeRemaining}
            </Typography>
            <Typography variant="body1" color="white">
              Ad will end in {adTimeRemaining} second{adTimeRemaining !== 1 ? 's' : ''}
            </Typography>
          </Box>
        )}

        {/* Video Element */}
        <video
          ref={videoRef}
          src={videoSrc}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
          }}
          muted={isMuted}
          playsInline
          disablePictureInPicture={false}
          onLoadedMetadata={handleVideoLoaded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Video Controls Overlay */}
        {!showAd && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              zIndex: 7,
            }}
          >
            <IconButton
              onClick={togglePlayPause}
              sx={{ color: 'white' }}
              size="large"
            >
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>

            <IconButton
              onClick={toggleMute}
              sx={{ color: 'white' }}
              size="large"
            >
              {isMuted ? <VolumeOff /> : <VolumeUp />}
            </IconButton>

            <Typography variant="body2" sx={{ color: 'white', ml: 'auto' }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Typography>

            {isPictureInPictureAvailable && (
              <IconButton
                onClick={() => togglePictureInPicture(!isPictureInPictureActive)}
                sx={{ color: 'white' }}
                size="large"
                title={isPictureInPictureActive ? 'Exit Picture-in-Picture' : 'Enter Picture-in-Picture'}
              >
                <PipIcon />
              </IconButton>
            )}
          </Box>
        )}
      </Box>

      {/* Info Panel */}
      <Paper elevation={1} sx={{ mt: 2, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Reward Player Info
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • Watch the video to earn points
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • An ad will appear every {adInterval} seconds
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • Watch the full {adDuration}-second ad to earn {pointsPerAd} point
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Points are automatically saved to your reward center
        </Typography>

        {/* Event Log (for debugging) */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #ddd' }}>
            <Typography variant="subtitle2" gutterBottom>
              Event Log (Last 10):
            </Typography>
            {getEventLogs().map((log, idx) => (
              <Typography
                key={idx}
                variant="caption"
                display="block"
                sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
              >
                {log.timestamp.split('T')[1].split('.')[0]} - {log.message}
              </Typography>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default RewardedPipPlayer;

