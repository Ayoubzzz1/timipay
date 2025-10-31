import { useState, useCallback } from 'react'

function usePictureInPicture(videoRef) {
  const [isActive, setIsActive] = useState(false)

  const togglePictureInPicture = useCallback(async (forceState) => {
    const video = videoRef?.current
    if (!video || !document.pictureInPictureEnabled) return

    try {
      const shouldEnter = typeof forceState === 'boolean'
        ? forceState
        : !document.pictureInPictureElement

      if (!shouldEnter) {
        await document.exitPictureInPicture()
        setIsActive(false)
        return
      }

      if (video.paused) {
        try { await video.play() } catch (_) {}
      }
      await video.requestPictureInPicture()
      setIsActive(true)
    } catch (_) {
      // ignore
    }
  }, [videoRef])

  return { isPictureInPictureActive: isActive, togglePictureInPicture }
}

export default usePictureInPicture


