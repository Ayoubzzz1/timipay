import React from 'react';
import MuiNavbar from '../../compoents/Navbars/MuiNavbar';
import PiPPlayer from '../../components/PiPPlayer';

function VideosUser() {
	return (
		<MuiNavbar>
			<div style={{ padding: '24px' }}>
				<PiPPlayer
					mainVideoUrl="/testpipads.mp4"
					adVideoUrl="/ads.mp4"
					intervalSeconds={10}
				/>
			</div>
		</MuiNavbar>
	);
}

export default VideosUser;