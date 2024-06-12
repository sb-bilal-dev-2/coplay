import React, { useCallback, useEffect, useRef, useState } from "react";
import Subtitles from "../components/Subtitles";
// This imports the functional component from the previous sample.
import "./MoviePage.css";
import throttle from "../throttle";
import classNames from "classnames";
import { Link, useParams } from "react-router-dom";
import { BASE_SERVER_URL } from "../api";
import axios from "axios";
import MovieWordCards from "./MovieWordCards";
import useAuthentication from "./Authentication.util";
import { useOutsideAlerter } from "../components/useOutsideAlerter";
import {
  Settings,
  useKeyDown,
  isFullScreen,
  secondsToDisplayTime,
} from "../helper/moviePage";

const VOLUME_SHOW_TIMEOUT = 500;

const SETTING_LANG = {
  ON: "ON",
  OFF: "OFF",
  ON_REWIND: "ON_REWIND",
};

const TRANSLATE_LANG = {
  UZ: "uz",
  RU: "ru",
};

const MoviePage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const { user: userIdAndEmail } = useAuthentication();
  const { title } = useParams();
  const [forceStateBoolean, forceStateUpdate] = useState(false);
  const [isMute, setMute] = useState(false);
    const [isDropOpen, setDropOpen] = useState(false);
    const outsideNavClickWrapperRef = useRef(null);
    useOutsideAlerter(outsideNavClickWrapperRef, () => setDropOpen(false));

  // Fetch movie details based on the title from your data source
  // For simplicity, I'll just display the movie title for now
  const [currentTime, setCurrentTime] = useState(
    Number(localStorage.getItem("currentTime" + title))
  );
  const videoRef = useRef(null);
  const [volume, setVolume] = useState(localStorage.getItem("volume"));

  const [subtitleSetting, setSubtitleSetting] = useState(false);
  const [subtitleType, setSubtitleType] = useState(undefined);

  const [translateSetting, setTransalteSetting] = useState(false);
  const [transalteType, setTransalteType] = useState(undefined);

  const [translateLangSubtitle, setTranslateLangSubtitle] = useState(undefined);

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
  // console.log("userId", userId);
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

  let translateLangSubtitleLocal = localStorage.getItem(
    "translateLangSubtitle"
  );

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
          <MovieWordCards
            title={title}
            parsedSubtitleId={currentItem.parsedSubtitleId}
            userId={userId}
          />
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

    let subtitleLocalstorage = localStorage.getItem("subtitleSetting");
    let translationLocalstorage = localStorage.getItem("transaltionSetting");

    const findSubtitleValue = (value) => {
      if (typeof subtitleLocalstorage === "undefined") {
        setSubtitleSetting(false);
        setSubtitleType(SETTING_LANG.ON);

        localStorage.setItem("subtitleSetting", SETTING_LANG.ON);
      }

      switch (value) {
        case SETTING_LANG.ON:
          setSubtitleSetting(false);
          setSubtitleType(SETTING_LANG.ON);
          break;

        case SETTING_LANG.OFF:
          setSubtitleSetting(true);
          setSubtitleType(SETTING_LANG.OFF);
          break;

        case SETTING_LANG.ON_REWIND:
          setSubtitleSetting(null);
          setSubtitleType(SETTING_LANG.ON_REWIND);
          break;

        default:
          console.warn(`Unexpected value: ${value}`);
          return; // Exit the function if the value is unexpected
      }

      // Save the new setting to localStorage
      localStorage.setItem("subtitleSetting", value);
    };

    const findTranslationValue = (value) => {
      if (typeof value === "undefined") {
        setTransalteSetting(false);
        setTransalteType(SETTING_LANG.ON);

        localStorage.setItem("transaltionSetting", SETTING_LANG.ON);
      }

      switch (value) {
        case SETTING_LANG.ON:
          setTransalteSetting(false);
          setTransalteType(SETTING_LANG.ON);
          break;

        case SETTING_LANG.OFF:
          setTransalteSetting(true);
          setTransalteType(SETTING_LANG.OFF);
          break;

        case SETTING_LANG.ON_REWIND:
          setTransalteSetting(null);
          setTransalteType(SETTING_LANG.ON_REWIND);
          break;

        default:
          console.warn(`Unexpected value: ${value}`);
          return; // Exit the function if the value is unexpected
      }

      localStorage.setItem("transaltionSetting", value);
    };

    const findTranslationSubtitleLang = (value) => {
      if (typeof translateLangSubtitleLocal === "undefined") {
        setTranslateLangSubtitle(TRANSLATE_LANG.UZ);

        localStorage.setItem("translateLangSubtitle", TRANSLATE_LANG.UZ);
      }

      switch (value) {
        case TRANSLATE_LANG.UZ:
          setTranslateLangSubtitle(TRANSLATE_LANG.UZ);
          break;

        default:
          console.warn(`Unexpected value: ${value}`);
          return; // Exit the function if the value is unexpected
      }

      localStorage.setItem("translateLangSubtitle", TRANSLATE_LANG.UZ);
    };

    useEffect(() => {
      findSubtitleValue(subtitleLocalstorage);
      findTranslationValue(translationLocalstorage);
      findTranslationSubtitleLang(translateLangSubtitleLocal);
    }, []);

    const handleSetting = (event) => {
      if (event.target.name === "subtitle") {
        findSubtitleValue(event.target.value);
      }

      if (event.target.name === "translation") {
        findTranslationValue(event.target.value);
      }

      if (event.target.name === "transaltionSubtitleLang") {
        findTranslationSubtitleLang(event.target.value);
      }
    };

    // const translatedSubtitleInfo = currentItem?.subtitleInfos?.find(
    //   (item) => item.title === translateLangSubtitleLocal
    // );


    console.log("translateLangSubtitle?._id", translateLangSubtitle);

    return (
      <div className="relative px-4">
        <i
          class="fa-regular fa-closed-captioning text-white font-medium cursor-pointer"
          onClick={() => setDropOpen(!isDropOpen)}
        />
        <div
          ref={outsideNavClickWrapperRef}
          className={`${
            isDropOpen ? "block" : "hidden"
          } absolute bg-black bottom-8 p-6 rounded drop-shadow-lg`}
        >
          {isDropOpen && (
            <ul className="w-80 flex justify-around">
              <li className="text-white font-bold w-40">
                <p className="pb-2">Subtitle</p>
                <label className="radio-container">
                  <input
                    type="radio"
                    name="subtitle"
                    value={SETTING_LANG.ON}
                    className="hidden"
                    onChange={handleSetting}
                  />
                  <p className="cursor-pointer pr-2">On</p>
                  <span
                    className={
                      subtitleType === SETTING_LANG.ON ? "" : "checkmark"
                    }
                  >
                    &#10003;
                  </span>
                </label>
                <label className="radio-container">
                  <input
                    type="radio"
                    name="subtitle"
                    value={SETTING_LANG.OFF}
                    className="hidden"
                    onChange={handleSetting}
                  />
                  <p className="cursor-pointer pr-2">Off</p>
                  <span
                    className={
                      subtitleType === SETTING_LANG.OFF ? "" : "checkmark"
                    }
                  >
                    &#10003;
                  </span>
                </label>
                <label class="radio-container">
                  <input
                    type="radio"
                    name="subtitle"
                    value={SETTING_LANG.ON_REWIND}
                    className="hidden"
                    onChange={handleSetting}
                  />
                  <p className="cursor-pointer pr-2">On rewind (5s)</p>
                  <span
                    className={
                      subtitleType === SETTING_LANG.ON_REWIND ? "" : "checkmark"
                    }
                  >
                    &#10003;
                  </span>
                </label>
              </li>
              <li className="text-white font-bold pl-6 w-40">
                <p className="pb-2">Translation</p>
                <label className="radio-container">
                  <input
                    type="radio"
                    name="translation"
                    value={SETTING_LANG.ON}
                    className="hidden"
                    onChange={handleSetting}
                  />
                  <p className="cursor-pointer pr-2">On</p>
                  <span
                    className={
                      transalteType === SETTING_LANG.ON ? "" : "checkmark"
                    }
                  >
                    &#10003;
                  </span>
                </label>
                <label class="radio-container">
                  <input
                    type="radio"
                    name="translation"
                    value={SETTING_LANG.OFF}
                    className="hidden"
                    onChange={handleSetting}
                  />
                  <p className="cursor-pointer pr-2 ">Off</p>
                  <span
                    className={
                      transalteType === SETTING_LANG.OFF ? "" : "checkmark"
                    }
                  >
                    &#10003;
                  </span>
                </label>
                <label className="radio-container">
                  <input
                    type="radio"
                    name="translation"
                    value={SETTING_LANG.ON_REWIND}
                    className="hidden"
                    onChange={handleSetting}
                  />
                  <p className="cursor-pointer pr-2 pb-2">On rewind (5s)</p>
                  <span
                    className={
                      transalteType === SETTING_LANG.ON_REWIND
                        ? ""
                        : "checkmark"
                    }
                  >
                    &#10003;
                  </span>
                </label>
                <span className="divide-y divide-solid min-w-80 h-1" />
                <label class="radio-container">
                  <input
                    type="radio"
                    name="transaltionSubtitleLang"
                    value={TRANSLATE_LANG.UZ}
                    className="hidden"
                    onChange={handleSetting}
                  />
                  <p className="cursor-pointer pr-2">Uz</p>
                  <span
                    className={
                      translateLangSubtitle === TRANSLATE_LANG.UZ
                        ? ""
                        : "checkmark"
                    }
                  >
                    &#10003;
                  </span>
                </label>
                <label class="radio-container">
                  <input
                    type="radio"
                    name="transaltionSubtitleLang"
                    value={TRANSLATE_LANG.RU}
                    className="hidden"
                    onChange={handleSetting}
                  />
                  <p className="cursor-pointer pr-2">Ru</p>
                  <span
                    className={
                      translateLangSubtitle === TRANSLATE_LANG.RU
                        ? ""
                        : "checkmark"
                    }
                  >
                    &#10003;
                  </span>
                </label>
              </li>
            </ul>
          )}
        </div>
      </div>
    );
  }

  function renderVideo() {
    const subtitleScale = 2;
    const subtitlePosition = 0.35;
    const localSubtitleScale = 1.6;
    const localSubtitlePosition = 0.3;
    const volumePercent = videoRef.current?.volume * 100;

    const toggleFullscreen = () => {
      if (!isFullScreen()) {
        fullScreenContainer.current.webkitRequestFullScreen();
        //   videoRef.current.currentTime += 10; // Seek forward by 10 seconds
      } else if (isFullScreen) {
        document.exitFullscreen();
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

    console.log("translatedSubtitleInfo")
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
          muted={isMute}
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
              <RenderDropMenu />
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
