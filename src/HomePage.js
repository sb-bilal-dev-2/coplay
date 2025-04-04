import React, { useEffect, useRef, useState } from "react";
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
import { VkVideoInit } from "./containers/ShortVideo";
import { HorizontalScrollCarousel } from "./containers/WordCollectionCarousel";
import { degausser } from "./utils/degausser";
import HorizontalScrollMenu2 from "./components/HorizontalScrollMenu2";
import { useOutsideAlerter } from "./components/useOutsideAlerter";

const HomePage = () => {
  // const { items: videos } = useDynamicReducer("movies");
  // const { items: wordCollections } = useDynamicReducer("wordCollections");
  // const movies = videos?.filter(item => item.category === 'Cartoon');
  // const clips = videos?.filter(item => item.category === 'Music');
  const [category, set_category] = useState("Trending 🔥")
  const [podcasts] = useGetPopular("podcasts")
  const [clips] = useGetPopular("music")
  const [movies] = useGetPopular("cartoon")
  const [series] = useGetPopular("series")

  const { t } = useTranslation();

  return (
    <div className="page-container home-page" id="home">
      <PWAInstall />
      <Onboarding />
      <StickyHeader />
      <Hero />
      {/* <VideoFrame time={500} title={'frozen'} /> */}
      <div className="pb-2">
        <TagsScroll firstSticky onIndexUpdate={(item) => set_category(item)} />
      </div>
      {category === 'Popular' && (
        <>
          <div className="">
            <h2 className="home-page__title">{"Podcasts"}</h2>
            <HorizontalScrollMenu items={podcasts} baseRoute={"movie"} card_className="horizontal list" />
          </div>
          <div className="">
            <h2 className="home-page__title">{"Cartoons"}</h2>
            <HorizontalScrollMenu items={movies} baseRoute={"movie"} />
          </div>
          <div className="">
            {/* <h2 className="home-page__title">{"C1"}</h2>
            <HorizontalScrollMenu
              items={wordCollections}
              baseRoute="word_collection"
              card_className="horizontal list"
            /> */}
          </div>
          <div className="">
            <h2 className="home-page__title">{t("music")}</h2>
            <HorizontalScrollMenu items={clips} baseRoute={"movie"} card_className="full" />
          </div>
          <div className="">
            {/* <h2 className="home-page__title">{t("Words and Phrases")}</h2> */}
            {/* <InfiniteScroll
              requestData={async () => (await api().get('/rec?category=Phrases'))}
              renderItem={(item, activeIndex, index) => {
                console.log('item', item)

                return <Phrases item={item} isActive={activeIndex === index} />
              }}
            /> */}
            {/* <InfiniteScroll item={movies} /> */}
          </div>
        </>
      )}
      {category === 'Trending 🔥' && (
        <InfiniteScroll
          requestData={async () => (await api().get(`/youtube_trends`))}
          renderItem={(item) => {
            return (
              <div className="relative" style={{ maxWidth: "500px", margin: '10px auto' }}>
                <Link to={'/movie/' + 'youtube_' + item.videoId}>
                  <h4 className="text-left absolute text-white" style={{ top: "10px", left: '8px', zIndex: '20', textShadow: '1px 1px #333' }}>{item.title}</h4>
                </Link>
                <div style={{ width: '100%', height: '200px', background: '#333', display: 'flex', flexDirection: 'column', borderRadius: '4px' }}>
                  {(
                    item.vkVideoEmbed ?
                      <VkVideoInit
                        iframeSrc={item.vkVideoEmbed}
                        isActive
                        startTime={3}
                      />
                      :
                      <div style={{ overflow: 'hidden', height: '100%', width: '100%', position: 'relative' }}>
                        <div style={{ height: '130%', width: '150%', position: 'absolute', left: `-${50 / 2}%`, bottom: `-${30 / 4}%` }}>
                          <iframe
                            style={{ height: '100%', width: '100%' }}
                            // src={"https://www.youtube.com/embed/2Vv-BfVoq4g"}
                            src={"https://www.youtube.com/embed/" + item.videoId}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin"
                          />
                        </div>
                      </div>
                  )}
                </div>
              </div>

            )
          }}
        />
      )}
      {category === 'Music' && (
        <InfiniteScroll
          // requestData={async () => (await api().get('/rec?category=Music'))}
          requestData={() => ({ results: clips })}
          renderItem={(postItem, isActive) => {
            return (
              <CarouselPost postItem={postItem} isActive={isActive} />
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
          // requestData={async () => (await api().get('/rec?category=Cartoon'))}
          requestData={() => ({ results: movies })}
          renderItem={(postItem, isActive) => {
            return (
              <CarouselPost postItem={postItem} isActive={isActive} />
            )
          }}
        />
      )}
      {category === 'Podcasts' && (
        <InfiniteScroll
          // requestData={async () => (await api().get('/rec?category=Podcast'))}
          requestData={() => ({ results: podcasts })}
          renderItem={(postItem, isActive) => {
            return (
              <CarouselPost postItem={postItem} isActive={isActive} />
            )
          }}
        />
      )}
      {category === 'Series' && (
        <InfiniteScroll
          // requestData={async () => (await api().get('/rec?category=Series'))}
          requestData={() => ({ results: series })}
          renderItem={(postItem, isActive) => {
            return (
              <CarouselPost postItem={postItem} isActive={isActive} />
            )
          }}
        />)}
      {/* {category === 'Courses' && (
        <InfiniteScroll
          requestData={async () => (await api().get('/rec?category=Courses'))}
          renderItem={(postItem, isActive) => {
            return (
              <CarouselPost postItem={postItem} isActive={isActive} />
            )
          }}
        />)} */}
      {/* <Footer /> */}
    </div>
  );
};

function CarouselPost({ postItem, isActive }) {
  console.log('postItem', postItem)
  console.log('postItem.youtubeUrl', postItem.youtubeUrl)
  function renderItem(item, activeIndex, index) {
    return (
      <div style={{ width: '100%', height: '200px', background: '#333', display: 'flex', flexDirection: 'column' }}>
        {activeIndex === index && (
          item.vkVideoEmbed ?
            <VkVideoInit
              iframeSrc={item.vkVideoEmbed}
              isActive={isActive}
              startTime={3}
            />
            :
            <div style={{ overflow: 'hidden', height: '100%', width: '100%', position: 'relative' }}>
              <div style={{ height: '130%', width: '150%', position: 'absolute', left: `-${50 / 2}%`, bottom: `-${30 / 4}%` }}>
                <iframe
                  style={{ height: '100%', width: '100%' }}
                  // src={"https://www.youtube.com/embed/2Vv-BfVoq4g"}
                  src={item.youtubeUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin"
                />
              </div>
            </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative" style={{ maxWidth: "500px", margin: '10px auto' }}>
      <Link to={'/movie/' + postItem?.title}>
        <h4 className="text-left absolute text-white" style={{ top: "10px", left: '8px', zIndex: '20', textShadow: '1px 1px #333' }}>{postItem.title}</h4>
      </Link>
      {!postItem.carousels?.length ?
        renderItem(postItem) :
        <HorizontalScrollCarousel
          onIndexUpdate={() => { }}
          items={postItem.carousels}
          dotPosition="bottom"
          renderItem={renderItem}
        />
      }
    </div>
  )
}


function Hero() {
  const { t } = useTranslation();
  const INITIAL_HEADER_BY_LANG = {
    'zh-CN': [{ text: "Ni hao.", trans: { en: "Hello.", uz: "Salom." }}],
    'ko': [{ text: "Annageseo", trans: { en: "Hello.", uz: "Salom." }}],
    'en': [{ text: "Hello", trans: { en: "Hello.", uz: "Salom." }}]
  }
  
  const [phrases, set_phrases] = useState([])
  async function getPhrases() {
    try {
      const new_phrases = (await api().get('/rec?category=Phrases')).results
      console.log('new_phrases', new_phrases)
      set_phrases(new_phrases)
    } catch(err) {

    }
  }
  useEffect(() => {
    getPhrases()
  }, [])
  console.log('phrases', phrases)
  return (
    <>
      <HorizontalScrollCarousel
        dotPosition="bottom"
        active
        items={INITIAL_HEADER_BY_LANG[localStorage.getItem('learningLanguage')]?.concat(phrases)}
        renderItem={({ text, trans }) => {
          return (
            <div className="text-4xl">
              <h4 className="color-primary" translate="no">
                {text}
              </h4>
              <h3 className="text-gray-700">
                {trans && trans['uz']}
              </h3>
            </div>
          )
        }}
      />
      <div className="Hero grid gap-2 grid-flow-col p-4 radius-4">
        <Link to="/quiz/repeating?listType=self_words" className="bg-white border p-2 rounded-lg text-center" style={{ border: "1px solid rgb(200, 200, 200)", boxShadow: '1px 1px 10px rgb(20, 20, 20, 0.05)' }}>
          <i className="fa-regular fa-star color-secondary"></i>
          <p className="text-sm text-gray-600">Repeat</p>
        </Link>
        <Link to="/stories" className="bg-white border p-2 rounded-lg text-center" style={{ border: "1px solid rgb(200, 200, 200)", boxShadow: '1px 1px 10px 0px rgb(20, 20, 20, 0.05)' }}>
          <i className="fa fa-book-open color-secondary"></i>
          <p className="text-sm text-gray-600">Stories</p>
        </Link>
        <Link to="/dialogs" className="bg-white border p-2 rounded-lg text-center" style={{ border: "1px solid rgb(200, 200, 200)", boxShadow: '1px 1px 10px 0px rgb(20, 20, 20, 0.05)' }}>
          <i className="fa-regular fa-message color-secondary"></i>
          <p className="text-sm text-gray-600">Dialogs</p>
        </Link>
        <Link to="/history" className="bg-white border p-2 rounded-lg text-center" style={{ border: "1px solid rgb(200, 200, 200)", boxShadow: '1px 1px 10px 0px rgb(20, 20, 20, 0.05)' }}>
          <i className="fa-regular fa-clock color-secondary"></i>
          <p className="text-sm text-gray-600">History</p>
        </Link>
      </div>
    </>
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

const Phrases = ({ item, isActive }) => {
  const occurrences = useGetOccurrences(item.the_word)
  console.log('occurrences', occurrences)
  return (
    <div id={item.id}>
      {!!occurrences.length && (
        <>
          <span className="px-2" style={{ color: '#333', fontSize: '1em', fontWeight: 'bold' }}>
            <span translate="no">{item.the_word}</span><span>{item.translation && '- ' + item.translation}</span>
          </span>
          <br />
          <span translate="no">{item.pronounciation}</span>
          <HorizontalScrollMenu2 isActive={isActive} items={occurrences} baseRoute={"movie"} mainText={item.the_word} />
        </>
      )}
    </div>
  )
}

function useGetPopular(category) {
  const [podcasts, set_podcasts] = useState([])
  const request_podcasts = async () => {
    api().get('/youtube_popular?category=' + category)
      .then((new_podcasts) => set_podcasts(new_podcasts.results.videos))
      .catch((err) => { })
  }
  useEffect(() => {
    request_podcasts()
  }, [category])
  return [podcasts, set_podcasts]
}

export default HomePage;
