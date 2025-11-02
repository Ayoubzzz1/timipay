import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  CardActionArea,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  VideoLibrary as VideoIcon,
  Search as SearchIcon,
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  PictureInPicture as PipIcon,
} from '@mui/icons-material';
import MuiNavbar from '../../compoents/Navbars/MuiNavbar';
import { useUser } from '../../contexts/UserContext';
import { savePoints } from '../../utils/pointsUtils';
import toast from 'react-hot-toast';

function VideosUser() {
  const { user, userData } = useUser();
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [isPipActive, setIsPipActive] = useState(false);
  const [pipError, setPipError] = useState(null);
  
  // Ad state
  const [showAd, setShowAd] = useState(false);
  const [adTimeRemaining, setAdTimeRemaining] = useState(5);
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [lastAdSecond, setLastAdSecond] = useState(0);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  
  const videoRef = useRef(null);
  const adIntervalRef = useRef(null);
  const adTimerRef = useRef(null);

  // Get API key from environment variables
  const API_KEY = import.meta.env.VITE_PIXEL_API_KEY || 'YOUR_PIXELS_API_KEY';
  const VIDEOS_PER_PAGE = 9;
  const DEFAULT_QUERY = 'nature';

  // Check if Picture-in-Picture is available
  const isPipAvailable = () => {
    return document.pictureInPictureEnabled || 
           (videoRef.current && 'webkitSupportsPresentationMode' in videoRef.current);
  };

  // Get PiP unsupported reason for debugging
  const getPipUnsupportedReason = () => {
    const el = videoRef.current;
    if (!document.pictureInPictureEnabled && !(el && ('webkitSupportsPresentationMode' in el))) {
      return 'Browser disabled PiP or not supported.';
    }
    if (window.self !== window.top) {
      return 'Running inside an iframe without allow="picture-in-picture".';
    }
    if (el?.disablePictureInPicture) {
      return 'Video element has disablePictureInPicture=true.';
    }
    return 'Unknown environment restriction.';
  };

  // Simple and reliable PiP toggle
  const togglePipMode = async () => {
    setPipError(null);
    const video = videoRef.current;
    
    if (!video) {
      setPipError('No video element found');
      return;
    }

    if (!isPipAvailable()) {
      setPipError(`PiP not available: ${getPipUnsupportedReason()}`);
      return;
    }

    try {
      // Ensure video is ready and playing
      if (video.paused) {
        try {
          await video.play();
        } catch (playError) {
          console.warn('Could not auto-play video:', playError);
        }
      }

      // Handle Safari (WebKit)
      if ('webkitSupportsPresentationMode' in video && 
          typeof video.webkitSetPresentationMode === 'function') {
        if (video.webkitPresentationMode === 'picture-in-picture') {
          video.webkitSetPresentationMode('inline');
        } else {
          video.webkitSetPresentationMode('picture-in-picture');
        }
        return;
      }

      // Handle standard PiP API
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        // Request PiP - this must be called from a user gesture
        await video.requestPictureInPicture();
      }
    } catch (error) {
      console.error('PiP toggle error:', error);
      setPipError(`Failed to toggle PiP: ${error.message}`);
    }
  };

  // Setup PiP event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnterPip = () => {
      console.log('Entered PiP mode');
      setIsPipActive(true);
      setPipError(null);
    };

    const handleLeavePip = () => {
      console.log('Exited PiP mode');
      setIsPipActive(false);
      setPipError(null);
    };

    // Standard PiP events
    video.addEventListener('enterpictureinpicture', handleEnterPip);
    video.addEventListener('leavepictureinpicture', handleLeavePip);

    // Safari PiP events
    const handleWebkitPipChange = () => {
      if (video.webkitPresentationMode === 'picture-in-picture') {
        handleEnterPip();
      } else {
        handleLeavePip();
      }
    };
    video.addEventListener('webkitpresentationmodechanged', handleWebkitPipChange);

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPip);
      video.removeEventListener('leavepictureinpicture', handleLeavePip);
      video.removeEventListener('webkitpresentationmodechanged', handleWebkitPipChange);
    };
  }, [selectedVideo]);

  // Handle ad completion
  const handleAdComplete = useCallback(async () => {
    if (!user?.id) return;

    console.log(`Ad finished at second ${currentVideoTime}`);
    
    try {
      // Save points to database
      const result = await savePoints(
        user.id,
        1, // 1 point per ad
        'ad_watch',
        `User watched an ad at ${currentVideoTime}s while watching video`
      );

      if (result.success) {
        setTotalPoints(result.totalPoints);
        toast.success(`+1 point! Total: ${result.totalPoints} points`, { duration: 2000 });
        console.log(`User earned 1 point. Total: ${result.totalPoints}`);
      } else {
        console.error('Failed to save points:', result.error);
        toast.error('Failed to save points. Please try again.');
      }
    } catch (error) {
      console.error('Error handling ad complete:', error);
      toast.error('Error saving points');
    }

    // Hide ad and resume video
    setShowAd(false);
    setIsAdPlaying(false);
    
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, [user?.id, currentVideoTime]);

  // Track video time and show ads every 10 seconds
  useEffect(() => {
    if (!videoRef.current || !selectedVideo || showAd) return;

    const video = videoRef.current;
    const AD_INTERVAL = 10; // Show ad every 10 seconds
    const AD_DURATION = 5; // Ad duration in seconds

    const handleTimeUpdate = () => {
      const current = Math.floor(video.currentTime);
      setCurrentVideoTime(current);

      // Check if we've reached an ad interval (every 10 seconds)
      const secondsSinceLastAd = current - lastAdSecond;
      
      if (current > 0 && secondsSinceLastAd >= AD_INTERVAL && !showAd && !isAdPlaying) {
        // Pause main video
        video.pause();
        
        // Show ad
        setShowAd(true);
        setIsAdPlaying(true);
        setAdTimeRemaining(AD_DURATION);
        setLastAdSecond(current);
        
        console.log(`Ad started at second ${current}`);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [selectedVideo, showAd, isAdPlaying, lastAdSecond]);

  // Handle ad countdown
  useEffect(() => {
    if (!showAd || !isAdPlaying) return;

    adTimerRef.current = setInterval(() => {
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
      if (adTimerRef.current) {
        clearInterval(adTimerRef.current);
      }
    };
  }, [showAd, isAdPlaying, handleAdComplete]);

  // Exit PiP mode safely
  const exitPipMode = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      }
      
      const video = videoRef.current;
      if (video && 'webkitSupportsPresentationMode' in video && 
          video.webkitPresentationMode === 'picture-in-picture') {
        video.webkitSetPresentationMode('inline');
      }
    } catch (error) {
      console.error('Error exiting PiP:', error);
    }
  };

  // Fetch videos from PIXELS API
  const fetchVideos = async (page = 1, query = '', category = '') => {
    try {
      setIsLoading(true);
      setError(null);

      // Always provide a default query if none is specified
      const effectiveQuery = query || DEFAULT_QUERY;
      
      // Build API URL
      let url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(effectiveQuery)}&per_page=${VIDEOS_PER_PAGE}&page=${page}`;

      console.log('API URL:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': API_KEY,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      console.log('PIXELS API Response:', data);
      
      setVideos(data.videos || []);
      setTotalPages(Math.ceil((data.total_results || 0) / VIDEOS_PER_PAGE));
      
      // Extract categories from videos
      const videoCategories = [...new Set(
        data.videos?.flatMap(video => video.tags || []) || []
      )];
      setCategories(videoCategories.slice(0, 20)); // Limit to 20 categories
      
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err.message);
      
      // Fallback mock data for development
      if (API_KEY === 'YOUR_PIXELS_API_KEY') {
        console.log('Using mock data for development');
        setVideos(generateMockVideos());
        setCategories(['Nature', 'Technology', 'Business', 'Lifestyle', 'Sports']);
        setTotalPages(5);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock videos for development
  const generateMockVideos = () => {
    const mockVideos = [];
    for (let i = 1; i <= VIDEOS_PER_PAGE; i++) {
      mockVideos.push({
        id: i,
        url: `https://example.com/video${i}.mp4`,
        image: `https://picsum.photos/400/300?random=${i}`,
        duration: Math.floor(Math.random() * 60) + 30,
        user: {
          name: `Photographer ${i}`,
          url: `https://example.com/user${i}`,
        },
        video_files: [
          {
            id: i,
            quality: 'hd',
            file_type: 'video/mp4',
            width: 1920,
            height: 1080,
            link: `https://example.com/video${i}_hd.mp4`,
          },
        ],
        tags: ['Nature', 'Technology', 'Business', 'Lifestyle', 'Sports'][Math.floor(Math.random() * 5)],
      });
    }
    return mockVideos;
  };

  useEffect(() => {
    // Provide default query on initial load
    const initialQuery = searchTerm || DEFAULT_QUERY;
    fetchVideos(currentPage, initialQuery, selectedCategory);
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    const effectiveQuery = searchTerm || DEFAULT_QUERY;
    fetchVideos(1, effectiveQuery, selectedCategory);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    const effectiveQuery = searchTerm || DEFAULT_QUERY;
    fetchVideos(1, effectiveQuery, category);
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleVideoClick = async (video) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
    // Reset PiP state when new video is selected
    setIsPipActive(false);
    setPipError(null);
    // Reset ad state when switching videos
    setShowAd(false);
    setIsAdPlaying(false);
    setLastAdSecond(0);
    setCurrentVideoTime(0);
    setAdTimeRemaining(5);
    // Clear any ad timers
    if (adTimerRef.current) {
      clearInterval(adTimerRef.current);
      adTimerRef.current = null;
    }
    if (adIntervalRef.current) {
      clearInterval(adIntervalRef.current);
      adIntervalRef.current = null;
    }
  };

  const handleCloseVideoModal = async () => {
    // Clear ad timers
    if (adIntervalRef.current) {
      clearInterval(adIntervalRef.current);
      adIntervalRef.current = null;
    }
    if (adTimerRef.current) {
      clearInterval(adTimerRef.current);
      adTimerRef.current = null;
    }
    // Exit PiP when closing modal
    if (isPipActive) {
      await exitPipMode();
    }
    setIsVideoModalOpen(false);
    setSelectedVideo(null);
    setIsPipActive(false);
    setPipError(null);
    setShowAd(false);
    setIsAdPlaying(false);
    setLastAdSecond(0);
    setCurrentVideoTime(0);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setCurrentPage(1);
    fetchVideos(1, DEFAULT_QUERY, '');
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Autoplay next video when the current one ends (if enabled)
  const handleVideoEnded = async () => {
    if (!autoplayEnabled || !selectedVideo) return;
    const currentIndex = videos.findIndex(v => v.id === selectedVideo.id);
    const nextIndex = (currentIndex + 1) % videos.length;
    const nextVideo = videos[nextIndex];
    if (!nextVideo) return;
    
    // Check if PiP was active before switching
    const wasPipActive = isPipActive || document.pictureInPictureElement === videoRef.current;
    
    // Exit PiP first if active (needed to update video source)
    if (wasPipActive && document.pictureInPictureElement) {
      try {
        await document.exitPictureInPicture();
      } catch (err) {
        console.warn('Error exiting PiP for next video:', err);
      }
    }
    
    // Switch to next video
    setSelectedVideo(nextVideo);
    
    // Wait for video element to update and load new source (longer delay for React to recreate element with key prop)
    setTimeout(async () => {
      // Wait for React to recreate the video element
      let video = videoRef.current;
      let attempts = 0;
      while (!video && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 50));
        video = videoRef.current;
        attempts++;
      }
      
      if (!video) {
        console.warn('Video element not found after switching videos');
        return;
      }
      
      // Wait for video to load the new source
      const loadVideo = () => {
        return new Promise((resolve) => {
          if (video.readyState >= 2) { // HAVE_CURRENT_DATA
            resolve();
          } else {
            const onLoaded = () => {
              video.removeEventListener('loadeddata', onLoaded);
              resolve();
            };
            video.addEventListener('loadeddata', onLoaded);
            // Fallback timeout
            setTimeout(() => {
              video.removeEventListener('loadeddata', onLoaded);
              resolve();
            }, 1000);
          }
        });
      };
      
      try {
        // Load and play the next video
        await loadVideo();
        await video.play();
        
        // Re-enter PiP if it was active before
        if (wasPipActive && isPipAvailable()) {
          // Small delay to ensure video is playing smoothly
          setTimeout(async () => {
            try {
              const v = videoRef.current;
              if (v && !v.paused && isPipAvailable()) {
                // Handle Safari
                if ('webkitSupportsPresentationMode' in v && typeof v.webkitSetPresentationMode === 'function') {
                  v.webkitSetPresentationMode('picture-in-picture');
                } else if (document.pictureInPictureEnabled && document.pictureInPictureElement !== v) {
                  await v.requestPictureInPicture();
                }
              }
            } catch (pipErr) {
              console.warn('Could not re-enter PiP automatically:', pipErr);
              // Don't show error to user, just continue playing
            }
          }, 400);
        }
      } catch (playErr) {
        console.warn('Error playing next video:', playErr);
      }
    }, 200);
  };

  // Pick a smaller MP4 variant to keep PiP window compact
  const pickPiPFriendlyFile = (files = []) => {
    try {
      const mp4s = files.filter(f => (f.file_type || '').includes('mp4'));
      if (mp4s.length === 0) return null;
      // Sort ascending by width (prefer smaller resolutions for PiP window size)
      const sorted = mp4s.sort((a, b) => (a.width || 0) - (b.width || 0));
      // Prefer around 480-720 width if available
      const target = sorted.find(f => (f.width || 0) >= 480 && (f.width || 0) <= 800);
      return target || sorted[0];
    } catch (_) {
      return null;
    }
  };

  return (
    <MuiNavbar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center">
              <VideoIcon sx={{ mr: 2, fontSize: 32 }} color="primary" />
              <Typography variant="h4" component="h1">
                Videos
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                const effectiveQuery = searchTerm || DEFAULT_QUERY;
                fetchVideos(currentPage, effectiveQuery, selectedCategory);
              }}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </Box>
          <Typography variant="subtitle1" color="text.secondary">
            Discover and watch high-quality videos from PIXELS
          </Typography>
        </Box>

        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && (
          <Card sx={{ mb: 4, bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Debug Information
              </Typography>
              <Box sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                <Typography variant="body2" gutterBottom>
                  <strong>API Key Status:</strong> {API_KEY === 'YOUR_PIXELS_API_KEY' ? 'Not Set' : 'Set'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Current Page:</strong> {currentPage}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Search Term:</strong> {searchTerm || 'None (using default: ' + DEFAULT_QUERY + ')'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Selected Category:</strong> {selectedCategory || 'None'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>PiP Available:</strong> {isPipAvailable() ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>PiP Active:</strong> {isPipActive ? 'Yes' : 'No'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
        
        {/* Search and Filter Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryFilter(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box display="flex" gap={1}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSearch}
                    disabled={isLoading}
                    startIcon={<SearchIcon />}
                  >
                    Search
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleClearFilters}
                    disabled={isLoading}
                  >
                    Clear
                  </Button>
                </Box>
              </Grid>
            </Grid>

            {/* Category Chips */}
            {categories.length > 0 && (
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Popular Categories:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {categories.slice(0, 10).map((category) => (
                    <Chip
                      key={category}
                      label={category}
                      onClick={() => handleCategoryFilter(category)}
                      color={selectedCategory === category ? 'primary' : 'default'}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Loading videos...
            </Typography>
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            Error loading videos: {error}
            {API_KEY === 'YOUR_PIXELS_API_KEY' && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Please set your VITE_PIXEL_API_KEY in the .env file
              </Typography>
            )}
          </Alert>
        )}

        {/* Videos Grid */}
        {!isLoading && !error && (
          <>
            <Grid container spacing={3} mb={4}>
              {videos.map((video) => (
                <Grid item xs={12} sm={6} md={4} key={video.id}>
                  <Card>
                    <CardActionArea onClick={() => handleVideoClick(video)}>
                      <Box position="relative">
                        <img
                          src={video.image || video.picture}
                          alt={video.tags || 'Video thumbnail'}
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                          }}
                        />
                        <Box
                          position="absolute"
                          top={8}
                          right={8}
                          bgcolor="rgba(0,0,0,0.7)"
                          color="white"
                          borderRadius={1}
                          px={1}
                          py={0.5}
                        >
                          <Typography variant="caption">
                            {formatDuration(video.duration)}
                          </Typography>
                        </Box>
                        <Box
                          position="absolute"
                          top="50%"
                          left="50%"
                          sx={{
                            transform: 'translate(-50%, -50%)',
                            bgcolor: 'rgba(0,0,0,0.7)',
                            borderRadius: '50%',
                            p: 1,
                          }}
                        >
                          <PlayIcon sx={{ color: 'white', fontSize: 32 }} />
                        </Box>
                      </Box>
                      <CardContent>
                        <Typography variant="h6" gutterBottom noWrap>
                          {video.tags || `Video ${video.id}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          by {video.user?.name || 'Unknown'}
                        </Typography>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Chip
                            label={video.tags || 'General'}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Tooltip title="Download">
                            <IconButton size="small">
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mb={4}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}

        {/* No Videos State */}
        {!isLoading && !error && videos.length === 0 && (
          <Card>
            <CardContent>
              <Box textAlign="center" py={4}>
                <VideoIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Videos Found
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Try adjusting your search terms or browse different categories.
                </Typography>
                <Button variant="contained" onClick={() => fetchVideos(1, DEFAULT_QUERY)}>
                  Browse All Videos
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Video Modal */}
        <Dialog
          open={isVideoModalOpen}
          onClose={handleCloseVideoModal}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">
                {selectedVideo?.tags || 'Video Player'}
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                {isPipAvailable() ? (
                  <Tooltip title={isPipActive ? "Exit Picture-in-Picture" : "Enter Picture-in-Picture"}>
                    <IconButton 
                      onClick={togglePipMode}
                      color={isPipActive ? "primary" : "default"}
                      disabled={!selectedVideo}
                    >
                      <PipIcon />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title="Picture-in-Picture not supported in this browser/context">
                    <span>
                      <IconButton disabled>
                        <PipIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
                <FormControlLabel
                  control={<Switch checked={autoplayEnabled} onChange={(e) => setAutoplayEnabled(e.target.checked)} />}
                  label="Autoplay"
                />
                <IconButton onClick={handleCloseVideoModal}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedVideo && (
              <Box sx={{ position: 'relative' }}>
                {/* Ad Overlay */}
                {showAd && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 10,
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
                    
                    {/* Fake Ad Content */}
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
                      <Box sx={{ textAlign: 'center', color: 'white' }}>
                        <Typography variant="h5" mb={2}>
                          🎬 ADVERTISEMENT
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          Sample Ad Content
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mt={1}>
                          Watch this ad to earn 1 point!
                        </Typography>
                      </Box>
                    </Box>

                    {/* Ad Countdown Timer */}
                    <Typography variant="h2" color="primary" fontWeight="bold">
                      {adTimeRemaining}
                    </Typography>
                    <Typography variant="body1" color="white">
                      Ad will end in {adTimeRemaining} second{adTimeRemaining !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                )}

                <video
                  key={selectedVideo.id}
                  ref={videoRef}
                  controls
                  autoPlay
                  muted
                  onEnded={handleVideoEnded}
                  onTimeUpdate={(e) => {
                    const current = Math.floor(e.target.currentTime);
                    setCurrentVideoTime(current);
                  }}
                  style={{ width: '100%', maxHeight: '400px' }}
                  poster={selectedVideo.image || selectedVideo.picture}
                  playsInline
                  disablePictureInPicture={false}
                  controlsList="nodownload"
                >
                  {(() => {
                    const file = pickPiPFriendlyFile(selectedVideo.video_files);
                    const src = (file && file.link) || selectedVideo.video_files?.[0]?.link || selectedVideo.url;
                    return (
                      <source src={src} type="video/mp4" />
                    );
                  })()}
                  Your browser does not support the video tag.
                </video>
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    Duration: {formatDuration(selectedVideo.duration)} | 
                    Quality: {selectedVideo.video_files?.[0]?.quality || 'HD'} | 
                    By: {selectedVideo.user?.name || 'Unknown'}
                  </Typography>
                  
                  {/* PiP Error Display */}
                  {pipError && (
                    <Box mt={1}>
                      <Alert severity="warning" onClose={() => setPipError(null)}>
                        {pipError}
                      </Alert>
                    </Box>
                  )}
                  
                  {/* PiP Status */}
                  {isPipActive && (
                    <Box mt={1}>
                      <Alert severity="info">
                        Video is playing in Picture-in-Picture mode
                      </Alert>
                    </Box>
                  )}
                  
                  {/* PiP Unsupported Info */}
                  {!isPipAvailable() && (
                    <Box mt={1}>
                      <Alert severity="info">
                        Picture-in-Picture not available: {getPipUnsupportedReason()}
                      </Alert>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </MuiNavbar>
  );
}

export default VideosUser;