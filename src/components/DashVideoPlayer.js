import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import Subtitles from './Subtitles';
import { useVideo } from '../containers/MoviePage/useVideo';
import useHandleTap from '../containers/MoviePage/useHandleTap';
import { useKeyDown, isFullScreen } from '../containers/MoviePage/useKeyDown';
import { BASE_SERVER_URL } from '../api';
import './DashVideoPlayer.css'
import classNames from 'classnames';

// TODO: Safari(mobile) videojs controls are not working

function DashVideoPlayer({ title, currentItem }) {
  const {
    videoRef,
    fullScreenContainer,
    currentTime,
    // volume,
    // isMute,
    // isLoading,
    // showModal,
    // errorMessage,
    // progressPercent,
    throttledHandleTimeUpdate,
    // handleEnd,
    // handleSliderChange,
    // toggleFullscreen,
    // handleVolumeRange,
    // toggleVolume,
    // handleError,
    // handleCloseModal,
    // handlePlayPause,
    // handleWaiting,
    // handlePlaying,
    // handleCanPlay,
  } = useVideo(title);

  const playerRef = useRef(null);

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      playerRef.current = videojs(videoElement, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true,
        sources: [{
          src: BASE_SERVER_URL + `/movie?name=${title}`,
          type: 'video/mp4'
        }],
        html5: {
          nativeControlsForTouch: false,
        },
        playsinline: true,
        controlBar: {
          fullscreenToggle: false
        }
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);
  console.log('currentTime', currentTime)
  return (
    <div data-vjs-player style={{ position: 'relative'}}>
      <video ref={videoRef} className="video-js vjs-default-skin" onTimeUpdate={throttledHandleTimeUpdate} />
      <SubtitlePanel title={title} currentItem={currentItem} videoRef={videoRef} currentTime={currentTime} fullScreenContainer={fullScreenContainer} />
    </div>
  );
}

function SubtitlePanel({ title, currentItem, videoRef, currentTime }) {
  // const isMobile = useMobileDetect();
  const [subtitleSetting, setSubtitleSetting] = useState(false);
  const [translateSetting, setTranslateSetting] = useState(false);
  const translateLangSubtitleLocal = localStorage.getItem(
    "translateLangSubtitle"
  );

  const [translateLangSetting, setTranslateLangSetting] = useState(
    translateLangSubtitleLocal || "uz"
  );
    // console.log('translateLangSubtitleLocal', translateLangSubtitleLocal)
  const [addKeyDownListener, removeKeyDownListener] = useKeyDown({
    videoRef,
    justRewindedTimeout: { current: null },
    // fullScreenContainer,
    volumeInfoShowTimeout: { current: null },
  });

  const subtitleScale = 2;
  const subtitlePosition = 0.35;
  const localSubtitleScale = 1.6;
  const localSubtitlePosition = 0.3;
  // const volumePercent = videoRef.current?.volume * 100;


  const translatedSubtitleInfo = currentItem?.subtitleInfos?.find(
    (item) => item.title === translateLangSetting
  );

  // const handleTap = useHandleTap(
  //   videoRef,
  //   fullScreenContainer,
  //   addKeyDownListener
  // );


  return (
    <>
      <Subtitles
        subtitleId={currentItem?.parsedSubtitleId}
        videoRef={videoRef}
        currentTime={currentTime}
        title={title}
        locale="en"
        subtitleScale={isFullScreen() ? subtitleScale : subtitleScale / 2}
        positionY={isFullScreen() ? subtitlePosition : subtitlePosition + 0.2}
        hideSubtitles={subtitleSetting}
        tooltip
      />
      <Subtitles
        subtitleId={translatedSubtitleInfo?._id}
        subtitleScale={
          isFullScreen() ? localSubtitleScale : localSubtitleScale / 2
        }
        positionY={
          isFullScreen() ? localSubtitlePosition : localSubtitlePosition + 0.1
        }
        videoRef={videoRef}
        currentTime={currentTime}
        title={title}
        isEditable
        hideSubtitles={translateSetting}
        addKeyDownListener={addKeyDownListener}
        removeKeyDownListener={removeKeyDownListener}
      />
    </>
  )
}


export default DashVideoPlayer;