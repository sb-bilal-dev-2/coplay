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

  return (
    <div className="page-container relative">
      <Link
        to="/"
        className="absolute z-10 top-4 left-4 text-white cursor-pointer"
      >
        <i className="fa fa-arrow-left" aria-hidden="true"></i>
      </Link>
      <h2 className="absolute z-10 top-3 left-16 text-gray-100">
        {currentItem?.label || title}
      </h2>
      <DashVideoPlayer title={title} currentItem={currentItem} />
      {/* <VideoPlayer title={title} currentItem={currentItem} /> */}
      <div className="section bg-secondary card-section min-h-screen">
        <div className="section-container">
          <MovieWordCards
            title={title}
            parsedSubtitleId={currentItem.parsedSubtitleId}
            userId={userId}
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