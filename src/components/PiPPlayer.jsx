import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";

export default function PiPPlayer({
  mainVideoUrl,
  adVideoUrl,
  intervalSeconds = 10,
}) {
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [currentSource, setCurrentSource] = useState(mainVideoUrl);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const savedTimeRef = useRef(0); // Store main video playback position
  const [shouldSeek, setShouldSeek] = useState(false); // Flag to trigger seeking

  // Enter PiP mode automatically when video is ready
  const handleReady = () => {
    if (playerRef.current && !isPiPActive) {
      playerRef.current
        .requestPictureInPicture()
        .then(() => {
          setIsPiPActive(true);
          console.log("PiP mode activated");
        })
        .catch((err) => {
          console.error("Failed to enter PiP mode:", err);
        });
    }

    // Restore playback position when returning to main video
    if (!isAdPlaying && shouldSeek && playerRef.current) {
      playerRef.current.currentTime = savedTimeRef.current;
      console.log(`Restored main video position to ${savedTimeRef.current}s`);
      setShouldSeek(false);
    }
  };

  // Listen for PiP exit events
  useEffect(() => {
    const videoElement = playerRef.current;
    if (!videoElement) return;

    const handleLeavePiP = () => {
      setIsPiPActive(false);
      console.log("PiP mode deactivated");
    };

    videoElement.addEventListener("leavepictureinpicture", handleLeavePiP);

    return () => {
      videoElement.removeEventListener("leavepictureinpicture", handleLeavePiP);
    };
  }, [currentSource]); // Re-attach listener when source changes

  // Set up the interval to switch between main video and ad
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start the interval
    intervalRef.current = setInterval(() => {
      setIsAdPlaying((prev) => {
        const newIsAd = !prev;
        
        // Save main video position before switching to ad
        if (newIsAd && playerRef.current) {
          savedTimeRef.current = playerRef.current.currentTime;
          console.log(`Saved main video position: ${savedTimeRef.current}s`);
        }
        
        // Set flag to restore position when returning to main video
        if (!newIsAd) {
          setShouldSeek(true);
        }
        
        setCurrentSource(newIsAd ? adVideoUrl : mainVideoUrl);
        console.log(newIsAd ? "Switching to Ad" : "Switching to Main Video");
        return newIsAd;
      });
    }, intervalSeconds * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [mainVideoUrl, adVideoUrl, intervalSeconds]);

  // Manual PiP toggle button
  const togglePiP = () => {
    const videoElement = playerRef.current;
    if (!videoElement) return;

    if (document.pictureInPictureElement) {
      document
        .exitPictureInPicture()
        .then(() => {
          setIsPiPActive(false);
          console.log("Exited PiP mode");
        })
        .catch((err) => {
          console.error("Failed to exit PiP mode:", err);
        });
    } else {
      videoElement
        .requestPictureInPicture()
        .then(() => {
          setIsPiPActive(true);
          console.log("Entered PiP mode");
        })
        .catch((err) => {
          console.error("Failed to enter PiP mode:", err);
        });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold mb-2">PiP Player</h1>
        <p className="text-lg">
          Status:{" "}
          <span className={isAdPlaying ? "text-yellow-400" : "text-green-400"}>
            {isAdPlaying ? "Ad Playing" : "Main Video Playing"}
          </span>
        </p>
        <p className="text-sm text-gray-400 mt-1">
          PiP Mode: {isPiPActive ? "Active" : "Inactive"}
        </p>
        {!isAdPlaying && savedTimeRef.current > 0 && (
          <p className="text-xs text-blue-400 mt-1">
            Resumed from: {savedTimeRef.current.toFixed(1)}s
          </p>
        )}
      </div>

      <div className="w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-2xl">
        <ReactPlayer
          ref={playerRef}
          src={currentSource}
          playing
          controls
          width="100%"
          height="100%"
          onReady={handleReady}
        />
      </div>

      <button
        onClick={togglePiP}
        className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
      >
        {isPiPActive ? "Exit PiP Mode" : "Enter PiP Mode"}
      </button>

      <div className="mt-8 text-center text-sm text-gray-400">
        <p>Video switches every {intervalSeconds} seconds</p>
        <p className="mt-1">Main Video: {mainVideoUrl}</p>
        <p className="mt-1">Ad Video: {adVideoUrl}</p>
      </div>
    </div>
  );
}
