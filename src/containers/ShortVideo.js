import { useEffect, useRef, useState } from "react"
import api, { BASE_SERVER_URL } from "../api"
import YoutubePlayer from "../components/YoutubePlayer"
// import useMobileDetect from "../helper/useMobileDetect"


export const VideoInit = ({ isActive, autoplay, videoSrc, startTime, onTimeUpdate, isYoutubeVideo, muted }) => {
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
  const isYoutubeVideo = mediaTitle && mediaTitle?.includes('YOUTUBE_ID[')
  let mediaSrc = ''

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
      {isYoutubeVideo ?
        <YoutubePlayer
          onTimeUpdate={handleTimeUpdate}
          isActive={isActive}
          videoIdOrUrl={mediaSrc}
          startTime={forcedCurrentTimeChange}
        />
        :
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
