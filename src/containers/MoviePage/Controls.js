import React from 'react';
import { secondsToDisplayTime } from './useKeyDown';
import VideoDropdown from './VideoDropdown';

export const Controls = ({
    isMobile, videoRef, handlePlayPause, isMute, toggleVolume, volumePercent, handleVolumeRange, setSubtitleSetting, setTranslateSetting, translateLangSetting, setTranslateLangSetting, toggleFullscreen, currentTime, handleSliderChange, progressPercent
}) => {
    return (
        <div className="controls">
            {isMobile ? (
                <div
                    className="top-1/2 left-2/4 relative "
                    onClick={handlePlayPause}
                >
                    {videoRef?.current?.paused ? (
                        <i className="fa fa-play text-2xl text-white"></i>
                    ) : (
                        <i className="fa fa-pause text-2xl text-white"></i>
                    )}
                </div>
            ) : null}

            <div className="row1">
                <span className="timeLeft">
                    {secondsToDisplayTime(videoRef?.current?.currentTime)} /{" "}
                    {secondsToDisplayTime(videoRef?.current?.duration)}
                </span>
                <input
                    className="slider"
                    type="range"
                    min={0}
                    max={videoRef?.current?.duration}
                    step={1}
                    onChange={handleSliderChange}
                    value={currentTime}
                    style={{
                        background: `linear-gradient(to right, #f98787 0%, #f98787 ${progressPercent}%, silver ${progressPercent}%, silver 100%)`,
                    }} />
            </div>
            <div className="flex justify-start">
                {!isMobile ? (
                    <div className="m-2 cursor-pointer" onClick={handlePlayPause}>
                        {videoRef?.current?.paused ? (
                            <i className="fa fa-play text-2xl text-white"></i>
                        ) : (
                            <i className="fa fa-pause text-2xl text-white"></i>
                        )}
                    </div>
                ) : null}
                <div className="flex justify-center align-middle items-center m-auto">
                    <i
                        className={`fas ${!isMute ? "fa-volume-up" : "fa-volume-mute"} text-white px-1 cursor-pointer`}
                        aria-hidden="true"
                        onClick={toggleVolume} />
                    <input
                        className="volume slider cursor-pointer"
                        style={{
                            background: isMute
                                ? "silver"
                                : `linear-gradient(to right, #f98787 0%, #f98787 ${volumePercent}%, silver ${volumePercent}%, silver 100%)`,
                        }}
                        type="range"
                        min={0}
                        max={1}
                        disabled={isMute}
                        step={0.01}
                        value={isMute ? 0 : videoRef.current?.volume}
                        onChange={handleVolumeRange} />
                    <VideoDropdown
                        setSubtitleSetting={setSubtitleSetting}
                        setTranslateSetting={setTranslateSetting}
                        translateLangSetting={translateLangSetting}
                        setTranslateLangSetting={setTranslateLangSetting} />
                    <i
                        className="fas fa-expand text-white cursor-pointer"
                        onClick={toggleFullscreen} />
                </div>
            </div>
        </div>
    );
};
