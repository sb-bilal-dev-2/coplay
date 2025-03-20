import { useEffect, useRef, useState } from "react"
import api, { BASE_SERVER_URL } from "../api"
import YoutubePlayer from "../components/YoutubePlayer"
// import useMobileDetect from "../helper/useMobileDetect"


export const VideoInit = ({ isActive, videoSrc, startTime, onTimeUpdate, muted, scale }) => {
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
    <div className="w-full h-full overflow-hidden relative">
      <video
        style={{
          height: 100 * scale + '%',
          width: 100 * scale + '%',
          position: 'absolute',
          // left: `-${(scale - 1) / 2 * 100}%`,
          top: `-${(scale - 1) / 2 * 100}%`
        }}
        controls
        // autoPlay={isActive}
        ref={videoRef}
        muted={muted}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={() => {
          onTimeUpdate(videoRef.current)
        }}
        playsInline
        webkit-playsinline="true"
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
export const VkVideoInit = ({ isActive, iframeSrc, startTime, onTimeUpdate, muted, scale = 2 }) => {
  const videoRef = useRef(null)
  // console.log('iframeSrc', iframeSrc)
  useEffect(() => {
    if (iframeSrc && window.VK !== undefined) {
      const vkVideo = window.VK.VideoPlayer(videoRef.current)
      // console.log('startTime', startTime)
      vkVideo?.seek(Math.floor(startTime / 1000))
    }
  }, [startTime])

  useEffect(() => {
    let vkVideo

    if (videoRef && videoRef.current) {
      // videoRef.current.crossOrigin = 'anonymous'
      // console.log('videoRef', videoRef.current.contentWindow.document)
    }

    if (iframeSrc && window.VK !== undefined) {
      vkVideo = window.VK.VideoPlayer(videoRef.current)
      console.log('VK', vkVideo)
      if (!vkVideo) {
        return;
      }

      vkVideo.on('timeupdate', (event) => {
        if (onTimeUpdate) {
          onTimeUpdate(event.time, event)
        }
      })

      vkVideo.on('inited', () => {
        // loaded
        vkVideo.seek(Math.floor(startTime / 1000))
        if (muted) {
          vkVideo.mute()
        }
      })

      vkVideo.on('started', () => {
        // Начало воспроизведения видео
        // vkVideo.mute()
      })
    }
  }, [iframeSrc, window.VK])
  // console.log('startTime vk', startTime)
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        width: '100%',
        height: '100%'
      }}
    >
      <iframe
        style={{
          // Show only half of the iframe
          position: "absolute",
          top: `-${(scale - 1) / 2 * 100}%`,
          left: `-${(scale - 1) / 2 * 100}%`,
          width: `${scale * 100}%`,
          height: `${scale * 100}%`,
        }}
        ref={videoRef}
        src={iframeSrc + `&autoplay=${isActive ? 1 : 0}&hd=1&js_api=1`}
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;"
        frameborder="0"
        allowfullscreen
      ></iframe>
      {/* <div style={{
              border: '1px solid red',
              position: 'absolute',
              zIndex: '100',
              height: '400px',
              width: '500px'
            }}>

            </div> */}

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

const YoutubeExplore = () => {
  return (
    <div>
      // Scrolling tags ["Trending", "Popular"]
    </div>
  )
}

export const ShortVideo = ({ isActive, youtubeUrl, vkVideoEmbed, forcedCurrentTimeChange, onTimeUpdate, hideSubtitles, scale = 1.1 }) => {
  // const [inner_forcedCurrentTimeChange, set_inner_forcedTimeChange] = useState()
  const [subtitleTime, set_subtitleTime] = useState(0)
  // const [subtitles] = useSubtitles(mediaId)

  // const subtitleIndex = getSubtitleIndexFromCurrentTime(subtitleTime, subtitles)

  const handleTimeUpdate = (newTime) => {
    if (onTimeUpdate) { onTimeUpdate(newTime) }

    set_subtitleTime(newTime)
  }
  const videoRef = useRef(null)
  return (
    <div className="ShortVideo">
      {/* {isActive && ( */}
      {youtubeUrl && !vkVideoEmbed ?
        <YoutubePlayer
          onTimeUpdate={handleTimeUpdate}
          isActive={isActive}
          videoIdOrUrl={youtubeUrl}
          startTime={forcedCurrentTimeChange}
          scale={scale}
        />
        :
        <VkVideoInit
          onTimeUpdate={handleTimeUpdate}
          isActive={isActive}
          iframeSrc={vkVideoEmbed}
          startTime={forcedCurrentTimeChange}
          scale={scale}
        />
      }
      {/* {!isYoutubeVideo &&
        <VideoInit
          scale={scale}
          onTimeUpdate={handleTimeUpdate}
          isActive={isActive}
          videoSrc={mediaSrc}
          startTime={forcedCurrentTimeChange}
        />
      } */}
    </div>
  )
}

function useSubtitles(mediaId, translateLang) {
  const [subtitles, setSubtitles] = useState([])

  async function requestMainSubtitleByTitle() {
    try {
      translateLang = translateLang?.length ? '&translateLang=' + translateLang : ''
      const response = await api().get(`/subtitles_v2?mediaId=${mediaId}` + translateLang)
      setSubtitles(response)
    } catch (err) {
    }
  }

  useEffect(() => {
    requestMainSubtitleByTitle()
  }, [mediaId, translateLang])

  return [subtitles]
}
