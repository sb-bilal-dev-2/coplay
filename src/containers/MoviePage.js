import React, { useCallback, useEffect, useRef, useState } from "react";
import Subtitles from "../components/Subtitles";
// This imports the functional component from the previous sample.
import "./MoviePage.css";
import throttle from "../throttle";
import classNames from "classnames";
import { Link, useParams, useNavigate } from "react-router-dom";
import { BASE_SERVER_URL } from "../api";
import axios from "axios";
import MovieWordCards from "./MovieWordCards";
import useAuthentication from "./Authentication.util";
import {
  Settings,
  useKeyDown,
  isFullScreen,
  secondsToDisplayTime,
} from "../helper/moviePage";
import Modal from "../components/Modal";
import VideoDropdown from "../components/VideoDropdown";
import useMobileDetect from "../helper/useMobileDetect";
import SecondaryButton from "../components/SecondaryButton";
import { useTranslation } from "react-i18next";
import { usePremiumStatus } from "../helper/usePremiumStatus";

const VOLUME_SHOW_TIMEOUT = 500;

const MoviePage = () => {
  const { t } = useTranslation();

  const [userInfo, setUserInfo] = useState(null);
  const { user } = useAuthentication();
  const { userIdAndEmail = null, premiumExpireDate = null } = user || {};

  const { title } = useParams();
  const [forceStateBoolean, forceStateUpdate] = useState(false);
  const [isMute, setMute] = useState(false);

  // Fetch movie details based on the title from your data source
  // For simplicity, I'll just display the movie title for now
  const [currentTime, setCurrentTime] = useState(
    Number(localStorage.getItem("currentTime" + title))
  );
  const videoRef = useRef(null);
  const [volume, setVolume] = useState(localStorage.getItem("volume"));

  const [subtitleSetting, setSubtitleSetting] = useState(false);
  const [translateSetting, setTransalteSetting] = useState(false);
  const [transalteLangSetting, setTransalteLangSetting] = useState("uz");

  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const justRewindedTimeout = useRef(null);
  const fullScreenContainer = useRef(null);
  const volumeInfoShowTimeout = useRef(null);

  const isPremiumUser = usePremiumStatus(premiumExpireDate);

  const handleTimeUpdate = useCallback(() => {
    setCurrentTime(videoRef.current.currentTime);
    localStorage.setItem("currentTime" + title, videoRef.current.currentTime);
  }, [videoRef?.current?.currentTime]);

  const throttledHandleTimeUpdate = throttle(handleTimeUpdate, 1000);
  const [addKeyDownListener, removeKeyDownListener] = useKeyDown({
    videoRef,
    justRewindedTimeout,
    fullScreenContainer,
    volumeInfoShowTimeout,
  });
  const [currentItem, setCurrentItem] = useState({});
  const userId = userIdAndEmail?.id;

  const requestUserInfo = async () => {
    try {
      const response = await axios(`${BASE_SERVER_URL}/users/${userId}`);
      const newUserInfo = response.data;
      console.log("newUserInfo", newUserInfo);
      setUserInfo(newUserInfo);
    } catch (err) {
      console.log("ITEM GET ERROR: ", err);
    }
  };

  useEffect(() => {
    if (userId) {
      requestUserInfo();
    }
  }, [userId]);

  useEffect(() => {
    const requestMovieInfo = async () => {
      try {
        const response = await axios(
          `${BASE_SERVER_URL}/movies?title=${title}`
        );
        const newMovieInfo = response.data?.results[0];
        console.log("newMovieInfo", newMovieInfo);
        setCurrentItem(newMovieInfo);
      } catch (err) {
        console.log("ITEM GET ERROR: ", err);
      }
    };

    const video = videoRef.current;
    requestMovieInfo();

    // Set the currentTime to the timestamp value (332995.39999999106)
    const previousCurrentTime = Number(
      localStorage.getItem("currentTime" + title)
    );
    if (previousCurrentTime) {
      video.currentTime = previousCurrentTime;
    }

    const localVolume = Number(localStorage.getItem("volume")) || 0.8;
    if (localVolume) {
      video.volume = localVolume;
    }
  }, []);

  const handleEnd = useCallback(() => {
    setIsLoading(false);
    localStorage.removeItem("currentTime" + title);
  });

  const isMobile = useMobileDetect();
  const [isLoading, setIsLoading] = useState(true);

  let tapCount = 0;
  let tapTimer;

  const handleTap = useCallback(() => {
    tapCount++;

    if (tapCount === 1) {
      tapTimer = setTimeout(() => {
        // Single tap logic here
        // For example, pause/play the video
        if (videoRef?.current?.paused) {
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
        addKeyDownListener();

        // Reset tap count after a delay
        tapCount = 0;
      }, Settings.TAP_TIMEOUT); // Adjust the delay as needed
    } else if (tapCount === 2) {
      clearTimeout(tapTimer);
      // Double tap logic here
      // For example, seek forward or backward
      if (!isFullScreen()) {
        fullScreenContainer.current.webkitRequestFullScreen();
        //   videoRef.current.currentTime += 10; // Seek forward by 10 seconds
      } else if (isFullScreen) {
        document.exitFullscreen();
      }

      // Reset tap count
      tapCount = 0;
    }
  }, [tapCount, tapTimer]);
  const justRewinded = justRewindedTimeout.current;
  const handleSliderChange = (event) => {
    setCurrentTime(event.target.value);
    videoRef.current.currentTime = event.target.value;
  };

  let translateLangSubtitleLocal = localStorage.getItem(
    "translateLangSubtitle"
  );

  const progressPercent =
    (videoRef?.current?.currentTime / videoRef?.current?.duration) * 100;

  const navigate = useNavigate();

  useEffect(() => {
    if (currentItem?.isPremium) {
      if (isPremiumUser === undefined) {
        navigate("/price_page");
      }
    }
  }, []);

  return (
    <div className="page-container relative">
      <Link
        to="/"
        className="absolute z-10 top-4 left-4 text-white cursor-pointer"
      >
        <i className="fa fa-arrow-left" aria-hidden="true"></i>
      </Link>
      <h2 className="absolute z-10 top-3 left-16 text-gray-100">
        {currentItem?.label || title}
      </h2>
      {renderVideo()}
      <div className="section bg-secondary card-section">
        <div className="section-container">
          <MovieWordCards
            title={title}
            parsedSubtitleId={currentItem.parsedSubtitleId}
            userId={userId}
          />
          <div className="flex justify-center align-middle">
            <SecondaryButton
              path={`/quiz/${title}`}
              title={t("watch words of", { item: currentItem?.label || title })}
            />
          </div>
        </div>
      </div>
    </div>
  );

  function renderVideo() {
    const subtitleScale = 2;
    const subtitlePosition = 0.35;
    const localSubtitleScale = 1.6;
    const localSubtitlePosition = 0.3;
    const volumePercent = videoRef.current?.volume * 100;

    const toggleFullscreen = () => {
      if (!isFullScreen()) {
        fullScreenContainer?.current?.webkitRequestFullScreen();
        //   videoRef.current.currentTime += 10; // Seek forward by 10 seconds
      } else if (isFullScreen()) {
        videoRef?.exitFullscreen();
      }
    };

    const handleVolumeRange = (event) => {
      videoRef.current.volume = event.target.value;
      setVolume(event.target.value);
      localStorage.setItem("volume", event.target.value);

      clearTimeout(volumeInfoShowTimeout.current);
      volumeInfoShowTimeout.current = null;
      volumeInfoShowTimeout.current = setTimeout(() => {
        clearTimeout(volumeInfoShowTimeout.current);
        volumeInfoShowTimeout.current = null;
        forceStateUpdate(!forceStateBoolean);
      }, VOLUME_SHOW_TIMEOUT);
    };

    const toggleVolume = () => {
      setMute(true);

      if (isMute) {
        videoRef.current.volume = localStorage.getItem("volume");
        setMute(false);
      }
    };

    const translatedSubtitleInfo = currentItem?.subtitleInfos?.find(
      (item) => item.title === translateLangSubtitleLocal
    );

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

    const handlePusePlay = () => {
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

    const handleTap = () => {
      // Handle tap event
    };

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
          onPointerDown={handleTap}
          onTouchStart={handleTap}
          onEnded={handleEnd}
          muted={isMute}
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
        {/* Error Modal */}
        <Modal
          show={showModal}
          message={errorMessage}
          onClose={handleCloseModal}
        />
        <div
          className={classNames("volumeInfo", {
            hidden: !volumeInfoShowTimeout.current,
          })}
        >
          {Math.round((videoRef?.current?.volume || 0) * 100)}%
        </div>
        <div className="controls">
          {isMobile ? (
            <div
              className="top-1/2 left-2/4 relative "
              onClick={handlePusePlay}
            >
              {videoRef?.current?.paused ? (
                <i class="fa fa-play text-2xl text-white"></i>
              ) : (
                <i class="fa fa-pause text-2xl text-white"></i>
              )}{" "}
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
              // defaultValue={Number(localStorage.getItem('currentTime')) || 0}
              onChange={handleSliderChange}
              value={currentTime}
              style={{
                background: `linear-gradient(to right, #f98787 0%, #f98787 ${progressPercent}%, silver ${progressPercent}%, silver 100%)`,
              }}
            />
          </div>
          <div className="flex justify-start">
            {!isMobile ? (
              <div className="m-2 cursor-pointer" onClick={handlePusePlay}>
                {videoRef?.current?.paused ? (
                  <i class="fa fa-play text-2xl text-white"></i>
                ) : (
                  <i class="fa fa-pause text-2xl text-white"></i>
                )}{" "}
              </div>
            ) : null}
            <div className="flex justify-center align-middle items-center m-auto">
              <i
                className={`fas ${
                  !isMute ? "fa-volume-up" : "fa-volume-mute"
                } text-white px-1 cursor-pointer`}
                aria-hidden="true"
                onClick={toggleVolume}
              />
              <input
                className="volume slider cursor-pointer"
                style={{
                  background: isMute
                    ? "silver"
                    : `linear-gradient(to right, #f98787 0%, #f98787 ${volumePercent}%, silver ${volumePercent}%, silver 100%)`,
                }}
                type="range"
                min={0.0}
                max={1}
                disabled={isMute}
                step={Settings.VOLUME_STEP}
                value={isMute ? 0.0 : volume}
                defaultValue={Number(localStorage.getItem("volume")) || 0.5}
                onChange={handleVolumeRange}
              />
              <VideoDropdown
                setSubtitleSetting={setSubtitleSetting}
                setTransalteSetting={setTransalteSetting}
                transalteLangSetting={transalteLangSetting}
                setTransalteLangSetting={setTransalteLangSetting}
              />
              <i
                class="fas fa-expand text-white cursor-pointer"
                onClick={toggleFullscreen}
              />
            </div>
          </div>
        </div>
        <Subtitles
          subtitleId={currentItem?.parsedSubtitleId}
          videoRef={videoRef}
          currentTime={currentTime}
          title={title}
          locale="en"
          subtitleScale={isFullScreen() ? subtitleScale : subtitleScale / 2}
          positionY={isFullScreen() ? subtitlePosition : subtitlePosition + 0.2}
          hideSubtitles={
            subtitleSetting !== null ? subtitleSetting : !justRewinded
          }
          tooltip
        />
        <Subtitles
          subtitleId={translatedSubtitleInfo?._id}
          subtitleScale={
            isFullScreen() ? localSubtitleScale : localSubtitleScale / 2
          }
          // label={localSubtitleLocale} TODO: refactor 'locale' to 'label'
          positionY={
            isFullScreen() ? localSubtitlePosition : localSubtitlePosition + 0.1
          }
          videoRef={videoRef}
          currentTime={currentTime}
          title={title}
          isEditable
          hideSubtitles={
            translateSetting !== null ? translateSetting : !justRewinded
          }
          addKeyDownListener={addKeyDownListener}
          removeKeyDownListener={removeKeyDownListener}
        />
      </div>
    );
  }
};

export default MoviePage;
