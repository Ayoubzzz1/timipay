import { useEffect, useRef, useState } from 'react';

export default function usePipPlayer({ mainVideoUrl, adVideoUrl, intervalSeconds = 10 }) {
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [currentSource, setCurrentSource] = useState(mainVideoUrl || null);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [shouldSeek, setShouldSeek] = useState(false);

  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const savedTimeRef = useRef(0);

  // Keep current source in sync when main url changes and no ad is playing
  useEffect(() => {
    if (!isAdPlaying && mainVideoUrl) {
      setCurrentSource(mainVideoUrl);
    }
  }, [mainVideoUrl, isAdPlaying]);

  // PiP event listeners on the <video>
  useEffect(() => {
    const videoElement = playerRef.current;
    if (!videoElement) return;

    const handleLeavePiP = () => {
      setIsPiPActive(false);
    };

    videoElement.addEventListener('leavepictureinpicture', handleLeavePiP);
    return () => {
      videoElement.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, [currentSource]);

  // Ad switching interval
  useEffect(() => {
    if (!mainVideoUrl) return;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setIsAdPlaying(prev => {
        const newIsAd = !prev;
        const videoEl = playerRef.current;
        if (newIsAd && videoEl) {
          try { savedTimeRef.current = videoEl.currentTime || 0; } catch (_) { savedTimeRef.current = 0; }
        }
        if (!newIsAd) setShouldSeek(true);
        setCurrentSource(newIsAd ? adVideoUrl : mainVideoUrl);
        return newIsAd;
      });
    }, intervalSeconds * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mainVideoUrl, adVideoUrl, intervalSeconds]);

  const handleLoadedData = () => {
    const videoEl = playerRef.current;
    if (!videoEl) return;
    if (!isPiPActive) {
      videoEl.requestPictureInPicture?.().then(() => setIsPiPActive(true)).catch(() => {});
    }
    if (!isAdPlaying && shouldSeek) {
      try { videoEl.currentTime = savedTimeRef.current; } catch (_) {}
      setShouldSeek(false);
    }
  };

  const togglePiP = () => {
    const videoElement = playerRef.current;
    if (!videoElement) return;
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().then(() => setIsPiPActive(false)).catch(() => {});
    } else {
      videoElement.requestPictureInPicture?.().then(() => setIsPiPActive(true)).catch(() => {});
    }
  };

  return {
    playerRef,
    currentSource,
    isAdPlaying,
    isPiPActive,
    togglePiP,
    handleLoadedData,
  };
}


