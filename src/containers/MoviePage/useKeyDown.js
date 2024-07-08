import { useEffect, useRef } from "react";

export const Settings = {
  TAP_TIMEOUT: 160,
  REWIND_TIME: 5,
  VOLUME_STEP: 0.05,
  REWIND_SUBTITLE_TIMEOUT: 5000,
  VOLUME_SHOW_TIMEOUT: 500,
};

export const round = (value, step) => {
  step || (step = 1.0);
  var inv = 1.0 / step;
  return Math.round(value * inv) / inv;
};

export const useKeyDown = ({
  videoRef,
  justRewindedTimeout,
  fullScreenContainer,
  volumeInfoShowTimeout,
}) => {
  const handleKeyDown = (event) => {
    console.log('handleKeyDown', event)
    switch (event.key) {
      case "ArrowLeft":
        // Rewind
        videoRef.current.currentTime -= Settings.REWIND_TIME;
        const rewindSubtitleTimeout = justRewindedTimeout.current
          ? Settings.REWIND_SUBTITLE_TIMEOUT * 2
          : Settings.REWIND_SUBTITLE_TIMEOUT;

        justRewindedTimeout.current = setTimeout(() => {
          clearTimeout(justRewindedTimeout.current);
          justRewindedTimeout.current = null;
        }, rewindSubtitleTimeout);

        break;
      case "ArrowRight":
        // Skip forward
        videoRef.current.currentTime += Settings.REWIND_TIME;
        break;
      case "ArrowUp":
        event.preventDefault();
        // Increase volume
        if (videoRef.current.volume <= 1 - Settings.VOLUME_STEP) {
          const newVolume = round(
            videoRef.current.volume + Settings.VOLUME_STEP,
            Settings.VOLUME_STEP
          );
          
          videoRef.current.volume = newVolume;
          localStorage.setItem("volume", newVolume);
        }
        clearTimeout(volumeInfoShowTimeout.current);
        volumeInfoShowTimeout.current = null;
        volumeInfoShowTimeout.current = setTimeout(() => {
          clearTimeout(volumeInfoShowTimeout.current);
          volumeInfoShowTimeout.current = null;
        }, Settings.VOLUME_SHOW_TIMEOUT);
        break;
      case "ArrowDown":
        event.preventDefault();
        // Decrease volume
        if (videoRef.current.volume >= Settings.VOLUME_STEP) {
          const newVolume = round(
            videoRef.current.volume - Settings.VOLUME_STEP,
            Settings.VOLUME_STEP
          );
          localStorage.setItem("volume", newVolume);
          videoRef.current.volume = newVolume;
        } else {
          videoRef.current.volume = 0;
        }
        clearTimeout(volumeInfoShowTimeout.current);
        volumeInfoShowTimeout.current = null;
        volumeInfoShowTimeout.current = setTimeout(() => {
          clearTimeout(volumeInfoShowTimeout.current);
          volumeInfoShowTimeout.current = null;
        }, Settings.VOLUME_SHOW_TIMEOUT);
        break;

      case "Enter":
        // Pause control

        fullScreenContainer.current.webkitRequestFullScreen();

      default:
        break;
    }
    switch (event.which) {
      case 32: // Space
        event.preventDefault();
        if (videoRef?.current?.paused) {
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
    }
  };

  const handleKeyDownRef = useRef(handleKeyDown);

  useEffect(() => {
    // Listen for keydown events
    // document.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      // Remove the event listener when the component is unmounted
      document.removeEventListener("keydown", handleKeyDownRef.current);
    };
  }, []);

  const addKeyDownListener = () => {
    document.addEventListener("keydown", handleKeyDownRef.current);
  };

  const removeKeyDownListener = () => {
    document.removeEventListener("keydown", handleKeyDownRef.current);
  };

  return [addKeyDownListener, removeKeyDownListener];
};

export const isFullScreen = () => {
  return window.innerHeight === window.screen.height;
}

export const secondsToDisplayTime = (seconds = 0) => {
  const d = Number(seconds);
  const h = Math.floor(d / 3600);
  const m = Math.floor((d % 3600) / 60);
  const s = Math.floor(d % 60);
  let displayItem = "";
  if (h) {
    displayItem += h + ":";
  }
  if (m < 10 && displayItem.length) {
    displayItem += 0;
  }
  displayItem += m + ":";
  if (s < 10) {
    displayItem += 0;
  }
  displayItem += s;
  return displayItem;
}
