import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
import HorizontalScrollMenu from "./components/HorizontalScrollMenu";
import StickyHeader from "./components/StickyHeader";
import Footer from "./components/Footer";
import { BASE_SERVER_URL } from "./api";
import { useTranslation } from "react-i18next";
import Onboarding from "./components/Onboarding";
import PWAInstall from "./components/PWAInstall";
import { useSelector } from "react-redux";
import { useDynamicReducer } from "./dynamicReducer";

const HomePage = () => {
  const { items: videos } = useDynamicReducer("movies");
  const { items: wordCollections } = useDynamicReducer("wordCollections");
  const movies = videos?.filter(item => item.category !== 'Music');
  const clips = videos?.filter(item => item.category === 'Music');

  const { t } = useTranslation();

  return (
    <div className="page-container home-page" id="home">
      <PWAInstall />
      <Onboarding/>
      <StickyHeader />
      {/* <Hero /> */}
      <div className="">
        <h2 className="home-page__title">{"Coplay Journey"}</h2>
        <HorizontalScrollMenu items={movies} baseRoute={"movie"} />
      </div>
      <div className="">
        <h2 className="home-page__title">{"Coplay Journey"}</h2>
        <HorizontalScrollMenu items={movies} baseRoute={"movie"} />
      </div>
      <div className="">
        <h2 className="home-page__title">{"Watch Again"}</h2>
        <HorizontalScrollMenu items={movies} baseRoute={"movie"} />
      </div>
      <div className="">
        <h2 className="home-page__title">{"C1"}</h2>
        <HorizontalScrollMenu
          items={wordCollections}
          baseRoute="quiz"
          verticalCard
        />
      </div>
      <div className="">
        <h2 className="home-page__title">{"C2 Phrases"}</h2>
        <HorizontalScrollMenu
          items={wordCollections}
          baseRoute="quiz"
          verticalCard
        />
      </div>
      <div className="">
        <h2 className="home-page__title">{t("movies")}</h2>
        <HorizontalScrollMenu items={movies} baseRoute={"movie"} />
      </div>
      <div className="">
        <h2 className="home-page__title">{t("music")}</h2>
        <HorizontalScrollMenu items={clips} baseRoute={"movie"} />
      </div>
      {/* <Footer /> */}
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
