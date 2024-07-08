import { useCallback, useRef } from 'react';
import { isFullScreen, Settings } from './useKeyDown';

const useHandleTap = (videoRef, fullScreenContainer, addKeyDownListener) => {
  const tapCount = useRef(0);
  const tapTimer = useRef(null);

  const handleTap = useCallback(() => {
    tapCount.current++;

    if (tapCount.current === 1) {
      tapTimer.current = setTimeout(() => {
        // Single tap logic here
        if (videoRef?.current?.paused) {
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
        addKeyDownListener();

        // Reset tap count after a delay
        tapCount.current = 0;
      }, Settings.TAP_TIMEOUT); // Adjust the delay as needed
    } else if (tapCount.current === 2) {
      clearTimeout(tapTimer.current);
      // Double tap logic here
      if (!isFullScreen()) {
        fullScreenContainer.current.webkitRequestFullScreen();
      } else {
        document.exitFullscreen();
      }

      // Reset tap count
      tapCount.current = 0;
    }
  }, [videoRef, fullScreenContainer, addKeyDownListener]);

  return handleTap;
};

export default useHandleTap;
