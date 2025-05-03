import React, { useCallback, useEffect, useRef, useState } from "react";
import { redirect, useNavigate, useParams } from "react-router-dom";

import "./MoviePage.css";
import api from "../../api";
import { usePremiumStatus } from "../../helper/usePremiumStatus";
import { GoBackButton, ScrollingSubtitles } from "../Quiz";
import ErrorBoundary from "../ErrorBoundary";
import { VkVideoInit } from "../ShortVideo";
import { FilterDropdown, WordInfoDropdown } from "../RelatedVideosDropdown";
import { createDebouncedFunction } from "../../debounce";
import { useDispatch } from "react-redux";
import { selectText } from "../../store";
import { convertQueryObjectToCommaSeparatedString } from "../../utils/objectToQuery";
import YoutubePlayer from "../../components/YoutubePlayer";
import { getPronFunc } from "../../utils/pron";

const StarButton = ({ percent = 40, highlighted, onClick }) => {
  return (
    <button className="relative w-6 h-4" style={{ transform: 'rotate(-75deg) translateX(-10%)' }} onClick={onClick}>
      {/* Empty Star */}
      <i className={`fa-regular fa-star absolute top-0 left-0 w-full h-full text-xl ${highlighted ? "text-yellow-300" : "text-gray-100"}`}></i>

      {/* Filled Portion */}
      <i style={{ height: `${percent}%`, transition: "height 0.125s ease-in-out" }} className="fa-solid fa-star text-yellow-300 w-full h-full text-xl absolute top-0 left-0 w-full overflow-hidden"></i>
    </button>
  );
};


export const InformedText = ({ text }) => {
  const parsedTextList = text.split(' ')
  const dispatch = useDispatch()

  return (
    <>
      {parsedTextList.map((textPart) => {
        return <span onClick={() => {
          dispatch(selectText(textPart, { fullText: text }))
        }}>{textPart}</span>
      })}
    </>
  )
}

const HorizontalScroll = ({ items, onTimeClick, forcedIndexChange, autoScroll = true, vertical }) => {
  const scrollRef = useRef(null);
  const [activeIndex, set_activeIndex] = useState(Infinity)
  const [userBookmarks, set_userBookmarks] = useState({})

  async function handleBookmarkClick(item) {
    const repeatCount = userBookmarks[item.the_word]?.repeatCount
    const newWord = { the_word: item.the_word, repeatCount: isNaN(repeatCount) ? 0 : repeatCount + 1, context: item, repeatTime: Date.now() }

    set_userBookmarks({ ...userBookmarks, [item.the_word]: newWord })
    const response = await api().post('/self_words_increment', [newWord])
    console.log('response', response)
  }

  async function getUserWords() {
    const response = await api().get('/self_words/repeating')
    console.log('user words', response)
    const mappedUserWords = response.reduce((acc, item) => (acc[item.the_word] = item, acc), {})
    set_userBookmarks(mappedUserWords)
  }

  useEffect(() => {
    getUserWords()
  }, [])
  console.log('userBookmarks', userBookmarks)

  const scrollToIndex = (index) => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const items = container.children;
      if (items[index]) {
        const item = items[index];
        if (vertical) {
          const itemHeight = item.offsetHeight;
          const containerHeight = container.offsetHeight; // Use `clientHeight` instead of `offsetHeight`

          // Calculate the scroll position to center the item
          console.log('item.offsetTop', item.offsetTop);
          const scrollPosition = item.offsetTop - (containerHeight / 2) + (itemHeight / 2);
          console.log('scrollPosition', scrollPosition);

          container.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
          });
        } else {
          const itemWidth = item.offsetWidth;
          const containerWidth = container.offsetWidth;

          // Calculate the scroll position to center the item
          const scrollPosition = item.offsetLeft - (containerWidth / 2) + (itemWidth / 2);
          console.log('scrollPosition', scrollPosition)
          container.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
          });
        }
      }
    }
  };

  const changeIndex = createDebouncedFunction((newIndex) => {
    scrollToIndex(newIndex)
    set_activeIndex(newIndex)
  }, 200)
  useEffect(() => {
    console.log('forcedIndexChange', forcedIndexChange)

    if (autoScroll) {
      changeIndex(forcedIndexChange)
    } else {
      set_activeIndex(forcedIndexChange)
    }
  }, [forcedIndexChange])

  return (
    <div
      className={`overflow-scroll no-scrollbar justify-items-start
        ${vertical ? "absolute h-full pt-20" : "bg-black-100 flex w-full pl-15"}
        `}
      ref={scrollRef}
    >
      {items.map((item, index) => {
        const active = index === activeIndex
        return (
          <div
            onClick={() => { }}
            key={item.id}
            className={`text-white-100 px-1.5 p-1 m-1 ${vertical ? "" : ""}`}
            style={{
              alignSelf: "left",
              color: 'white',
              borderRadius: '4px',
              // height: '60px',
              whiteSpace: 'nowrap',
              fontSize: active ? '1.6em' : '',
              background: active ? 'orange' : 'rgba(99,102,241, 0.5)',
              // background: active ? 'orange' : 'rgba(99,102,241)',
              lineHeight: '1'
            }}
          >
            <div className="flex justify-items-center">
              <InformedText text={item.the_word} />
              <StarButton
                percent={(userBookmarks && userBookmarks[item.the_word]?.repeatCount && userBookmarks[item.the_word].repeatCount * 40) || 0}
                // percent={50}
                onClick={() => handleBookmarkClick(item, index)}
                highlighted={userBookmarks && userBookmarks[item.the_word]}
              />
            </div>
            <br />
            <span>{item.pronounciation}</span><br />
            <div>
              {/* <CircularMenu /> */}
              {/* <button className="pr-0.5">+</button> */}
              <button
                className="text-xs select-none font-bold"
                style={{
                  fontSize: active ? "11px" : '10px',
                  color: active ? 'white' : 'rgb(255 215 141)'
                }}
                onClick={() => {
                  changeIndex(index)
                  if (onTimeClick) {
                    onTimeClick(item.startTime)
                  }
                }}>
                {displayTime(item.startTime / 1000)}
              </button>
              {/* <StarRating scale={active && 1.1} />
               */}
            </div>
          </div>
        )
      })}
    </div >
  )
}

function displayTime(seconds) {
  // Calculate hours, minutes, and seconds (ensure to floor the values)
  const hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60); // This removes fractions of a second
  if (hours > 0 && minutes < 10) {
    minutes = '0' + minutes
  }
  // Construct the formatted time string
  let formattedTime = '';

  if (hours > 0) {
    formattedTime += `${hours}:`;
  }

  // Format minutes and seconds as two digits, unless it's a single digit
  formattedTime += `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;

  return formattedTime;
}


const MoviePage = () => {
  const DEFAULT_QUERY = convertQueryObjectToCommaSeparatedString({ sort: 'Not Sorted', level: ['Intermediate', 'Advanced'] })
  const { title } = useParams();
  const youtubeIdOnVideo = title.includes('youtube_') ? title.split('youtube_')[1] : undefined
  const [subtitleParsed, set_subtitleParsed] = useState(null)
  const isPremium = usePremiumStatus();
  const [query, set_query] = useState(DEFAULT_QUERY)
  const [videoWords, set_videoWords] = useState([])
  const videoId = (youtubeIdOnVideo && subtitleParsed?.videoInfo?._id) || title
  const movieInfo = useMovieInfo(videoId);
  async function initYoutubeVideo() {
    const learningLang = localStorage.getItem("learningLanguage")
    const list = [];
    try {
      const response = await api().get(`/youtube_video_init/${youtubeIdOnVideo}?mediaLang=${learningLang}&${query}`)
      // list = response.wordList
      console.log('parsed', response)
      set_subtitleParsed(response)
    } catch (err) {

    }
  }

  async function updateUserHistory() {
    try {
      await api().get(`/user_history`, [videoId])
    } catch (err) {

    }
  }

  useEffect(() => {
    if (youtubeIdOnVideo && !subtitleParsed) {
      initYoutubeVideo()
    }
  }, [youtubeIdOnVideo, videoId, subtitleParsed])

  useEffect(() => {
    if (youtubeIdOnVideo && !subtitleParsed) {
      return;
    }
    requestVideoWords()
  }, [youtubeIdOnVideo, videoId, subtitleParsed, query])
  console.log('videoWords', videoWords)
  const requestVideoWords = async () => {
    // const getPronounciation = PRONS[mediaLang]
    console.log('query', query)
    if (query !== "") {
      try {
        const list = (await api().get(`/movie_words/${videoId}?${query}`))
        console.log('videoLength', list.length)
        const listWithPronounciation = await Promise.all(list.map((item) => {
          const pronounciation = item.pronounciation || getPronFunc()(item.the_word)

          return {
            ...item,
            pronounciation
          }
        }))
        set_videoWords(listWithPronounciation)
      } catch (err) {

      }
    }
  }
  const [forcedCurrentTimeChange, set_forcedCurrentTimeChange] = useState()
  const [isFilterOpen, set_isFilterOpen] = useState(false);
  const [currentWord, set_currentWord] = useState('')
  console.log('subtitleParsed', subtitleParsed)
  const subtitles = subtitleParsed?.subtitles?.subtitles
  console.log('subtitles', subtitles)
  // const [subtitles] = useSubtitles(videoId, localStorage.getItem('learningLanguage'))
  const [matchedSubtitleLine, set_matchedSubtitleLine] = useState(0)

  useEffect(() => {
    // set_isRelOpen(false)
    set_currentWord('')
    set_isFilterOpen(false)
    set_query(DEFAULT_QUERY)
  }, [videoId])

  const [forcedActiveWordIndex, set_forcedActiveWordIndex] = useState(Infinity)
  const handleTimeUpdate = (newTime) => {
    newTime = newTime * 1000
    const foundItem = videoWords.findIndex(item => newTime > item.startTime && newTime < item.endTime)
    if (foundItem !== -1) {
      set_forcedActiveWordIndex(foundItem)
    } else {
      set_forcedActiveWordIndex(Infinity)
    }
    // console.log('new_matchedSubtitleLine', subtitleParsed)
    const new_matchedSubtitleLine = subtitles?.findIndex(item => newTime >= item.startTime && newTime < item.endTime)
    // console.log('new_matchedSubtitleLine', new_matchedSubtitleLine, subtitles, newTime)
    if (matchedSubtitleLine !== new_matchedSubtitleLine) {
      set_matchedSubtitleLine(new_matchedSubtitleLine)
    }
  }
  // const [isRelOpen, set_isRelOpen] = useState(false);
  console.log('movieInfo?.youtubeUrl || youtubeIdOnVideo', movieInfo?.youtubeUrl || youtubeIdOnVideo)
  console.log('movieInfo?.youtubeUrl || youtubeIdOnVideo) && subtitleParsed && videoWords.length', (movieInfo?.youtubeUrl || youtubeIdOnVideo) && subtitleParsed && videoWords.length)
  return (
    <ErrorBoundary>
      <GoBackButton />

      <WordInfoDropdown
        isOpen={currentWord}
        excludeOccurrence={{ mediaTitle: videoId }}
      />
      <FilterDropdown
        isOpen={isFilterOpen}
        closeDropdown={() => set_isFilterOpen(false)}
        onSubmit={(new_query_object, ev) => {
          ev?.preventDefault()
          const new_query = convertQueryObjectToCommaSeparatedString(new_query_object)
          console.log('new_query', new_query)
          if (new_query !== query) {
            set_query(new_query)
          }
        }}
        sort_options={[
          { label: 'Easy', value: 'Easy' },
          { label: 'Hard', value: 'Hard' },
          { label: 'Not Sorted', value: 'Not Sorted' },
        ]}
        bookmark_options={[
          { label: 'Archives', value: 'Archives' },
          { label: 'Active', value: 'Active' },
        ]}
        level_options={[
          { label: 'Beginner', value: 'Beginner' },
          { label: 'Intermediate', value: 'Intermediate' },
          { label: 'Advanced', value: 'Advanced' },
        ]}
      />
      <div className="MainContainer flex flex-col">
        <div style={{ flex: 1 }}>
          {(movieInfo?.youtubeUrl || youtubeIdOnVideo) && subtitleParsed && videoWords.length ?
            <YoutubePlayer
              videoIdOrUrl={movieInfo?.youtubeUrl || "embed/" + youtubeIdOnVideo}
              autoplay
              scale={1}
              startTime={(forcedCurrentTimeChange || 0)}
              onTimeUpdate={handleTimeUpdate}
            />
            :
            <VkVideoInit
              scale={1}
              isActive
              iframeSrc={movieInfo?.vkVideoEmbed}
              startTime={(forcedCurrentTimeChange || 0)}
              onTimeUpdate={handleTimeUpdate}
            />
          }
          <ScrollingSubtitles
            highlightedText={videoWords && videoWords[forcedActiveWordIndex]?.the_word}
            subtitles={subtitles}
            currentIndex={matchedSubtitleLine}
            singleLine
          />
          {/* <ShortVideo
            onTimeUpdate={handleTimeUpdate}
            mediaTitle={(movieInfo?.youtubeUrl || videoId)}
            forcedCurrentTimeChange={forcedCurrentTimeChange}
            scale={1.5}
            isActive
          /> */}
        </div>
        <button onClick={() => set_isFilterOpen(!isFilterOpen)} className="bg-icon absolute bottom-2 right-0"><i className="fa-solid fa-filter text-gray-100"></i></button>
        <HorizontalScroll
          vertical
          items={videoWords}
          autoScroll={true}
          forcedIndexChange={forcedActiveWordIndex}
          onTimeClick={(newTime) => {
            // change the current time of the video
            set_forcedCurrentTimeChange(newTime)
          }} />
      </div>
    </ErrorBoundary>
  );
};

function useMovieInfo(id) {
  const [movieInfo, set_movieInfo] = useState(null);
  const requestMovieInfo = async () => {
    try {
      const requestUri = '/movies?_id=' + id
      let response;
      try {
        response = await api().get(requestUri)

      } catch (err) { }
      console.log('response s', response)
      const new_movieInfo = response?.results[0];
      console.log("new_movieInfo", new_movieInfo);
      set_movieInfo(new_movieInfo);
    } catch (err) {
      console.log("ITEM GET ERROR: ", err);
    }
  };

  useEffect(() => {
    requestMovieInfo();
  }, [id]);

  return movieInfo
}
function useSubtitles(mediaId, mediaLang) {
  const [subtitles, setSubtitles] = useState([])

  async function requestMainSubtitleByTitle() {
    try {
      const response = await api().get(`/subtitles?mediaId=${mediaId}&mediaLang=` + mediaLang)
      setSubtitles(response?.results[0])
    } catch (err) {
    }
  }

  useEffect(() => {
    requestMainSubtitleByTitle()
  }, [mediaId, mediaLang])

  return [subtitles]
}

function useHandleTimeUpdate(list, forcedWordIndex, set_forcedWordIndex) {
  const [currentTime, set_currentTime] = useState(0)
  const handleTimeUpdate = useCallback((new_currentTime) => {
    set_currentTime(new_currentTime)
  }, [list])

  useEffect(() => {
    let breaked = false;

    for (let ii = 0; ii < list.length; ii++) {
      const item = list[ii];
      if (!breaked && item.startTime > currentTime * 1000) {
        set_forcedWordIndex(ii - 1)
        breaked = true;
      }
    }
  }, [currentTime, list])

  return { handleTimeUpdate, currentTime, forcedWordIndex, set_forcedWordIndex }
}

export default MoviePage;