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

  const currentWordStartTime = (wordList || [])[playingWordIndex]?.startTime
  const forcedCurrentTimeChange = (currentWordStartTime || 0) / 1000
  // const { handleTimeUpdate, currentTime } = useHandleTimeUpdate(wordList, playingWordIndex, set_practicingWordIndex)

  return (
    <ErrorBoundary>
      <GoBackButton />
      <div className="MainContainer">
        <WordsScroll wordList={wordList} onIndexUpdate={set_practicingWordIndex} forcedIndex={playingWordIndex} />
        <ShortsColumns
          forceRenderFirstItem={(activeIndex) => (
            <div className="VideoContainer">
              <ShortVideo
                // onTimeUpdate={handleTimeUpdate}
                mediaTitle={title}
                forcedCurrentTimeChange={forcedCurrentTimeChange}
                isActive={activeIndex === 0} />
            </div>
          )}
          wordsIndex={playingWordIndex}
          set_practicingWordIndex={set_practicingWordIndex}
          wordList={wordList}
          // currentWordOccurances={currentWordOccurances.filter((item) => item?.mediaTitle !== title && item?.startTime !== currentWordStartTime)}
          currentWordOccurances={[]}
        />
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