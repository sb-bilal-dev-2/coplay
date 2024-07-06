import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
import HorizontalScrollMenu from "./components/HorizontalScrollMenu";
import StickyHeader from "./components/StickyHeader";
import Footer from "./components/Footer";
import useRequests from "./useRequests";
import { BASE_SERVER_URL } from "./api";
import { useTranslation } from "react-i18next";

const HomePage = () => {
  const { items } = useRequests("movies");
  const { items: wordCollections } = useRequests("wordCollections");

  const movies = items?.filter(item => item.category !== 'Music');
  const clips = items?.filter(item => item.category === 'Music');

  const { t } = useTranslation();

  return (
    <div className="page-container home-page">
      <StickyHeader />
      <Hero />
      <div className="section bg-gray-900">
        <h2>{t("movies")}</h2>
        <HorizontalScrollMenu items={movies} baseRoute={"movie"} />
      </div>
      <div className="section bg-gray-900">
        <h2>{t("music")}</h2>
        <HorizontalScrollMenu items={clips} baseRoute={"movie"} />
      </div>
      <div className="section bg-gray-900">
        <h2>{t("words collections")}</h2>
        <HorizontalScrollMenu
          items={wordCollections}
          baseRoute="wordCollection"
          verticalCard
        />
      </div>
      <Footer />
    </div>
  );
};
const BASE_BUCKET_URI = BASE_SERVER_URL + "/movieFiles";
function Hero() {
  const { t } = useTranslation();

  return (
    <div className="relative heroContainer">
      <img
        className="w-full"
        src={`${BASE_BUCKET_URI}/frozen.hero.jpg`}
        alt="American Nightmare banner placeholder"
      />
      <div className="info absolute bottom-20 left-10">
        <h1 className="text-4xl font-bold mb-4">
          {t("learn english with Frozen")}
        </h1>
        <div className="flex">
          <button className="flex items-center rounded-sm bg-white text-black px-4 py-2 mr-4">
            <Link to={"/movie/frozen"}>
              <i className="fas fa-play mr-2">
                <b className="ml-2 uppercase font-bold">{t("play")}</b>
              </i>
            </Link>
          </button>
          <button className="primary-button-2 flex items-center px-4 py-2">
            <i className="fas fa-info-circle mr-2"></i>
            {t("Frozen Vocab")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
