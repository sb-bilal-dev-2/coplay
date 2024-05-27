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

const TAP_TIMEOUT = 160;
const REWIND_TIME = 5;
const VOLUE_STEP = 0.05;
const REWIND_SUBTITLE_TIMEOUT = 5000;
const VOLUME_SHOW_TIMEOUT = 500;

const MoviePage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const { user: userIdAndEmail } = useAuthentication();
  const { title } = useParams();

  // Fetch movie details based on the title from your data source
  // For simplicity, I'll just display the movie title for now
  const [currentTime, setCurrentTime] = useState(
    Number(localStorage.getItem("currentTime" + title))
  );
  const videoRef = useRef(null);
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
  // console.log('item', item)
  // console.log('currentItem', currentItem)
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
      }, TAP_TIMEOUT); // Adjust the delay as needed
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
  console.log("userInfo", userInfo);
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
      <RenderDropMenu />
      {renderVideo()}
      <div className="section bg-secondary">
        <div className="section-container">
          <MovieWordCards title={title} userId={userId} />
          <Link
            to={`/quiz/${title}`}
            className="text-white"
          ><b>
              Watch Unnkown Words of {currentItem?.label || title} <i className="fa fa-arrow-right" aria-hidden="true"></i>
            </b></Link>
          <br />
          <Link
            to="/quiz/learning"
            className="text-white cursor-pointer"
          ><b>
              Watch my Rehearse List <i className="fa fa-arrow-right" aria-hidden="true"></i>
            </b></Link>
        </div>
      </div>
    </div>
  );

  function RenderDropMenu() {
    const [isDropOpen, setDropOpen] = useState(false)
    const outsideNavClickWrapperRef = useRef(null);
    useOutsideAlerter(outsideNavClickWrapperRef, () => setDropOpen(false));

    return (
      <div className="relative">
        <button
          onClick={() => setDropOpen(!isDropOpen)}
          className="absolute z-10 top-4 right-4 text-white cursor-pointer"
        >
          {/* <i className="fa fa-arrow-left" aria-hidden="true"></i> */}
          CC/Transl.
        </button>
        {isDropOpen &&
          <ul className="z-20 Drop absolute bg-white top-8 right-4">
            <li>Subtitle: En/cc, on</li>
            <li>Translation 1: Uz/transl., off</li>
            <div className="InnerDrop">
              <div>
                <button
                  onClick={() => {}}
                  className="absolute z-10 top-4 right-4 text-white cursor-pointer"
                >

                  <i className="fa fa-arrow-left" aria-hidden="true"></i>
                  Subtitles
                </button>
                <span className="float-right font-small">Options</span>
              </div>
            </div>
          </ul>
        }
      </div>
    )
  }

  function renderVideo() {
    const subtitleScale = 2;
    const subtitlePosition = 0.35;
    const localSubtitleLocale = "ru";
    const localSubtitleScale = 1.6;
    const localSubtitlePosition = 0.3;

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
        </div>
        <Subtitles
          videoRef={videoRef}
          currentTime={currentTime}
          title={title}
          locale="en"
          subtitleScale={isFullScreen() ? subtitleScale : subtitleScale / 2}
          positionY={isFullScreen() ? subtitlePosition : subtitlePosition + 0.2}
          // hideSubtitles={!justRewinded}
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


function useKeyDown({
  videoRef,
  justRewindedTimeout,
  fullScreenContainer,
  volumeInfoShowTimeout,
}) {
  const handleKeyDown = (event) => {
    switch (event.key) {
      case "ArrowLeft":
        // Rewind
        videoRef.current.currentTime -= REWIND_TIME;
        const rewindSubtitleTimeout = justRewindedTimeout.current
          ? REWIND_SUBTITLE_TIMEOUT * 2
          : REWIND_SUBTITLE_TIMEOUT;

        justRewindedTimeout.current = setTimeout(() => {
          clearTimeout(justRewindedTimeout.current);
          justRewindedTimeout.current = null;
        }, rewindSubtitleTimeout);

        break;
      case "ArrowRight":
        // Skip forward
        videoRef.current.currentTime += REWIND_TIME;
        break;
      case "ArrowUp":
        event.preventDefault();
        // Increase volume
        if (videoRef.current.volume <= 1 - VOLUE_STEP) {
          const newVolume = round(
            videoRef.current.volume + VOLUE_STEP,
            VOLUE_STEP
          );
          videoRef.current.volume = newVolume;
          localStorage.setItem("volume", newVolume);
        }
        clearTimeout(volumeInfoShowTimeout.current);
        volumeInfoShowTimeout.current = null;
        volumeInfoShowTimeout.current = setTimeout(() => {
          clearTimeout(volumeInfoShowTimeout.current);
          volumeInfoShowTimeout.current = null;
        }, VOLUME_SHOW_TIMEOUT);
        break;
      case "ArrowDown":
        event.preventDefault();
        // Decrease volume
        if (videoRef.current.volume >= VOLUE_STEP) {
          const newVolume = round(
            videoRef.current.volume - VOLUE_STEP,
            VOLUE_STEP
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
        }, VOLUME_SHOW_TIMEOUT);
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
}

function isFullScreen() {
  return window.innerHeight === window.screen.height;
}

function secondsToDisplayTime(seconds = 0) {
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

function round(value, step) {
  step || (step = 1.0);
  var inv = 1.0 / step;
  return Math.round(value * inv) / inv;
}

export default MoviePage;
