import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

import "./MoviePage.css";
import api, { BASE_SERVER_URL } from "../../api";
import { usePremiumStatus } from "../../helper/usePremiumStatus";
import { GoBackButton, useWordColletionWordInfos } from "../Quiz";
import ErrorBoundary from "../ErrorBoundary";
import { ShortVideo } from "../ShortVideo";
import { FilterDropdown } from "../RelatedVideosDropdown";
import { useScrolledItem } from "../../utils/useScrolledItem";
import { createDebouncedFunction, debounce } from "../../debounce";

export const HorizontalScroll = ({ items, onTimeClick, forcedIndexChange, scrollActive = true }) => {
  const scrollRef = useRef(null);
  const [activeIndex, set_activeIndex] = useState(Infinity)
  const scrollToIndex = (index) => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const items = container.children;
      if (items[index]) {
        const item = items[index];
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
  };

  const changeIndex = createDebouncedFunction((newIndex) => {
    scrollToIndex(newIndex)
    set_activeIndex(newIndex)
  }, 200)
  useEffect(() => {
    console.log('forcedIndexChange', forcedIndexChange)

    if (scrollActive) {
      changeIndex(forcedIndexChange)
    } else {
      set_activeIndex(forcedIndexChange)
    }
  }, [forcedIndexChange])

  return (
    <div className="w-full bg-black-100 flex overflow-scroll" ref={scrollRef}>
      {items.map((item, index) => {
        const active = index === activeIndex
        return (
          <div
            onClick={() => { }}
            key={item.id}
            className="text-white-100 p-2 m-2 bg-indigo-500"
            style={{
              color: 'white',
              borderRadius: '16px',
              height: '60px',
              whiteSpace: 'nowrap',
              background: active ? 'orange' : 'rgba(99,102,241)',
              lineHeight: '1'
            }}
          >
            {item.the_word}<br />
            <button
              className="text-xs"
              onClick={() => {
                changeIndex(index)
                if (onTimeClick) {
                  onTimeClick(item.startTime)
                }
              }}>
              {displayTime(item.startTime / 1000)}
            </button>
          </div>
        )
      })}
    </div >
  )
}

function displayTime(seconds) {
  // Calculate hours, minutes, and seconds (ensure to floor the values)
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60); // This removes fractions of a second

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
  const { title } = useParams();
  const movieInfo = useMovieInfo(title);
  const isPremium = usePremiumStatus();
  const [forcedCurrentTimeChange, set_forcedCurrentTimeChange] = useState()
  // const { list: listName, word: paramWord } = useParams();
  const { wordList, set_practicingWordIndex, practicingWordIndex: playingWordIndex, currentWordInfo, currentWordOccurances, currentAvailableOccurancesLength, wordInfos } = useWordColletionWordInfos(title, undefined, 'video')

  useEffect(() => {
    // set_isRelOpen(false)
    set_isFilterOpen(false)
  }, [title])

  const [forcedActiveWordIndex, set_forcedActiveWordIndex] = useState(Infinity)
  const handleTimeUpdate = (videoRef) => {
    const newTime = videoRef.currentTime * 1000
    console.log('newTime', newTime)
    const searchWordListTime = (list) => {
      console.log('list', list)
      return list.findIndex(item => newTime > item.startTime && newTime < item.endTime)
    }

    const foundItem = searchWordListTime(wordList)
    console.log('foundItem', foundItem)

    if (foundItem !== -1) {
      set_forcedActiveWordIndex(foundItem)
    } else {
      set_forcedActiveWordIndex(Infinity)
    }
  }
  // const [isRelOpen, set_isRelOpen] = useState(false);
  const [isFilterOpen, set_isFilterOpen] = useState(false);

  return (
    <ErrorBoundary>
      <GoBackButton />
      <FilterDropdown
        isOpen={isFilterOpen}
        closeDropdown={() => set_isFilterOpen(false)}
        options={[
          { label: 'Easiest', value: 'Easiest' },
          { label: 'Hardest', value: 'Hardest' },
          { label: 'Bookmarks', value: 'Bookmarks' },
          { label: 'All New', value: 'All New' }
        ]}
        onChange={(option) => { }}
      />
      <div className="MainContainer flex flex-col">
        <div style={{ flex: 1 }}>
          <ShortVideo
            onTimeUpdate={handleTimeUpdate}
            mediaTitle={title}
            forcedCurrentTimeChange={forcedCurrentTimeChange}
            isActive
          />
        </div>
        <HorizontalScroll
          items={wordList}
          forcedIndexChange={forcedActiveWordIndex}
          onTimeClick={(newTime) => {
            // change the current time of the video
            set_forcedCurrentTimeChange(newTime / 1000)
          }} />
      </div>
    </ErrorBoundary>
  );
};

function useMovieInfo(title) {
  const [currentVideoInfo, set_currentVideoInfo] = useState({});
  const requestMovieInfo = async () => {
    try {
      const response = await axios(
        `${BASE_SERVER_URL}/movies?title=${title}`
      );
      const newMovieInfo = response.data?.results[0];
      console.log("newMovieInfo", newMovieInfo);
      set_currentVideoInfo(newMovieInfo);
    } catch (err) {
      console.log("ITEM GET ERROR: ", err);
    }
  };

  useEffect(() => {
    requestMovieInfo();
  }, [title]);

  return currentVideoInfo
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