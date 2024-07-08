import { useState, useEffect, useRef, useCallback } from 'react';
import throttle from "../../throttle";
import { isFullScreen } from "./useKeyDown";

const VOLUME_SHOW_TIMEOUT = 500;

export const useVideo = (title) => {
  const videoRef = useRef(null);
  const fullScreenContainer = useRef(null);
  const volumeInfoShowTimeout = useRef(null);

  const [currentTime, setCurrentTime] = useState(
    Number(localStorage.getItem("currentTime" + title))
  );
  const [volume, setVolume] = useState(localStorage.getItem("volume"));
  const [isMute, setMute] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [forceStateBoolean, forceStateUpdate] = useState(false);

  const handleTimeUpdate = useCallback(() => {
    setCurrentTime(videoRef.current.currentTime);
    localStorage.setItem("currentTime" + title, videoRef.current.currentTime);
  }, [title]);

  const throttledHandleTimeUpdate = throttle(handleTimeUpdate, 1000);
  const progressPercent =
    (videoRef?.current?.currentTime / videoRef?.current?.duration) * 100;

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const previousCurrentTime = Number(localStorage.getItem("currentTime" + title));
      if (previousCurrentTime) {
        video.currentTime = previousCurrentTime;
      }

      const localVolume = Number(localStorage.getItem("volume")) || 0.8;
      if (localVolume) {
        video.volume = localVolume;
      }
    }
  }, [title]);

  const handleEnd = useCallback(() => {
    setIsLoading(false);
    localStorage.removeItem("currentTime" + title);
  }, [title]);

  const handleSliderChange = (event) => {
    setCurrentTime(event.target.value);
    videoRef.current.currentTime = event.target.value;
  };

  const toggleFullscreen = () => {
    if (!isFullScreen()) {
      fullScreenContainer?.current?.webkitRequestFullScreen();
    } else if (isFullScreen()) {
      document.exitFullscreen();
    }
  };

  const handleVolumeRange = (event) => {
    videoRef.current.volume = event.target.value;
    setVolume(event.target.value);
    localStorage.setItem("volume", event.target.value);

    clearTimeout(volumeInfoShowTimeout.current);
    volumeInfoShowTimeout.current = setTimeout(() => {
      clearTimeout(volumeInfoShowTimeout.current);
      volumeInfoShowTimeout.current = null;
      forceStateUpdate(!forceStateBoolean);
    }, VOLUME_SHOW_TIMEOUT);
  };

  const toggleVolume = () => {
    setMute((prevMute) => {
      if (prevMute) {
        videoRef.current.volume = localStorage.getItem("volume");
      } else {
        videoRef.current.volume = 0;
      }
      return !prevMute;
    });
  };

  const handleError = () => {
    setIsLoading(false);
    setErrorMessage(
      "Failed to load the video. Please check the source or your network connection."
    );
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handlePlayPause = () => {
    if (videoRef?.current?.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const handleWaiting = () => {
    setIsLoading(true);
  };

  const handlePlaying = () => {
    setIsLoading(false);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  return {
    videoRef,
    fullScreenContainer,
    currentTime,
    volume,
    isMute,
    isLoading,
    showModal,
    errorMessage,
    progressPercent,
    throttledHandleTimeUpdate,
    handleEnd,
    handleSliderChange,
    toggleFullscreen,
    handleVolumeRange,
    toggleVolume,
    handleError,
    handleCloseModal,
    handlePlayPause,
    handleWaiting,
    handlePlaying,
    handleCanPlay,
  };
};