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
import { GoBackButton, WordCarousel, useWordColletionWordInfos } from "../Quiz";

const MoviePage = () => {
  const { title } = useParams();
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

  const [playingOccuranceIndex, set_playingOccuranceIndex] = useState(0);
  console.log('title', title)
  const newTitle = useMemo(() => title, [title]);
  const { wordList, practicingWordIndex: activeWordIndex, set_practicingWordIndex, currentWordInfo, currentWordOccurances, currentAvailableOccurancesLength } = useWordColletionWordInfos(newTitle, undefined, 'video')

  useEffect(() => {
    requestMovieInfo();
  }, [title]);

  const { user: premiumExpireDate } = useAuthentication();
  const isPremium = usePremiumStatus(premiumExpireDate);

  useEffect(() => {
    if (!isPremium) {
      // Handle non-premium users
    }
  }, [isPremium]);
  // const [videoUrls, set_videoUrls] = useState(['https://www.youtube.com/watch?v=4NRXx6U8ABQ&list=PLfWTbASpwTDiVOkVmOU2QA97pFtR0fXj6&t=55s', 'https://www.youtube.com/watch?v=4m48GqaOz90&t=15'])
  // const [videoUrl, set_videoUrl] = useState(videoUrls[0])
  // const currentPlayingOccurance = currentWordOccurances[playingOccuranceIndex]
  // const startTimeInSeconds = currentPlayingOccurance?.startTime / 1000
  const startTimeInSeconds = 0
  const [currentTime, set_currentTime] = useState(0)
  const handleTimeUpdate = useCallback((currentTime) => set_currentTime(currentTime))
  const closestWordInList = wordList.findIndex(i => i.startTime / 1000 > currentTime)
  console.log('closestWordInList', closestWordInList)
  return (
    <div className="page-container bg-video text-gray-100 relative min-h-screen">
      <GoBackButton />
      <h2 className="absolute z-10 top-3 left-16 text-gray-100">
        {!currentVideoInfo?.youtubeUrl && (currentVideoInfo?.label || title)}
      </h2>
      <div className="VideoContainer">
        {
          !!currentVideoInfo?.youtubeUrl ?
            <YoutubePlayer videoIdOrUrl={currentVideoInfo?.youtubeUrl} startTime={startTimeInSeconds} />
            :
            <VideojsInited
              // autoPlay={playingOccuranceIndex !== 0}
              videoSrc={`${BASE_SERVER_URL}/movie?name=${title}`}
              // startTime={startTimeInSeconds}
              onTimeUpdate={handleTimeUpdate}
            />
        }
      </div>
      <WordCarousel
        list={wordList}
        activeIndex={closestWordInList}
        currentWordInfo={currentWordInfo}
        onLeftClick={() => (set_playingOccuranceIndex(0), set_practicingWordIndex(activeWordIndex - 1))}
        onRightClick={() => (set_playingOccuranceIndex(0), set_practicingWordIndex(activeWordIndex + 1))}
      />
    </div>
  );
};

export default MoviePage;