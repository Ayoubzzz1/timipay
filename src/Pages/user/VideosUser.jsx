// pages/VideosUser.jsx
// Main video page with LOCAL points tracking (no database saves)

import { useState, useEffect } from 'react';

import MuiNavbar from '../../compoents/Navbars/MuiNavbar';
import PiPPlayer from '../../compoents/Pipplayer';

function VideosUser() {
  // LOCAL STATE - No database calls for testing
  const [userPoints, setUserPoints] = useState(0);
  const [totalPointsEarned, setTotalPointsEarned] = useState(0);
  const [currentAdPoints, setCurrentAdPoints] = useState(0);
  const [currentAdName, setCurrentAdName] = useState("");
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [adsWatched, setAdsWatched] = useState(0);

  // Ad video URLs in public/videos folder
  const AD_VIDEOS = [
    '/videos/ads.mp4',
    '/videos/ads20.mp4',
    '/videos/ads30.mp4'
  ];

  const MAIN_VIDEO = '/videos/top.mp4';

  // Load points from localStorage on mount (for persistence across refreshes)
  useEffect(() => {
    const savedPoints = localStorage.getItem('localPoints');
    const savedTotal = localStorage.getItem('localTotalEarned');
    const savedAdsCount = localStorage.getItem('localAdsWatched');
    
    if (savedPoints) {
      setUserPoints(parseInt(savedPoints, 10));
      console.log(`📂 Loaded ${savedPoints} points from localStorage`);
    }
    if (savedTotal) {
      setTotalPointsEarned(parseInt(savedTotal, 10));
    }
    if (savedAdsCount) {
      setAdsWatched(parseInt(savedAdsCount, 10));
    }
  }, []);

  // Save to localStorage whenever points change
  useEffect(() => {
    localStorage.setItem('localPoints', userPoints.toString());
    localStorage.setItem('localTotalEarned', totalPointsEarned.toString());
    localStorage.setItem('localAdsWatched', adsWatched.toString());
  }, [userPoints, totalPointsEarned, adsWatched]);

  // Handle video status changes (switching between main video and ads)
  const handleVideoStatusChange = (isAd, adName) => {
    setIsAdPlaying(isAd);
    
    if (isAd) {
      setCurrentAdName(adName || "");
      setCurrentAdPoints(0);
      console.log(`🎬 Ad started: ${adName}`);
    } else {
      setCurrentAdName("");
      setCurrentAdPoints(0);
      console.log('📺 Back to main video');
    }
  };

  // Handle real-time ad progress (called every 100ms during ad playback)
  const handleAdProgress = (secondsWatched, adName) => {
    // Update current ad points display in real-time
    setCurrentAdPoints(secondsWatched);
  };

  // Handle ad completion and save points LOCALLY
  const handleAdEnded = (secondsWatched, adName) => {
    if (secondsWatched <= 0) {
      console.log('⚠️ No seconds watched, skipping');
      return;
    }

    console.log(`✅ Ad '${adName}' completed - Adding ${secondsWatched} points locally`);

    // Add points locally (no database)
    const newTotal = userPoints + secondsWatched;
    setUserPoints(newTotal);
    setTotalPointsEarned(prev => prev + secondsWatched);
    setAdsWatched(prev => prev + 1);

    console.log(`💰 New total: ${newTotal} points (+${secondsWatched})`);

    // Reset current ad tracking
    setCurrentAdPoints(0);
    setCurrentAdName("");
  };

  // Reset all points (for testing)
  const handleReset = () => {
    if (confirm('Reset all points to 0?')) {
      setUserPoints(0);
      setTotalPointsEarned(0);
      setAdsWatched(0);
      setCurrentAdPoints(0);
      localStorage.removeItem('localPoints');
      localStorage.removeItem('localTotalEarned');
      localStorage.removeItem('localAdsWatched');
      console.log('🔄 All points reset');
    }
  };

  return (
    <MuiNavbar>
      <div className="relative">
        {/* Points Display Dashboard - Floating on top */}
        <div className="absolute top-4 right-4 z-50 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-sm rounded-xl px-6 py-4 text-white shadow-2xl border-2 border-gray-700">
          <div className="flex items-center gap-4">
            {/* Total Points */}
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1 font-semibold">💰 Total Points</p>
              <p className="text-4xl font-bold text-yellow-400 drop-shadow-lg">
                {userPoints}
              </p>
            </div>

            {/* Session Earnings */}
            {totalPointsEarned > 0 && (
              <div className="text-center border-l-2 border-gray-600 pl-4">
                <p className="text-xs text-gray-400 mb-1 font-semibold">🎯 Session</p>
                <p className="text-2xl font-semibold text-green-400 drop-shadow-lg">
                  +{totalPointsEarned}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {adsWatched} ads
                </p>
              </div>
            )}

            {/* Current Ad Progress - Real-time */}
            {isAdPlaying && (
              <div className="text-center border-l-2 border-gray-600 pl-4">
                <p className="text-xs text-gray-400 mb-1 font-semibold">⚡ Earning</p>
                <p className="text-3xl font-bold text-blue-400 animate-pulse drop-shadow-lg">
                  +{currentAdPoints}
                </p>
                <p className="text-xs text-gray-500 mt-1 truncate max-w-[100px]">
                  {currentAdName}
                </p>
              </div>
            )}
          </div>

          {/* Status Indicator */}
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-center justify-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isAdPlaying ? 'bg-blue-400 animate-pulse' : 'bg-green-400'}`}></div>
              <p className="text-xs text-gray-400 font-medium">
                {isAdPlaying ? '💰 Earning points...' : '⏳ Waiting for ad...'}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-3 pt-3 border-t border-gray-700 text-center">
            <p className="text-xs text-gray-500">
              {adsWatched > 0 && `Avg: ${(totalPointsEarned / adsWatched).toFixed(1)}s per ad`}
            </p>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="mt-3 w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition-colors"
          >
            🔄 Reset Points
          </button>
        </div>

        {/* Local Storage Notice */}
        <div className="absolute top-4 left-4 z-40 bg-yellow-900/90 backdrop-blur-sm rounded-lg px-4 py-2 text-white shadow-xl border border-yellow-700">
          <p className="text-xs font-bold">⚠️ LOCAL MODE</p>
          <p className="text-xs text-gray-300">Points saved in browser only</p>
        </div>

        {/* Video Player Component */}
        <PiPPlayer
          mainVideoUrl={MAIN_VIDEO}
          adVideoUrls={AD_VIDEOS}
          intervalSeconds={10}
          onStatusChange={handleVideoStatusChange}
          onAdProgress={handleAdProgress}
          onAdEnded={handleAdEnded}
        />

        {/* Instructions Panel - Bottom Left */}
        <div className="absolute bottom-4 left-4 z-40 bg-gray-900/90 backdrop-blur-sm rounded-lg px-4 py-3 text-white shadow-xl border border-gray-700 max-w-md">
          <h3 className="text-sm font-bold text-yellow-400 mb-2">📖 How It Works:</h3>
          <ul className="text-xs space-y-1 text-gray-300">
            <li>✓ Main video plays continuously</li>
            <li>✓ Random ad every 10 seconds</li>
            <li>✓ Earn <span className="text-blue-400 font-bold">1 point/second</span> during ads</li>
            <li>✓ Points added when ad completes</li>
            <li>✓ <span className="text-green-400 font-bold">PiP mode works with ads!</span></li>
            <li>✓ Points saved locally (refresh safe)</li>
          </ul>
        </div>

        {/* Debug Info - Bottom Right */}
        <div className="absolute bottom-4 right-4 z-40 bg-blue-900/90 backdrop-blur-sm rounded-lg px-3 py-2 text-white shadow-xl border border-blue-700 text-xs font-mono">
          <p className="font-bold text-blue-300 mb-1">🐛 Debug</p>
          <p>Total: {userPoints}</p>
          <p>Session: +{totalPointsEarned}</p>
          <p>Current Ad: +{currentAdPoints}</p>
          <p>Ad Mode: {isAdPlaying ? '✓' : '✗'}</p>
          <p>Ads Watched: {adsWatched}</p>
        </div>
      </div>
    </MuiNavbar>
  );
}

export default VideosUser;