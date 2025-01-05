import { useEffect, useRef, useState } from "react"
import api, { BASE_SERVER_URL } from "../api"
import YoutubePlayer from "../components/YoutubePlayer"
// import useMobileDetect from "../helper/useMobileDetect"


export const VideoInit = ({ isActive, videoSrc, startTime, onTimeUpdate, muted }) => {
  const videoRef = useRef(null)
  const [isLoaded, set_isLoaded] = useState()
  useEffect(() => {
    if (isLoaded) {
      console.log('new startTime', startTime)
    }
    try {
      if (isActive && isLoaded) {
        videoRef.current.currentTime = startTime
        videoRef.current.play().catch(() => { })
      } else {
        if (!videoRef.current.paused) {
          videoRef.current.pause().catch(() => { })
        }
      }
    } catch (error) {
      console.log('error', error)
    }
  }, [startTime, isActive, isLoaded])
  const onLoadedMetadata = () => {
    console.log('isLoaded', isLoaded)
    set_isLoaded(true)
  }
  return (
    <div style={{ height: '100%' }}>
      <video
        controls
        // autoPlay={isActive}
        ref={videoRef}
        muted={muted}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={() => {
          onTimeUpdate(videoRef.current)
        }}
        className="w-full"
        playsInline
        webkit-playsinline="true"
        style={{ height: '100%' }}
      // controlsList="nodownload"
      >
        <source
          src={videoSrc}
          type="video/mp4"
        />
      </video>
    </div>
  )
}

// <iframe "https://vkvideo.ru/video_ext.php?oid=878939759&id=456239017&hd=1&t=20s" />
export const VkVideoInit = ({ isActive, iframeSrc, startTime, onTimeUpdate, muted }) => {
  const videoRef = useRef(null)

  useEffect(() => {
    let vkVideo
    
    if (videoRef && videoRef.current.contentWindow.document) {
      console.log('videoRef', videoRef.current.contentWindow.document)
    }

    if (iframeSrc && window.VK !== undefined) {
      vkVideo = window.VK.VideoPlayer(videoRef.current)
      console.log('VK', vkVideo)
      if (!vkVideo) {
        return;
      }

      vkVideo.on('timeupdate', () => {
        if (onTimeUpdate) onTimeUpdate()
      })
  
      vkVideo.on('inited', () => {
        // loaded
        if (muted) {
          vkVideo.mute()
        }
      })
  
      vkVideo.on('started', () => {
        // Начало воспроизведения видео
        if (muted) {
          vkVideo.mute()
        }
      })
    }
  }, [iframeSrc, window.VK])

  return (
    <iframe
      style={{ width: '100%', height: '100%' }}
      ref={videoRef}
      src={iframeSrc + `&t=${startTime || 0}s&autoplay=${isActive ? 1 : 0}&hd=1&js_api=1`}
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;"
      frameborder="0"
      allowfullscreen
    ></iframe>
  )
}

const getSubtitleIndexFromCurrentTime = (subtitleTime, subtitles) => {
  const currentTimeInMS = subtitleTime * 1000
  const new_currentSubtitleIndex = subtitles.findIndex((item) => item.startTime > currentTimeInMS)
  console.log('new_currentSubtitleIndex', new_currentSubtitleIndex, subtitleTime, subtitles.length)
  return new_currentSubtitleIndex - 1
}

const extractYoutubeId = title => {
  if (title = title.split('YOUTUBE_ID[')[1]) {
    return 'https://www.youtube.com/watch?v=' + title.split(']')[0];
  }
  return ''
}

export const ShortVideo = ({ isActive, mediaTitle, forcedCurrentTimeChange, onTimeUpdate, hideSubtitles }) => {
  // const [inner_forcedCurrentTimeChange, set_inner_forcedTimeChange] = useState()
  const isYoutubeVideo = mediaTitle && mediaTitle.includes('YOUTUBE_ID[')
  let mediaSrc = ''
  const isVkVideo = mediaTitle?.includes('VKVIDEO_ID[')
  if (isYoutubeVideo) {
    mediaSrc = extractYoutubeId(mediaTitle)
  } else {
    // mediaSrc = `${BASE_SERVER_URL}/movieFiles/${mediaTitle}.480.mp4`
    mediaSrc = `${BASE_SERVER_URL}/movie?name=${mediaTitle}`
  }

  const [subtitleTime, set_subtitleTime] = useState(0)
  const [subtitles] = useSubtitles(mediaTitle)

  const subtitleIndex = getSubtitleIndexFromCurrentTime(subtitleTime, subtitles)

  const handleTimeUpdate = (newTime) => {
    if (onTimeUpdate) { onTimeUpdate(newTime) }

    set_subtitleTime(newTime)
  }
  const videoRef = useRef(null)
  return (
    <div className="ShortVideo">
      {/* {isActive && ( */}
      {isYoutubeVideo &&
        <YoutubePlayer
          onTimeUpdate={handleTimeUpdate}
          isActive={isActive}
          videoIdOrUrl={mediaSrc}
          startTime={forcedCurrentTimeChange}
        />
      }
      {isVkVideo &&
        <VkVideoInit
          onTimeUpdate={handleTimeUpdate}
          isActive={isActive}
          iframeSrc={mediaSrc}
          startTime={forcedCurrentTimeChange}
        />
      }
      {!isVkVideo && !isYoutubeVideo &&
        <VideoInit
          onTimeUpdate={handleTimeUpdate}
          isActive={isActive}
          videoSrc={mediaSrc}
          startTime={forcedCurrentTimeChange}
        />
      }
    </div>
  )
}

function useSubtitles(mediaTitle, translateLang) {
  const [subtitles, setSubtitles] = useState([])

  async function requestMainSubtitleByTitle() {
    try {
      translateLang = translateLang?.length ? '&translateLang=' + translateLang : ''
      const response = await api().get(`/subtitles_v2?mediaTitle=${mediaTitle}` + translateLang)
      setSubtitles(response)
    } catch (err) {
    }
  }

  useEffect(() => {
    requestMainSubtitleByTitle()
  }, [mediaTitle, translateLang])

  return [subtitles]
}
