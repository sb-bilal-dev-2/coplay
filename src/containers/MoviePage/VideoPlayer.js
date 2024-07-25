import React, { useEffect, useState } from "react";
import classNames from "classnames";
import { isFullScreen, useKeyDown } from "./useKeyDown";
import Modal from "../../components/Modal";
import Subtitles from "../../components/Subtitles";
import { BASE_SERVER_URL } from "../../api";
import useMobileDetect from "../../helper/useMobileDetect";
import { useVideo } from "./useVideo";
import useHandleTap from "./useHandleTap";
import { Controls } from "./Controls";

const VideoPlayer = ({ title, currentItem }) => {
  const isMobile = useMobileDetect();
  const [subtitleSetting, setSubtitleSetting] = useState(false);
  const [translateSetting, setTranslateSetting] = useState(false);
  const translateLangSubtitleLocal = localStorage.getItem(
    "translateLangSubtitle"
  );

  const [translateLangSetting, setTranslateLangSetting] = useState(
    translateLangSubtitleLocal || "uz"
  );

  const {
    videoRef,
    fullScreenContainer,
    currentTime,
    // volume,
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
  } = useVideo(title);

  const [addKeyDownListener, removeKeyDownListener] = useKeyDown({
    videoRef,
    justRewindedTimeout: { current: null },
    fullScreenContainer,
    volumeInfoShowTimeout: { current: null },
  });

  const subtitleScale = 2;
  const subtitlePosition = 0.35;
  const localSubtitleScale = 1.6;
  const localSubtitlePosition = 0.3;
  const volumePercent = videoRef.current?.volume * 100;

 
  const translatedSubtitleInfo = currentItem?.subtitleInfos?.find(
    (item) => item.title === translateLangSetting
  );

  const handleTap = useHandleTap(
    videoRef,
    fullScreenContainer,
    addKeyDownListener
  );

  return (
    <div
      className={classNames(`videoItem`, {
        fullScreen: isFullScreen(),
      })}
      ref={fullScreenContainer}
    >
      {isLoading && (
        <div className="spinner">
          <div className="loader"></div>
        </div>
      )}
      <video
        ref={videoRef}
        onTimeUpdate={throttledHandleTimeUpdate}
        onEnded={handleEnd}
        muted={isMute}
        onPointerDown={handleTap}
        onTouchStart={handleTap}
        onError={handleError}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onCanPlay={handleCanPlay}
      >
        <source
          src={BASE_SERVER_URL + `/movie?name=${title}`}
          type="video/mp4"
        />
      </video>
      <Modal
        show={showModal}
        message={errorMessage}
        onClose={handleCloseModal}
      />
      <Controls
        isMobile={isMobile}
        videoRef={videoRef}
        handlePlayPause={handlePlayPause}
        isMute={isMute}
        toggleVolume={toggleVolume}
        volumePercent={volumePercent}
        handleVolumeRange={handleVolumeRange}
        subtitleSetting={subtitleSetting}
        setSubtitleSetting={setSubtitleSetting}
        translateSetting={translateSetting}
        setTranslateSetting={setTranslateSetting}
        translateLangSetting={translateLangSetting}
        setTranslateLangSetting={setTranslateLangSetting}
        toggleFullscreen={toggleFullscreen}
        currentTime={currentTime}
        handleSliderChange={handleSliderChange}
        progressPercent={progressPercent}
      />
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
    </div>
  );
};

export default VideoPlayer;
