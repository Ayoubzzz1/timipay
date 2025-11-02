import { useState, useCallback, useEffect } from 'react'

function usePictureInPicture(videoRef) {
  const [isActive, setIsActive] = useState(false)

  // Listen for PiP events to update state
  useEffect(() => {
    const video = videoRef?.current
    if (!video) return

    const handleEnterPip = () => {
      setIsActive(true)
    }

    const handleLeavePip = () => {
      setIsActive(false)
    }

    video.addEventListener('enterpictureinpicture', handleEnterPip)
    video.addEventListener('leavepictureinpicture', handleLeavePip)

    // Safari support
    if ('webkitSupportsPresentationMode' in video) {
      const handleWebkitChange = () => {
        setIsActive(video.webkitPresentationMode === 'picture-in-picture')
      }
      video.addEventListener('webkitpresentationmodechanged', handleWebkitChange)
      
      return () => {
        video.removeEventListener('enterpictureinpicture', handleEnterPip)
        video.removeEventListener('leavepictureinpicture', handleLeavePip)
        video.removeEventListener('webkitpresentationmodechanged', handleWebkitChange)
      }
    }

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPip)
      video.removeEventListener('leavepictureinpicture', handleLeavePip)
    }
  }, [videoRef])

  const togglePictureInPicture = useCallback(async (forceState) => {
    const video = videoRef?.current
    if (!video || !document.pictureInPictureEnabled) return

    try {
      const shouldEnter = typeof forceState === 'boolean'
        ? forceState
        : !document.pictureInPictureElement

      if (!shouldEnter) {
        await document.exitPictureInPicture()
        return
      }

      if (video.paused) {
        try { await video.play() } catch (_) {}
      }
      await video.requestPictureInPicture()
    } catch (_) {
      // ignore
    }
  }, [videoRef])

  return { isPictureInPictureActive: isActive, togglePictureInPicture }
}

export default usePictureInPicture


