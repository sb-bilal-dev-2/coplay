import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

import "./MoviePage.css";
import api, { BASE_SERVER_URL } from "../../api";
import MovieWordCards from "./MovieWordCards";
import useAuthentication from "../Authentication.util";
import SecondaryButton from "../../components/SecondaryButton";
import { usePremiumStatus } from "../../helper/usePremiumStatus";
// import VideoPlayer from "./VideoPlayer";
import DashVideoPlayer from "../../components/DashVideoPlayer";
import YoutubePlayer from "../../components/YoutubePlayer";
import VideojsInited from "../../components/VideojsInited";
import { GoBackButton, ShortVideo, ShortsColumns, WordCarousel, WordsScroll, useWordColletionWordInfos } from "../Quiz";
import ErrorBoundary from "../ErrorBoundary";

const MoviePage = () => {
  const { title } = useParams();
  const movieInfo = useMovieInfo(title);
  const isPremium = usePremiumStatus();
  // const { list: listName, word: paramWord } = useParams();
  const { wordList, set_practicingWordIndex, practicingWordIndex: playingWordIndex, currentWordInfo, currentWordOccurances, currentAvailableOccurancesLength, wordInfos } = useWordColletionWordInfos(title, undefined, 'video')
  console.log('wordList', wordList, currentWordOccurances)
  const currentWordStartTime = (wordList || [])[playingWordIndex]?.startTime
  // const [forcedWordIndex, set_forcedWordIndex] = useState(0)
  const [currentTime, set_currentTime] = useState(0)
  const handleTimeUpdate = useCallback((new_currentTime) => {
    console.log('wordList.length', wordList.length)
    set_currentTime(new_currentTime)
  }, [wordList])

  useEffect(() => {
    for (let ii = 0; ii < wordList.length; ii++) {
      const item = wordList[ii];
      console.log('currentTime', currentTime)
      if (item.startTime > currentTime * 1000) {
        console.log('forcingIndex', ii, currentTime)
        // set_forcedWordIndex(ii - 1)
        return
      }
    }
  }, [currentTime])

  return (
    <ErrorBoundary>
      <GoBackButton />
      <div className="MainContainer">
        <WordsScroll wordList={wordList} set_practicingWordIndex={set_practicingWordIndex} />
        <ShortsColumns
          forceRenderFirstItem={(activeIndex) => (
            <div className="VideoContainer">
              <ShortVideo
                onTimeUpdate={handleTimeUpdate}
                mediaTitle={title}
                startTime={(currentWordStartTime || 0) / 1000}
                isActive={activeIndex === 0} />
            </div>
          )}
          wordsIndex={playingWordIndex}
          wordList={wordList}
          currentWordOccurances={currentWordOccurances.filter((item) => item?.mediaTitle !== title && item?.startTime !== currentWordStartTime)} />
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

  console.log('title', title)

  useEffect(() => {
    requestMovieInfo();
  }, [title]);

  return currentVideoInfo
}

export default MoviePage;