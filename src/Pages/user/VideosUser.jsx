import React, { useState, useEffect, useRef } from 'react';
import MuiNavbar from '../../compoents/Navbars/MuiNavbar';
import PiPPlayer from '../../compoents/Pipplayer';
import { addPoints, getPoints } from '../../utils/pointsApi';

function VideosUser() {
  const [userPoints, setUserPoints] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const pointsIntervalRef = useRef(null);
  const lastPointsUpdateRef = useRef(0);
  const [isAdPlaying, setIsAdPlaying] = useState(false);

  // Load initial points balance
  useEffect(() => {
    const loadPoints = async () => {
      const result = await getPoints();
      if (result.success) {
        setUserPoints(result.points);
        lastPointsUpdateRef.current = result.points;
      }
    };
    loadPoints();
  }, []);

  // Award points for watching main video (not ads)
  useEffect(() => {
    // Clear any existing interval
    if (pointsIntervalRef.current) {
      clearInterval(pointsIntervalRef.current);
    }

    // Only award points when main video is playing (not ads)
    if (!isAdPlaying) {
      // Award points every 10 seconds of watching main video
      pointsIntervalRef.current = setInterval(async () => {
        const pointsToAward = 1; // Award 1 point per interval
        const result = await addPoints(pointsToAward, 'video_watch', {
          video_url: '/videos/top.mp4',
          timestamp: new Date().toISOString(),
        });

        if (result.success) {
          setUserPoints(result.points);
          setPointsEarned((prev) => prev + pointsToAward);
          lastPointsUpdateRef.current = result.points;
        }
      }, 10000); // Every 10 seconds
    }

    return () => {
      if (pointsIntervalRef.current) {
        clearInterval(pointsIntervalRef.current);
      }
    };
  }, [isAdPlaying]);

  // Handle video status changes from PiPPlayer
  const handleVideoStatusChange = (isAd) => {
    setIsAdPlaying(isAd);
  };

  return (
    <MuiNavbar>
      <div className="relative">
        {/* Points Display */}
        <div className="absolute top-4 right-4 z-10 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-xs text-gray-400">Your Points</p>
              <p className="text-2xl font-bold text-yellow-400">{userPoints}</p>
            </div>
            {pointsEarned > 0 && (
              <div className="text-center border-l border-gray-600 pl-3">
                <p className="text-xs text-gray-400">Earned This Session</p>
                <p className="text-lg font-semibold text-green-400">+{pointsEarned}</p>
              </div>
            )}
          </div>
        </div>

        <PiPPlayer
          mainVideoUrl="/videos/top.mp4"
          adVideoUrl="/videos/ads.mp4"
          intervalSeconds={10}
          onStatusChange={handleVideoStatusChange}
        />
      </div>
    </MuiNavbar>
  );
}

export default VideosUser;
