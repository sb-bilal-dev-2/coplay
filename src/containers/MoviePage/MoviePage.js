import React, { useEffect, useState } from "react";
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
  const { t } = useTranslation();
  const { title } = useParams();
  const { user: userIdAndEmail } = useAuthentication();
  const [currentVideoInfo, set_currentVideoInfo] = useState({});

  const userId = userIdAndEmail?.id;

  // const requestUserInfo = async () => {
  //   try {
  //     const response = await axios(`${BASE_SERVER_URL}/users/${userId}`);
  //     const newUserInfo = response.data;
  //     console.log("newUserInfo", newUserInfo);
  //   } catch (err) {
  //     console.log("ITEM GET ERROR: ", err);
  //   }
  // };

  // useEffect(() => {
  //   if (userId) {
  //     requestUserInfo();
  //   }
  // }, [userId]);
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
  const { wordList, practicingWordIndex: activeWordIndex, set_practicingWordIndex, currentWordInfo, currentWordOccurances, currentAvailableOccurancesLength } = useWordColletionWordInfos(title, undefined, 'video')

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
              startTime={startTimeInSeconds}
            />
        }
      </div>
      <WordCarousel
          list={wordList}
          activeIndex={activeWordIndex}
          currentWordInfo={currentWordInfo}
          onLeftClick={() => (set_playingOccuranceIndex(0), set_practicingWordIndex(activeWordIndex - 1))}
          onRightClick={() => (set_playingOccuranceIndex(0), set_practicingWordIndex(activeWordIndex + 1))}
        />

    </div>
  );
};

export default MoviePage;