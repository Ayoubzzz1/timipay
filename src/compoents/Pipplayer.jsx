// components/PiPPlayer.jsx
// Handles video playback, ad rotation, and time tracking

import { useEffect, useRef, useState } from "react";

export default function PiPPlayer({
  mainVideoUrl,
  adVideoUrls = [],
  intervalSeconds = 10,
  onStatusChange,
  onAdEnded,
  onAdProgress,
}) {
  // Validation
  if (!mainVideoUrl) {
    return <div className="text-white p-8">Error: No main video URL provided</div>;
  }
  
  if (!adVideoUrls || adVideoUrls.length === 0) {
    return <div className="text-white p-8">Error: No ad videos provided</div>;
  }

  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [currentSource, setCurrentSource] = useState(mainVideoUrl);
  const [currentAdName, setCurrentAdName] = useState("");
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [adSecondsWatched, setAdSecondsWatched] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const videoRef = useRef(null);
  const intervalRef = useRef(null);
  const savedTimeRef = useRef(0);
  const adProgressTimerRef = useRef(null);
  const adStartTimeRef = useRef(null);
  const timeUpdateIntervalRef = useRef(null);

  // Select a random ad from the array
  const getRandomAd = () => {
    const randomIndex = Math.floor(Math.random() * adVideoUrls.length);
    const adUrl = adVideoUrls[randomIndex];
    const adName = adUrl.split('/').pop();
    return { url: adUrl, name: adName };
  };

  // Track ad progress every second
  useEffect(() => {
    if (isAdPlaying) {
      adStartTimeRef.current = Date.now();
      setAdSecondsWatched(0);
      
      adProgressTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - adStartTimeRef.current) / 1000);
        setAdSecondsWatched(elapsed);
        
        if (onAdProgress) {
          onAdProgress(elapsed, currentAdName);
        }
      }, 1000);
    } else {
      if (adProgressTimerRef.current) {
        clearInterval(adProgressTimerRef.current);
        adProgressTimerRef.current = null;
      }
      setAdSecondsWatched(0);
    }

    return () => {
      if (adProgressTimerRef.current) {
        clearInterval(adProgressTimerRef.current);
      }
    };
  }, [isAdPlaying, currentAdName, onAdProgress]);

  // Track current time
  useEffect(() => {
    if (videoRef.current && isPlaying) {
      timeUpdateIntervalRef.current = setInterval(() => {
        if (videoRef.current) {
          setCurrentTime(videoRef.current.currentTime);
        }
      }, 100);
    }

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, [isPlaying]);

  // Listen for PiP events
  useEffect(() => {
    const handleLeavePiP = () => {
      setIsPiPActive(false);
      console.log("PiP mode deactivated");
    };

    const handleEnterPiP = () => {
      setIsPiPActive(true);
      console.log("PiP mode activated");
    };

    document.addEventListener("leavepictureinpicture", handleLeavePiP);
    document.addEventListener("enterpictureinpicture", handleEnterPiP);

    return () => {
      document.removeEventListener("leavepictureinpicture", handleLeavePiP);
      document.removeEventListener("enterpictureinpicture", handleEnterPiP);
    };
  }, []);

  // Set up interval to switch to ads
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Only set interval when main video is playing (not during ads)
    if (!isAdPlaying && isPlaying) {
      intervalRef.current = setInterval(() => {
        if (!isAdPlaying && videoRef.current) {
          // Save main video position
          savedTimeRef.current = videoRef.current.currentTime;
          console.log(`Saved position: ${savedTimeRef.current}s`);
          
          // Select random ad
          const { url, name } = getRandomAd();
          setCurrentAdName(name);
          setCurrentSource(url);
          setIsAdPlaying(true);
          
          console.log(`Switching to ad: ${name}`);
          
          if (onStatusChange) {
            onStatusChange(true, name);
          }
        }
      }, intervalSeconds * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [mainVideoUrl, adVideoUrls, intervalSeconds, isAdPlaying, onStatusChange, isPlaying]);

  // Handle video loaded
  const handleLoadedData = () => {
    console.log(`Video loaded: ${currentSource}`);
    
    // If returning to main video after ad, restore position
    if (!isAdPlaying && savedTimeRef.current > 0 && videoRef.current) {
      videoRef.current.currentTime = savedTimeRef.current;
      console.log(`Restored main video to ${savedTimeRef.current}s`);
      savedTimeRef.current = 0;
    }
  };

  // Handle video ended
  const handleEnded = () => {
    if (isAdPlaying) {
      console.log(`Ad '${currentAdName}' ended - ${adSecondsWatched}s watched`);
      
      if (onAdEnded) {
        onAdEnded(adSecondsWatched, currentAdName);
      }
      
      // Switch back to main video
      setIsAdPlaying(false);
      setCurrentSource(mainVideoUrl);
      
      if (onStatusChange) {
        onStatusChange(false, null);
      }
    } else {
      // Main video ended - loop it
      console.log("Main video ended - restarting");
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
    }
  };

  // Toggle PiP mode
  const togglePiP = async () => {
    try {
      if (!videoRef.current) {
        alert("Video element not ready. Please start playing first.");
        return;
      }

      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiPActive(false);
        console.log("Exited PiP mode");
      } else {
        if (!videoRef.current.requestPictureInPicture) {
          alert("Picture-in-Picture is not supported in your browser.");
          return;
        }
        await videoRef.current.requestPictureInPicture();
        setIsPiPActive(true);
        console.log("Entered PiP mode");
      }
    } catch (err) {
      console.error("PiP toggle error:", err);
      alert(`PiP Error: ${err.message}`);
    }
  };

  // Start playing
  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Pause video
  const handlePauseClick = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold mb-2">Video Rewards Player</h1>
        <p className="text-lg">
          Status:{" "}
          <span className={isAdPlaying ? "text-yellow-400" : "text-green-400"}>
            {isAdPlaying ? `Ad Playing: ${currentAdName}` : "Main Video"}
          </span>
        </p>
        <p className="text-sm text-gray-400 mt-1">
          PiP: {isPiPActive ? "Active" : "Inactive"} | Time: {currentTime.toFixed(1)}s
        </p>
        {isAdPlaying && (
          <p className="text-sm text-blue-400 mt-1 font-bold animate-pulse">
            Earning: {adSecondsWatched}s = +{adSecondsWatched} points 💰
          </p>
        )}
      </div>

      {/* Video Player */}
      <div className="w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-2xl">
        <video
          ref={videoRef}
          key={currentSource}
          src={currentSource}
          controls
          autoPlay={isPlaying}
          className="w-full"
          onLoadedData={handleLoadedData}
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={(e) => {
            console.error('Video load error:', e);
            alert(`Failed to load video: ${currentSource}`);
          }}
        />
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4 mt-6">
        {!isPlaying ? (
          <button
            onClick={handlePlayClick}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
          >
            ▶ Start Playing
          </button>
        ) : (
          <>
            <button
              onClick={handlePauseClick}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
            >
              ⏸ Pause
            </button>
            <button
              onClick={handlePlayClick}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
            >
              ▶ Play
            </button>
          </>
        )}
        
        <button
          onClick={togglePiP}
          disabled={!isPlaying}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            isPlaying 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          {isPiPActive ? "📺 Exit PiP" : "📺 Enter PiP"}
        </button>
      </div>

      {/* Info Display */}
      <div className="mt-8 text-center text-sm text-gray-400 max-w-2xl">
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="font-bold text-white mb-2">🎬 How It Works:</p>
          <ul className="text-left space-y-1 text-xs">
            <li>✓ Main video plays: <span className="text-green-400">{mainVideoUrl.split('/').pop()}</span></li>
            <li>✓ Every {intervalSeconds} seconds → Random ad plays</li>
            <li>✓ During ads: Earn <span className="text-blue-400">1 point per second</span></li>
            <li>✓ After ad ends → Points saved to database</li>
            <li>✓ Returns to main video at saved position</li>
          </ul>
          
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-xs font-mono">
              Playing: {isPlaying ? '✓' : '✗'} | 
              Ad Mode: {isAdPlaying ? '✓' : '✗'} | 
              PiP: {isPiPActive ? '✓' : '✗'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}