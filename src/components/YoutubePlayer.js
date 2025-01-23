import React, { useEffect, useState } from 'react';
import { useRef } from 'react';

const YoutubePlayer = ({ videoIdOrUrl, controls, autoplay, muted, onTimeUpdate, startTime, scale = 1.2 }) => {
  const videoId = videoIdOrUrl.split('embed/')[1]
  // const initTime = parseInt((urlParams?.get('t') || '0').replace('s', ''));

  const player = useRef(null);
  const [playerState, setPlayerState] = useState({
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    volume: 100, // Add volume to the state
  });

  useEffect(() => {
    // console.log('startTime', startTime / 1000)
    if (startTime) {
      player.current?.seekTo(Math.floor(startTime / 1000))
    }
  }, [startTime])

  useEffect(() => {
    console.log('videoId', videoId)
    const onYouTubeIframeAPIReady = () => {
      const newPlayer = new window.YT.Player(videoId + 'id', {
        height: '360',
        // width: '640',
        videoId: videoId,
        playerVars: {
          'controls': 0,
          // 'disablekb': 1,
          'modestbranding': 1,
          'rel': 0,
          'showinfo': 0,
          'iv_load_policy': 3, // Hide video annotations
          'cc_load_policy': 0, // Hide closed captions
          // 'fs': 0, // Disable fullscreen button
          'start': Math.floor(startTime / 1000), // Add this line to start at the specified time
          // 'autoplay': autoplay && 1,
          // 'autoplay': 1,
          // 'mute': 1
          'listType': 'playlist',
          // 'list': urlParams
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
      player.current = newPlayer;
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    } else {
      onYouTubeIframeAPIReady();
    }


    return () => {
      // Clean up
      if (player.current && player.current.destroy) {
        player.current.destroy();
      }
    };
  }, [videoId]);

  const onPlayerReady = (event) => {
    updatePlayerState(event);
    // if (player.current && player.current.unMute) {
    //     player.current.unMute();
    // }
    // setTimeout(() => player.current.setVolume(1), 500)
  };

  const onPlayerStateChange = (event) => {
    updatePlayerState(event);
  };

  const updatePlayerState = (event) => {
    if (player.current && player.current.getCurrentTime && player.current.getDuration && player.current.getPlayerState && player.current.getVolume) {
      const currentTime = player.current.getCurrentTime()
      setPlayerState({
        currentTime,
        duration: player.current.getDuration(),
        isPlaying: player.current.getPlayerState() === window.YT.PlayerState.PLAYING,
        volume: player.current.getVolume(),
      });

      if (typeof onTimeUpdate === 'function') {
        onTimeUpdate(currentTime)
      }
    }
  };

  useEffect(() => {
    const timer = setInterval(updatePlayerState, 10);
    return () => clearInterval(timer);
  }, [player.current]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <div className='w-full h-full relative overflow-hidden'>
      <div id={videoId + 'id'} style={{
        height: 100 * scale + '%',
        width: 100 * scale + '%',
        position: 'absolute',
        left: `-${(scale - 1) / 2 * 100}%`,
        top: `-${(scale - 1) / 2 * 100}%`
      }}></div>
      {!!controls &&
        <Controls
          player={player.current}
          playerState={playerState}
          updatePlayerState={updatePlayerState}
          formatTime={formatTime}
          startTime={startTime}
        />
      }
    </div>
  );
};

const Controls = ({ player, playerState, updatePlayerState, formatTime, startTime }) => {
  const handlePlay = () => {
    if (player && player.playVideo) {
      player.playVideo();
      updatePlayerState();
    }
  };

  const handlePause = () => {
    if (player && player.pauseVideo) {
      player.pauseVideo();
      updatePlayerState();
    }
  };

  const handleRewind = (seconds) => {
    if (player && player.seekTo) {
      const newCurrentTime = seconds ? playerState.currentTime - seconds : startTime
      player.seekTo(Math.max(newCurrentTime, 0), true);
      updatePlayerState();
    }
  };

  const handleForward = () => {
    if (player && player.seekTo) {
      player.seekTo(playerState.currentTime + 5, true);
      updatePlayerState();
    }
  };

  const handleProgressChange = (e) => {
    if (player && player.seekTo) {
      const time = playerState.duration * (e.target.value / 100);
      player.seekTo(time, true);
      updatePlayerState();
    }
  };

  const handleVolumeChange = (e) => {
    if (player && player.setVolume) {
      const volume = parseInt(e.target.value);
      player.setVolume(volume);
      updatePlayerState();
    }
  };

  return (
    <div className="custom-controls">
      {playerState.isPlaying ?
        <button onClick={handlePause}><i className="fa-solid fa-pause"></i></button>
        :
        <button onClick={handlePlay} className=''><i className="fa-solid fa-play"></i></button>
      }
      <button onClick={handleRewind}><i className="fa fa-undo" aria-hidden="true"></i>Start</button>
      <button onClick={() => handleRewind(5)}><i className="fa fa-undo" aria-hidden="true"></i>5s</button>
      <button onClick={handleForward}><i className="fa fa-rotate-right" aria-hidden="true"></i>5s</button>
      <input
        type="range"
        value={(playerState.currentTime / playerState.duration) * 100 || 0}
        onChange={handleProgressChange}
      />
      <span>{formatTime(playerState.currentTime)}</span> /
      <span>{formatTime(playerState.duration)}</span>
      <input
        type="range"
        min="0"
        max="100"
        value={playerState.volume}
        onChange={handleVolumeChange}
      />
    </div>
  );
};

export default YoutubePlayer;