import React, { useEffect, useState } from 'react';
import { useRef } from 'react';

const YoutubePlayer = ({ videoIdOrUrl }) => {
    console.log('videoIdOrUrl', videoIdOrUrl)
  const urlParams = videoIdOrUrl.includes('?') && new URLSearchParams('?' + videoIdOrUrl.split('?')[1])
  const videoId = urlParams ? urlParams?.get('v')  : videoIdOrUrl
  const startTime = parseInt((urlParams?.get('t') || '0').replace('s', ''));

  const player = useRef(null);
  const [playerState, setPlayerState] = useState({
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    volume: 100, // Add volume to the state
  });

  useEffect(() => {
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
              'start': startTime, // Add this line to start at the specified time
              'autoplay': 1,
              // 'mute': 1
              'listType': 'playlist',
              'list': urlParams?.get('list')
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
  }, [videoIdOrUrl]);

  const onPlayerReady = (event) => {
    updatePlayerState();
    // if (player.current && player.current.unMute) {
    //     player.current.unMute();
    // }
    // setTimeout(() => player.current.setVolume(1), 500)
  };

  const onPlayerStateChange = (event) => {
    updatePlayerState();
  };

  const updatePlayerState = () => {
    if (player.current && player.current.getCurrentTime && player.current.getDuration && player.current.getPlayerState && player.current.getVolume) {
      setPlayerState({
        currentTime: player.current.getCurrentTime(),
        duration: player.current.getDuration(),
        isPlaying: player.current.getPlayerState() === window.YT.PlayerState.PLAYING,
        volume: player.current.getVolume(),
      });
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
    <div>
      <div id={videoId + 'id'} className='w-screen'></div>
      <Controls 
        player={player.current} 
        playerState={playerState} 
        updatePlayerState={updatePlayerState}
        formatTime={formatTime}
        startTime={startTime}
      />
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
        <button onClick={handlePause}><i class="fa-solid fa-pause"></i></button>
        : 
        <button onClick={handlePlay} className=''><i class="fa-solid fa-play"></i></button>
      }
      <button onClick={handleRewind}><i class="fa fa-undo" aria-hidden="true"></i>Start</button>
      <button onClick={() => handleRewind(5)}><i class="fa fa-undo" aria-hidden="true"></i>5s</button>
      <button onClick={handleForward}><i class="fa fa-rotate-right" aria-hidden="true"></i>5s</button>
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