import React, { useEffect, useState } from 'react';
import MuiNavbar from '../../compoents/Navbars/MuiNavbar';
import usePipPlayer from '../../components/usePipPlayer';

function VideosUser() {
  const [mainVideoUrl, setMainVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);

  const pickBestMp4 = (video) => {
    const files = video?.video_files || [];
    const sd = files.find(f => f.file_type?.includes('mp4') && f.quality === 'sd');
    const mp4s = files.filter(f => f.file_type?.includes('mp4'));
    const widest = mp4s.sort((a,b)=> (b.width||0)-(a.width||0))[0];
    return (sd || widest || null)?.link || null;
  };

  useEffect(() => {
    const fetchPexelsVideo = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiKey = import.meta.env.VITE_PIXEL_API_KEY || import.meta.env.VITE_PEXELS_API_KEY;
        if (!apiKey) throw new Error('Missing VITE_PEXELS_API_KEY (or VITE_PIXEL_API_KEY)');
        const resp = await fetch(`https://api.pexels.com/videos/popular?per_page=10&page=${page}` , {
          headers: { Authorization: apiKey },
        });
        if (!resp.ok) throw new Error(`Pexels fetch failed: ${resp.status}`);
        const data = await resp.json();
        const list = Array.isArray(data?.videos) ? data.videos : [];
        const mapped = list.map(v => ({
          id: v?.id,
          url: pickBestMp4(v),
          image: v?.image,
          duration: v?.duration,
          user: v?.user?.name || 'Unknown'
        })).filter(v => !!v.url);
        setVideos(mapped);
        if (!mainVideoUrl && mapped[0]?.url) setMainVideoUrl(mapped[0].url);
      } catch (e) {
        console.error('Pexels video error:', e);
        setError(e.message);
        setVideos([]);
        if (!mainVideoUrl) setMainVideoUrl('/testpipads.mp4');
      } finally {
        setLoading(false);
      }
    };
    fetchPexelsVideo();
  }, [page]);

  return (
    <MuiNavbar>
			<div style={{ padding: '24px' }}>
				{/* Headless PiP player logic */}
				{(() => {
					const { playerRef, currentSource, isAdPlaying, isPiPActive, togglePiP, handleLoadedData } = usePipPlayer({
						mainVideoUrl,
						adVideoUrl: '/ads.mp4',
						intervalSeconds: 10,
					});

					return (
						<>
							{loading ? (
								<div>Loading video...</div>
							) : (
								<>
									<div className="w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-2xl">
										<video
											ref={playerRef}
											src={currentSource || ''}
											controls
											autoPlay
											muted
											playsInline
											crossOrigin="anonymous"
											onLoadedData={handleLoadedData}
											style={{ width: '100%', height: '100%' }}
										/>
									</div>
									<div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
										<button onClick={togglePiP} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', background: '#fff' }}>
											{isPiPActive ? 'Exit PiP' : 'Enter PiP'}
										</button>
										<span style={{ fontSize: 12, color: '#6b7280' }}>Ad: {isAdPlaying ? 'Playing' : 'Idle'}</span>
									</div>
								</>
							)}
						</>
					);
				})()}
				{!loading && (
					<div style={{ marginTop: 8, color: '#6b7280', fontSize: 12 }}>
						Using main video: {mainVideoUrl}
						{error && <span style={{ color: '#b91c1c' }}> (fallback due to: {error})</span>}
					</div>
				)}

				{/* Grid of fetched videos */}
				{!loading && (
					<div style={{ marginTop: 16 }}>
						<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
							{videos.map(v => (
								<div key={v.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
									<div style={{ aspectRatio: '16/9', background: `url(${v.image}) center/cover` }} />
									<div style={{ padding: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
										<div style={{ fontSize: 12, color: '#6b7280' }}>By {v.user}</div>
										<button onClick={() => setMainVideoUrl(v.url)} style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: 6, background: '#fff' }}>Play</button>
									</div>
								</div>
							))}
						</div>
						<div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
							<button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: 6, background: '#fff' }}>Prev</button>
							<span style={{ fontSize: 12, color: '#6b7280', alignSelf: 'center' }}>Page {page}</span>
							<button onClick={() => setPage(p => p + 1)} disabled={videos.length < 10} style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: 6, background: '#fff' }}>Next</button>
						</div>
					</div>
				)}
			</div>
    </MuiNavbar>
  );
}

export default VideosUser;