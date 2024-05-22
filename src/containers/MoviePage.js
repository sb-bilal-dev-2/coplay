import React, { useCallback, useEffect, useRef, useState } from "react";
import Subtitles from "../components/Subtitles";
// This imports the functional component from the previous sample.
import "./MoviePage.css";
import throttle from "../throttle";
import classNames from "classnames";
import { Link, useParams } from "react-router-dom";
import { BASE_SERVER_URL } from "../useRequests";
import axios from "axios";
import MovieWordCards from "./MovieWordCards";
import useAuthentication from "./Authentication.util";
import { useOutsideAlerter } from "../components/useOutsideAlerter";
import {
  Settings,
  useKeyDown,
  isFullScreen,
  secondsToDisplayTime,
  round,
} from "../helper/moviePage";

const VOLUME_SHOW_TIMEOUT = 500;

const MoviePage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const { user: userIdAndEmail } = useAuthentication();
  const { title } = useParams();
  const [forceStateBoolean, forceStateUpdate] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch movie details based on the title from your data source
  // For simplicity, I'll just display the movie title for now
  const [currentTime, setCurrentTime] = useState(
    Number(localStorage.getItem("currentTime" + title))
  );
  const videoRef = useRef(null);
  const [volume, setVolume] = useState(localStorage.getItem("volume"));

  // const [showOnRewind, setShowOnRewind] = useState(true)
  const justRewindedTimeout = useRef(null);
  const fullScreenContainer = useRef(null);
  const volumeInfoShowTimeout = useRef(null);
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
  console.log("userId", userId);
  const requestUserInfo = async () => {
    try {
      const response = await axios(`http://localhost:3001/users/${userId}`);
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
          `http://localhost:3001/movies?title=${title}`
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
    localStorage.removeItem("currentTime" + title);
  });
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
  const progressPercent =
    (videoRef?.current?.currentTime / videoRef?.current?.duration) * 100;

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
      <div className="section bg-secondary">
        <div className="section-container">
          <MovieWordCards title={title} userId={userId} />
          <Link to={`/quiz/${title}`} className="text-white">
            <b>
              Watch Unnkown Words of {currentItem?.label || title}{" "}
              <i className="fa fa-arrow-right" aria-hidden="true"></i>
            </b>
          </Link>
          <br />
          <Link to="/quiz/learning" className="text-white cursor-pointer">
            <b>
              Watch my Rehearse List{" "}
              <i className="fa fa-arrow-right" aria-hidden="true"></i>
            </b>
          </Link>
        </div>
      </div>
    </div>
  );

  function RenderDropMenu() {
    const [isDropOpen, setDropOpen] = useState(true);
    const outsideNavClickWrapperRef = useRef(null);
    useOutsideAlerter(outsideNavClickWrapperRef, () => setDropOpen(false));

    return (
      <div className="relative">
        <i
          class="fa-regular fa-closed-captioning text-white font-medium cursor-pointer"
          onClick={() => setDropOpen(!isDropOpen)}
        />
        {isDropOpen && (
          <ul className="z-20 Drop absolute bg-black bottom-10  w-auto rounded p-4 flex ">
            <li className="text-white font-bold pl-6">
              <h1 className="pb-2">Subtitle</h1>
              <p className="cursor-pointer py-1">On</p>
              <p className="cursor-pointer py-1">Off</p>
              <p className="cursor-pointer py-1">5 Sec</p>
            </li>
            <li className="text-white font-bold pl-6">
              <h1 className="pb-2">Translation</h1>
              <p className="cursor-pointer py-1">Uz/transl</p>
              <p className="cursor-pointer py-1">Off</p>
            </li>
          </ul>
        )}
      </div>
    );
  }

  function renderVideo() {
    const subtitleScale = 2;
    const subtitlePosition = 0.35;
    const localSubtitleLocale = "uz";
    const localSubtitleScale = 1.6;
    const localSubtitlePosition = 0.3;
    const volumePercent = videoRef.current?.volume * 100;

    const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen();
        }

        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }

        setIsFullscreen(false);
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

    return (
      <div
        className={classNames("videoItem", {
          fullScreen: isFullScreen(),
        })}
        ref={fullScreenContainer}
      >
        <video
          ref={videoRef}
          onTimeUpdate={throttledHandleTimeUpdate}
          onPointerDown={handleTap}
          onTouchStart={handleTap}
          onEnded={handleEnd}
        >
          <source
            src={BASE_SERVER_URL + `/movie?name=${title}`}
            type="video/mp4"
          />
        </video>
        <div
          className={classNames("volumeInfo", {
            hidden: !volumeInfoShowTimeout.current,
          })}
        >
          {Math.round((videoRef?.current?.volume || 0) * 100)}%
        </div>
        <div className="controls">
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
          <div className="flex justify-center">
            <div className="flex justify-center align-middle items-center">
              <i
                className="fas fa-volume-up text-white px-1"
                aria-hidden="true"
              />
              <input
                className="volume slider cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #f98787 0%, #f98787 ${volumePercent}%, silver ${volumePercent}%, silver 100%)`,
                }}
                type="range"
                min={0.0}
                max={1}
                step={Settings.VOLUME_STEP}
                value={volume}
                defaultValue={Number(localStorage.getItem("volume")) || 0.5}
                onChange={handleVolumeRange}
              />
              <i
                class="fas fa-tv text-white cursor-pointer px-4"
                onClick={toggleFullscreen}
              />
              <RenderDropMenu />
            </div>
          </div>
        </div>
        <Subtitles
          videoRef={videoRef}
          currentTime={currentTime}
          title={title}
          subtitleScale={isFullScreen() ? subtitleScale : subtitleScale / 2}
          positionY={isFullScreen() ? subtitlePosition : subtitlePosition + 0.2}
          hideSubtitles={!justRewinded}
          tooltip
        />
        <Subtitles
          subtitleScale={
            isFullScreen() ? localSubtitleScale : localSubtitleScale / 2
          }
          locale={localSubtitleLocale}
          // label={localSubtitleLocale} TODO: refactor 'locale' to 'label'
          positionY={
            isFullScreen() ? localSubtitlePosition : localSubtitlePosition + 0.1
          }
          videoRef={videoRef}
          currentTime={currentTime}
          title={title}
          isEditable
          hideSubtitles={!justRewinded}
          addKeyDownListener={addKeyDownListener}
          removeKeyDownListener={removeKeyDownListener}
        />
      </div>
    );
  }
};

export default MoviePage;
