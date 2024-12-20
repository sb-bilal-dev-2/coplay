import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
import HorizontalScrollMenu, { TagsScroll } from "./components/HorizontalScrollMenu";
import StickyHeader from "./components/StickyHeader";
import Footer from "./components/Footer";
import { BASE_SERVER_URL } from "./api";
import { useTranslation } from "react-i18next";
import Onboarding from "./components/Onboarding";
import PWAInstall from "./components/PWAInstall";
import { useSelector } from "react-redux";
import { useDynamicReducer } from "./dynamicReducer";
import InfiniteScroll from "./components/InfiniteScroll";
import { ShortVideo } from "./containers/ShortVideo";

const HomePage = () => {
  const { items: videos } = useDynamicReducer("movies");
  const { items: wordCollections } = useDynamicReducer("wordCollections");
  const movies = videos?.filter(item => item.category !== 'Music');
  const clips = videos?.filter(item => item.category === 'Music');
  console.log('clips', clips)
  console.log('movies', movies)
  const [category, set_category] = useState('All')

  const { t } = useTranslation();

  return (
    <div className="page-container home-page" id="home">
      <PWAInstall />
      <Onboarding />
      <StickyHeader />
      {/* <Hero /> */}
      <TagsScroll firstSticky onIndexUpdate={(item) => set_category(item)} />
      {category === 'All' && (
        <>
          <div className="">
            <h2 className="home-page__title">{"Lessons"}</h2>
            <HorizontalScrollMenu items={movies} baseRoute={"movie"} card_className="horizontal list" />
          </div>
          <div className="">
            <h2 className="home-page__title">{"Movies"}</h2>
            <HorizontalScrollMenu items={movies} baseRoute={"movie"} />
          </div>
          <div className="">
            <h2 className="home-page__title">{"C1"}</h2>
            <HorizontalScrollMenu
              items={wordCollections}
              baseRoute="word_collection"
              card_className="horizontal list"
            />
          </div>
          <div className="">
            <h2 className="home-page__title">{t("music")}</h2>
            <HorizontalScrollMenu items={clips} baseRoute={"movie"} card_className="full" />
          </div>
          <div className="">
            <InfiniteScroll item={movies} />
          </div>
        </>
      )}
      {category === 'Phrases' && (
        <InfiniteScroll item={movies} />
      )}
      {category === 'Music' && (
        <InfiniteScroll item={clips} />
      )}
      {category === 'Words' && (
        <InfiniteScroll item={movies} />
      )}
      {category === 'Cartoons' && (
        <InfiniteScroll item={movies} />
      )}
      {category === 'Series' && (
        <InfiniteScroll item={movies} />
      )}
      {category === 'Courses' && (
        <InfiniteScroll item={movies} />
      )}
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
