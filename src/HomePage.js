import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
import HorizontalScrollMenu, { TagsScroll } from "./components/HorizontalScrollMenu";
import StickyHeader from "./components/StickyHeader";
import api, { BASE_SERVER_URL } from "./api";
import { useTranslation } from "react-i18next";
import Onboarding from "./components/Onboarding";
import PWAInstall from "./components/PWAInstall";
import { useDynamicReducer } from "./dynamicReducer";
import InfiniteScroll from "./components/InfiniteScroll";
import { ShortVideo, VkVideoInit } from "./containers/ShortVideo";
import { WordCollectionCarousel2 } from "./containers/WordCollectionCarousel2";
import { HorizontalScroll } from "./containers/WordCollectionCarousel";
import { degausser } from "./utils/degausser";
import HorizontalScrollMenu2 from "./components/HorizontalScrollMenu2";

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
      <div className="pb-2">
        <TagsScroll firstSticky onIndexUpdate={(item) => set_category(item)} />
      </div>
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
        <InfiniteScroll
          requestData={async () => (await api().get('/rec?category=Phrases'))}
          renderItem={(item, activeIndex) => {
            console.log('item', item)

            return <Phrases item={item} />
          }}
        />
      )}
      {category === 'Music' && (
        <InfiniteScroll
          requestData={async () => (await api().get('/rec?category=Music'))}
          renderItem={(item, isActive) => {
            return (
              <div id={item.id}>
                {item.mediaTitle}
                <ShortVideo
                  mediaTitle={item.mediaTitle}
                  isActive={isActive}
                />
              </div>
            )
          }}
        />
      )}
      {category === 'Words' && (
        <InfiniteScroll
          requestData={async () => (await api().get('/rec?category=Words'))}
          renderItem={(item) => {
            return <Phrases item={item} />
          }}
        />
      )}
      {category === 'Cartoon' && (
        <InfiniteScroll
          requestData={async () => (await api().get('/rec?category=Cartoon'))}
          renderItem={(item, isActive) => {
            console.log('item', item)
            return (
              <div id={item.id}>
                {item.mediaTitle}
                <ShortVideo
                  mediaTitle={item.mediaTitle}
                  isActive={isActive}
                />
              </div>
            )
          }}
        />
      )}
      {category === 'Series' && (
        <InfiniteScroll
          requestData={async () => (await api().get('/rec?category=Cartoon'))}
          renderItem={(item, isActive) => {
            return (
              <div id={item.id}>
                {item.mediaTitle}
                <ShortVideo
                  mediaTitle={item.mediaTitle}
                  isActive={isActive}
                />
              </div>
            )
          }}
        />
      )}
      {category === 'Courses' && (
        <InfiniteScroll
          requestData={async () => (await api().get('/rec?category=Courses'))}
          renderItem={(item, isActive) => {
            return (
              <div id={item.id}>
                {item.mediaTitle}
                <ShortVideo
                  mediaTitle={item.mediaTitle}
                  isActive={isActive}
                />
              </div>
            )
          }}
        />
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

const useGetOccurrences = (lemma, limit) => {
  const [occurrences, set_occurrences] = useState([])
  const getOccurrences = async () => {
    const new_occurrences = await api().get(`/occurances_v2?lemma=${lemma}&limit=${limit || '5'}`)
    set_occurrences(new_occurrences)
  }
  useEffect(() => {
    getOccurrences()
  }, [lemma])

  return occurrences
}

const Phrases = ({ item }) => {
  const occurrences = useGetOccurrences(item.the_word)
  console.log('occurrences', occurrences)
  return (
    <div id={item.id}>
      {!!occurrences.length && (
        <>
          <span className="px-2" style={{ color: '#333', fontSize: '1em', fontWeight: 'bold' }}>
            <span>{item.the_word}</span><span>{item.translation && '- ' + item.translation}</span>
          </span>
          <br />
          <span>{item.pronounciation}</span>
          <HorizontalScrollMenu2 items={occurrences} baseRoute={"movie"} mainText={item.the_word} />
        </>
      )}
    </div>
  )

}

export default HomePage;
