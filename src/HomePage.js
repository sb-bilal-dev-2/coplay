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
import { VkVideoInit } from "./containers/ShortVideo";
import { HorizontalScrollCarousel } from "./containers/WordCollectionCarousel";
import { degausser } from "./utils/degausser";
import HorizontalScrollMenu2 from "./components/HorizontalScrollMenu2";

const HomePage = () => {
  const { items: videos } = useDynamicReducer("movies");
  const { items: wordCollections } = useDynamicReducer("wordCollections");
  const movies = videos?.filter(item => item.category === 'Cartoon');
  const podcasts = videos?.filter(item => item.category === 'Podcast')
  const clips = videos?.filter(item => item.category === 'Music');
  const [category, set_category] = useState('All')

  const { t } = useTranslation();

  return (
    <div className="page-container home-page" id="home">
      <PWAInstall />
      <Onboarding />
      <StickyHeader />
      {/* <Hero /> */}
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
            <h2 className="home-page__title">{t("Words and Phrases")}</h2>
            {/* <InfiniteScroll
              requestData={async () => (await api().get('/rec?category=Phrases'))}
              renderItem={(item, activeIndex, index) => {
                console.log('item', item)

                return <Phrases item={item} isActive={activeIndex === index} />
              }}
            /> */}
            <InfiniteScroll item={movies} />
          </div>
        </>
      )}
      {category === 'Trending 🔥' && (
        <InfiniteScroll
          requestData={async () => (await api().get('/youtube_trends'))}
          renderItem={(item) => {
            console.log('item', item)
            // channelTitle
            // description
            // stats
            // {viewCount: '388706', likeCount: '56218', favoriteCount: '0', commentCount: '4982'}
            // thumbnail
            // title
            // videoId

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
      {category === 'Phrases' && (
        <InfiniteScroll
          requestData={async () => (await api().get('/rec?category=Phrases'))}
          renderItem={(item, activeIndex, index) => {
            console.log('item', item)

            return <Phrases item={item} isActive={activeIndex === index} />
          }}
        />
      )}
      {category === 'Music' && (
        <InfiniteScroll
          requestData={async () => (await api().get('/rec?category=Music'))}
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
          requestData={async () => (await api().get('/rec?category=Cartoon'))}
          renderItem={(postItem, isActive) => {
            return (
              <CarouselPost postItem={postItem} isActive={isActive} />
            )
          }}
        />
      )}
      {category === 'Podcasts' && (
        <InfiniteScroll
          requestData={async () => (await api().get('/rec?category=Podcast'))}
          renderItem={(postItem, isActive) => {
            return (
              <CarouselPost postItem={postItem} isActive={isActive} />
            )
          }}
        />
      )}
      {category === 'Series' && (
        <InfiniteScroll
          requestData={async () => (await api().get('/rec?category=Series'))}
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

const Phrases = ({ item, isActive }) => {
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
          <HorizontalScrollMenu2 isActive={isActive} items={occurrences} baseRoute={"movie"} mainText={item.the_word} />
        </>
      )}
    </div>
  )
}

export default HomePage;
