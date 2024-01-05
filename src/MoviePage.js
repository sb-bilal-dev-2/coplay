import React, { useCallback, useEffect, useRef, useState } from 'react';
import Subtitles from './components/Subtitles';
// This imports the functional component from the previous sample.
import './MoviePage.css'
import { useDebounce } from '@uidotdev/usehooks';
import throttle from './throttle'
import classNames from 'classnames';
import { debounce } from './debounce';
import { useParams } from 'react-router-dom';

const TAP_TIMEOUT = 160
const REWIND_TIME = 5
const VOLUE_STEP = 0.05
const REWIND_SUBTITLE_TIMEOUT = 5000
const VOLUME_SHOW_TIMEOUT = 500

const MoviePage = () => {
  const [settings, setSettings] = useState({})
  const { title, initialTimeFromUrl} = useParams();
  // Fetch movie details based on the title from your data source
  // For simplicity, I'll just display the movie title for now
  const [showEnSubtitles, setShowEnSubtitles] = useState(true)
  const [currentTime, setCurrentTime] = useState(Number(localStorage.getItem('currentTime' + title)))
  const videoRef = useRef(null)
  // const [showOnRewind, setShowOnRewind] = useState(true)
  const justRewindedTimeout = useRef(null)
  const fullScreenContainer = useRef(null)
  const volumeInfoShowTimeout = useRef(null)

  useEffect(() => {
    const video = videoRef.current;

    // Set the currentTime to the timestamp value (332995.39999999106)
    const previousCurrentTime = Number(localStorage.getItem('currentTime' + title))
    if (previousCurrentTime) {
      video.currentTime = previousCurrentTime;
    }

    const localVolume = Number(localStorage.getItem('volume')) || 0.8
    if (localVolume) {
      video.volume = localVolume
    }
    const rewindTime = REWIND_TIME; // in seconds
    const skipForwardTime = REWIND_TIME; // in seconds

    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          // Rewind
          video.currentTime -= rewindTime;
          const rewindSubtitleTimeout = justRewindedTimeout.current ? REWIND_SUBTITLE_TIMEOUT * 2 : REWIND_SUBTITLE_TIMEOUT
          // console.log("rewindSubtitleTimeout", rewindSubtitleTimeout)
          justRewindedTimeout.current = setTimeout(() => {
            clearTimeout(justRewindedTimeout.current)
            justRewindedTimeout.current = null;
          }, rewindSubtitleTimeout)
          break;
        case 'ArrowRight':
          // Skip forward
          video.currentTime += skipForwardTime;
          break;
        case 'ArrowUp':
          // Increase volume
          if (video.volume <= 1 - VOLUE_STEP) {
            const newVolume = round(video.volume + VOLUE_STEP, VOLUE_STEP)
            video.volume = newVolume;
            localStorage.setItem('volume', newVolume)
          }
          clearTimeout(volumeInfoShowTimeout.current)
          volumeInfoShowTimeout.current = null;
          volumeInfoShowTimeout.current = setTimeout(() => {
            clearTimeout(volumeInfoShowTimeout.current)
            volumeInfoShowTimeout.current = null;
          }, VOLUME_SHOW_TIMEOUT)
          break;
        case 'ArrowDown':
          // Decrease volume
          if (video.volume >= VOLUE_STEP) {
            const newVolume = round(video.volume - VOLUE_STEP, VOLUE_STEP)
            localStorage.setItem('volume', newVolume)
            video.volume = newVolume;
          } else {
            video.volume = 0
          }
          clearTimeout(volumeInfoShowTimeout.current)
          volumeInfoShowTimeout.current = null;
          volumeInfoShowTimeout.current = setTimeout(() => {
            clearTimeout(volumeInfoShowTimeout.current)
            volumeInfoShowTimeout.current = null;
          }, VOLUME_SHOW_TIMEOUT)
          break;

        case 'Enter':
          // Pause control
          // video.webkitRequestFullScreen()
          fullScreenContainer.current.webkitRequestFullScreen();
        // if (video.paused) {
        //   video.play()
        // } else {
        //   video.pause()
        // }

        default:
          break;
      }
      switch (event.which) {
        case 32: // Space
          if (video.paused) {
            video.play()
          } else {
            video.pause()
          }
      }
    };

    // Listen for keydown events
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      // Remove the event listener when the component is unmounted
      document.removeEventListener('keydown', handleKeyDown);
    };

  }, []);

  const handleTimeUpdate = useCallback(() => {
    setCurrentTime(videoRef.current.currentTime)
    localStorage.setItem('currentTime' + title, videoRef.current.currentTime)
  }, [videoRef?.current?.currentTime])
  const throttledHandleTimeUpdate = throttle(handleTimeUpdate, 1000);

  const handleEnd = useCallback(() => {
    localStorage.removeItem('currentTime' + title)
  })
  // const videoRef = useRef(null);
  let tapCount = 0;
  let tapTimer;

  const handleTap = useCallback(() => {
    tapCount++;

    if (tapCount === 1) {
      tapTimer = setTimeout(() => {
        // Single tap logic here
        // For example, pause/play the video
        if (videoRef.current.paused) {
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }

        // Reset tap count after a delay
        tapCount = 0;
      }, TAP_TIMEOUT); // Adjust the delay as needed
    } else if (tapCount === 2) {
      clearTimeout(tapTimer);
      // Double tap logic here
      // For example, seek forward or backward
      if (!isFullScreen()) {
        fullScreenContainer.current.webkitRequestFullScreen()
        //   videoRef.current.currentTime += 10; // Seek forward by 10 seconds
      } else if (isFullScreen) {
        document.exitFullscreen()
      }

      // Reset tap count
      tapCount = 0;
    }
  }, [tapCount, tapTimer]);
  const justRewinded = justRewindedTimeout.current;

  const handleSliderChange = (event) => {
        setCurrentTime(event.target.value)
        videoRef.current.currentTime = event.target.value;
  }
  const progressPercent = videoRef?.current?.currentTime / videoRef?.current?.duration * 100
  // console.log(progressPercent)
  return (
    <div className='container'>
      <div className='VideoPage'>
        <h2>Title of The Movie: {title}</h2>
        <br />
        <div className={classNames("videoItem", {
          'fullScreen': isFullScreen(),
        })} ref={fullScreenContainer}>
          <video
            ref={videoRef}
            onTimeUpdate={throttledHandleTimeUpdate}
            onPointerDown={handleTap}
            onTouchStart={handleTap}
            onEnded={handleEnd}
          >
            <source src={`http://localhost:3001/movie?name=${title}`} type="video/mp4" />
          </video>
          <div
            className={classNames('volumeInfo', { 'hidden': !volumeInfoShowTimeout.current })}
          >
            {Math.round((videoRef?.current?.volume || 0) * 100)}%
          </div>
          <div className='controls'>
            <div className='row1'>
              <span className='timeLeft'>{secondsToDisplayTime(videoRef?.current?.currentTime)} / {secondsToDisplayTime(videoRef?.current?.duration)}</span>
              <input 
                className='slider'
                type='range'
                min={0}
                max={videoRef?.current?.duration}
                step={1}
                // defaultValue={Number(localStorage.getItem('currentTime')) || 0}
                onChange={handleSliderChange}
                value={currentTime}
                style={{
                  background: `linear-gradient(to right, red 0%, red ${progressPercent}%, silver ${progressPercent}%, silver 100%)`
                }}
              />
            </div>
          </div>
            <Subtitles
              videoRef={videoRef}
              currentTime={currentTime}
              title={title}
              // hideSubtitles={!justRewinded}
              tooltip
            />
            <Subtitles
              positionY={0.3}
              locale='uz'
              videoRef={videoRef}
              currentTime={currentTime}
              title={title}
              hideSubtitles={!justRewinded}
            />
        </div>
      </div>
    </div>
  )
}

function isFullScreen() {
  return window.innerHeight == window.screen.height
}

function secondsToDisplayTime(seconds = 0) {
    const d = Number(seconds);
    const h = Math.floor(d / 3600);
    const m = Math.floor(d % 3600 / 60);
    const s = Math.floor(d % 60);
    let displayItem = ''
    if (h) {
      displayItem += h + ':'
    }
    if (m < 10 && displayItem.length) {
      displayItem += 0;
    }
    displayItem += m + ':'
    if (s < 10) {
      displayItem += 0;
    }
    displayItem += s
    return displayItem
}

function round(value, step) {
  step || (step = 1.0);
  var inv = 1.0 / step;
  return Math.round(value * inv) / inv;
}

export default MoviePage