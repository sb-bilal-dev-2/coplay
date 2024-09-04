import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

import "./MoviePage.css";
import { BASE_SERVER_URL } from "../../api";
import MovieWordCards from "./MovieWordCards";
import useAuthentication from "../Authentication.util";
import SecondaryButton from "../../components/SecondaryButton";
import { usePremiumStatus } from "../../helper/usePremiumStatus";
// import VideoPlayer from "./VideoPlayer";
import DashVideoPlayer from "../../components/DashVideoPlayer";
import YoutubePlayer from "../../components/YoutubePlayer";

const MoviePage = () => {
  const { t } = useTranslation();
  const { title } = useParams();
  const { user: userIdAndEmail } = useAuthentication();
  const [userInfo, setUserInfo] = useState(null);
  const [currentItem, setCurrentItem] = useState({});

  const userId = userIdAndEmail?.id;

  const requestUserInfo = async () => {
    try {
      const response = await axios(`${BASE_SERVER_URL}/users/${userId}`);
      const newUserInfo = response.data;
      console.log("newUserInfo", newUserInfo);
      setUserInfo(newUserInfo);
    } catch (err) {
      console.log("ITEM GET ERROR: ", err);
    }
  };

  useEffect(() => {
    if (userId) {
      requestUserInfo();
    }
  }, [userId]);

  useEffect(() => {
    const requestMovieInfo = async () => {
      try {
        const response = await axios(
          `${BASE_SERVER_URL}/movies?title=${title}`
        );
        const newMovieInfo = response.data?.results[0];
        console.log("newMovieInfo", newMovieInfo);
        setCurrentItem(newMovieInfo);
      } catch (err) {
        console.log("ITEM GET ERROR: ", err);
      }
    };

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

  return (
    <div className="page-container relative">
      <Link
        to="/"
        className="absolute z-10 top-4 left-4 text-white cursor-pointer"
      >
        <i className="fa fa-arrow-left" aria-hidden="true"></i>
      </Link>
      
      <h2 className="absolute z-10 top-3 left-16 text-gray-100">
        {!currentItem?.youtubeUrl && (currentItem?.label || title)}
      </h2>
      {currentItem && currentItem?.youtubeUrl ?
        <YoutubePlayer videoIdOrUrl={currentItem?.youtubeUrl} controls />
          : currentItem &&
        <DashVideoPlayer title={title} currentItem={currentItem} />
      }
      {/* <YoutubePlayer videoIdOrUrl={videoUrl} /> */}
      {/* <button onClick={() => set_videoUrl(videoUrls[1])}>Next</button> */}
      {/* {videoUrls.map((item, index) => {
            return <YoutubePlayer videoIdOrUrl={item} />
      })} */}

      {/* <YoutubePlayer videoIdOrUrl='https://www.youtube.com/watch?v=4NRXx6U8ABQ&list=PLfWTbASpwTDiVOkVmOU2QA97pFtR0fXj6&t=55s' />
      {/* <VideoPlayer title={title} currentItem={currentItem} /> */}
      <div className="section bg-secondary card-section min-h-screen">
        <div className="section-container">
          <MovieWordCards
            title={title}
            parsedSubtitleId={currentItem.parsedSubtitleId}
            userId={userId}
            mediaLang={currentItem?.mediaLang}
          />
          <div className="flex justify-center align-middle">
            <SecondaryButton
              path={`/quiz/${title}`}
              title={t("watch words of", { item: currentItem?.label || title })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoviePage;