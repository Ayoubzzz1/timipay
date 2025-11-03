import { useEffect, useRef, useState } from "react";
import { Play, Pause, Maximize2, Minimize2, SkipBack, SkipForward, Grid3x3, Video } from "lucide-react";

function PiPPlayer({ mainVideoUrl, adVideoUrl, intervalSeconds = 10 }) {
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [currentSource, setCurrentSource] = useState(mainVideoUrl);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const savedTimeRef = useRef(0);
  const [shouldSeek, setShouldSeek] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleLoadedData = () => {
    const videoEl = playerRef.current;
    if (!videoEl) return;

    if (!isAdPlaying && shouldSeek) {
      try {
        videoEl.currentTime = savedTimeRef.current;
      } catch (_) {}
      setShouldSeek(false);
    }
    setDuration(videoEl.duration || 0);
  };

  const handleTimeUpdate = () => {
    const videoEl = playerRef.current;
    if (videoEl) {
      setCurrentTime(videoEl.currentTime || 0);
    }
  };

  useEffect(() => {
    const videoElement = playerRef.current;
    if (!videoElement) return;

    const handleLeavePiP = () => {
      setIsPiPActive(false);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    videoElement.addEventListener("leavepictureinpicture", handleLeavePiP);
    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("pause", handlePause);

    return () => {
      videoElement.removeEventListener("leavepictureinpicture", handleLeavePiP);
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("pause", handlePause);
    };
  }, [currentSource]);

  useEffect(() => {
    if (!mainVideoUrl) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setIsAdPlaying((prev) => {
        const newIsAd = !prev;
        const videoEl = playerRef.current;
        
        if (newIsAd && videoEl) {
          try { 
            savedTimeRef.current = videoEl.currentTime || 0; 
          } catch(_) { 
            savedTimeRef.current = 0; 
          }
        }

        if (!newIsAd) {
          setShouldSeek(true);
        }

        setCurrentSource(newIsAd ? adVideoUrl : mainVideoUrl);
        return newIsAd;
      });
    }, intervalSeconds * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [mainVideoUrl, adVideoUrl, intervalSeconds]);

  const togglePiP = async () => {
    const videoElement = playerRef.current;
    if (!videoElement) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiPActive(false);
      } else {
        await videoElement.requestPictureInPicture?.();
        setIsPiPActive(true);
      }
    } catch (err) {
      console.error("PiP toggle failed:", err);
    }
  };

  const togglePlayPause = () => {
    const videoElement = playerRef.current;
    if (!videoElement) return;

    if (videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Video Container */}
        <div className="relative bg-black aspect-video">
          <video
            ref={playerRef}
            src={currentSource || ''}
            autoPlay
            muted
            playsInline
            crossOrigin="anonymous"
            onLoadedData={handleLoadedData}
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full"
          />
          
          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <div className={`px-4 py-2 rounded-full font-semibold text-sm shadow-lg ${
              isAdPlaying 
                ? 'bg-yellow-500 text-gray-900' 
                : 'bg-green-500 text-white'
            }`}>
              {isAdPlaying ? '📢 Advertisement' : '▶️ Main Video'}
            </div>
          </div>

          {/* PiP Status Badge */}
          {isPiPActive && (
            <div className="absolute top-4 right-4">
              <div className="px-4 py-2 bg-blue-500 text-white rounded-full font-semibold text-sm shadow-lg">
                PiP Active
              </div>
            </div>
          )}
        </div>

        {/* Controls Panel */}
        <div className="bg-gray-800 p-6">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={togglePlayPause}
              className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-all transform hover:scale-105"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" fill="white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-1" fill="white" />
              )}
            </button>

            <button
              onClick={togglePiP}
              className="w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center transition-all transform hover:scale-105"
            >
              {isPiPActive ? (
                <Minimize2 className="w-5 h-5 text-white" />
              ) : (
                <Maximize2 className="w-5 h-5 text-white" />
              )}
            </button>
          </div>

          {/* Info Display */}
          <div className="space-y-2 text-center">
            <div className="text-sm text-gray-300">
              Switches every <span className="font-bold text-blue-400">{intervalSeconds}s</span>
            </div>
            {!isAdPlaying && savedTimeRef.current > 0 && (
              <div className="text-xs text-blue-400">
                ↻ Resumed from {savedTimeRef.current.toFixed(1)}s
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoGrid({ videos, onSelectVideo, currentVideoUrl }) {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Grid3x3 className="w-6 h-6" />
        Video Library
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map((video) => (
          <div
            key={video.id}
            className={`bg-white rounded-lg shadow-md overflow-hidden transition-all transform hover:scale-105 hover:shadow-xl cursor-pointer ${
              currentVideoUrl === video.url ? 'ring-4 ring-blue-500' : ''
            }`}
            onClick={() => onSelectVideo(video.url)}
          >
            <div
              className="aspect-video bg-gray-200 relative"
              style={{
                backgroundImage: `url(${video.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {currentVideoUrl === video.url && (
                <div className="absolute inset-0 bg-blue-500 bg-opacity-30 flex items-center justify-center">
                  <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Now Playing
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, '0')}
              </div>
            </div>
            <div className="p-3">
              <div className="text-xs text-gray-500 mb-1">By {video.user}</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectVideo(video.url);
                }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Play Video
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VideosApp() {
  const [mainVideoUrl, setMainVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [currentPage, setCurrentPage] = useState('player'); // 'player' or 'library'

  const pickBestMp4 = (video) => {
    const files = video?.video_files || [];
    const sd = files.find(f => f.file_type?.includes('mp4') && f.quality === 'sd');
    const mp4s = files.filter(f => f.file_type?.includes('mp4'));
    const widest = mp4s.sort((a, b) => (b.width || 0) - (a.width || 0))[0];
    return (sd || widest || null)?.link || null;
  };

  useEffect(() => {
    const fetchPexelsVideo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fallback videos for demo
        const fallbackVideos = [
          {
            id: 1,
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            image: 'https://images.pexels.com/videos/3045163/free-video-3045163.jpg',
            duration: 596,
            user: 'Blender Foundation'
          },
          {
            id: 2,
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            image: 'https://images.pexels.com/videos/2491284/free-video-2491284.jpg',
            duration: 653,
            user: 'Orange Open Movie Project'
          },
          {
            id: 3,
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            image: 'https://images.pexels.com/videos/3045163/free-video-3045163.jpg',
            duration: 15,
            user: 'Google'
          }
        ];

        setVideos(fallbackVideos);
        if (!mainVideoUrl) setMainVideoUrl(fallbackVideos[0].url);
      } catch (e) {
        console.error('Video error:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPexelsVideo();
  }, [page]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Video className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">PiP Player</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage('player')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'player'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Player
              </button>
              <button
                onClick={() => setCurrentPage('library')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'library'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Library
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="py-8 px-4">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading videos...</p>
            </div>
          </div>
        ) : currentPage === 'player' ? (
          <div className="space-y-6">
            <PiPPlayer
              mainVideoUrl={mainVideoUrl}
              adVideoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
              intervalSeconds={10}
            />
            {error && (
              <div className="max-w-5xl mx-auto bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
                <p className="text-sm text-yellow-700">
                  <strong>Note:</strong> Using fallback videos. {error}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <VideoGrid
              videos={videos}
              onSelectVideo={(url) => {
                setMainVideoUrl(url);
                setCurrentPage('player');
              }}
              currentVideoUrl={mainVideoUrl}
            />
            
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <SkipBack className="w-4 h-4" />
                Previous
              </button>
              <span className="text-gray-700 font-medium">Page {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={videos.length < 10}
                className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                Next
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}