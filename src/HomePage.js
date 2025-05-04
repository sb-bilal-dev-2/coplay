import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
import HorizontalScrollMenu, { TagsScroll } from "./components/HorizontalScrollMenu";
import StickyHeader from "./components/StickyHeader";
import api, { BASE_SERVER_URL } from "./api";
import { useTranslation } from "react-i18next";
import Onboarding from "./components/Onboarding";
import PWAInstall from "./components/PWAInstall";
import InfiniteScroll from "./components/InfiniteScroll";
import { VkVideoInit } from "./containers/ShortVideo";
import { HorizontalScrollCarousel } from "./containers/WordCollectionCarousel";
import HorizontalScrollMenu2 from "./components/HorizontalScrollMenu2";
import { useSelector } from "react-redux";
import { throttle } from "./utils/throttle";

const TAGS = ["Top", 'Popular', 'Trending 🔥', 'Podcasts', "Series"] // add 'Courses', 'Interactive', 'Series', 'Cartoons'

const HomePage = () => {
  // const { items: videos } = useDynamicReducer("movies");
  // const { items: wordCollections } = useDynamicReducer("wordCollections");
  // const movies = videos?.filter(item => item.category === 'Cartoon');
  // const clips = videos?.filter(item => item.category === 'Music');
  const langReload = useSelector((state) => state.language?.reload)
  const [category, set_category] = useState("Top")
  const [podcasts] = useGetPlaylist("PLY_ceo_podcast")
  // const [music_vocoplay] = useGetPlaylist("PLY_music_vocoplay")
  const [music_vocoplay] = useGetPlaylist("PLY_music_popular")
  const [movies] = useGetPlaylist("PLY_series_cartoon_avatar")
  const [series] = useGetPlaylist("PLY_series_friends")
  const { t } = useTranslation();

  return (
    <div className="page-container home-page" id="home">
      <PWAInstall />
      <Onboarding />
      <StickyHeader />
      <Hero />
      {/* <VideoFrame time={500} title={'frozen'} /> */}
      <div className="pb-2">
        <TagsScroll tags={TAGS} firstSticky onIndexUpdate={(item) => set_category(item)} />
      </div>
      {category === 'Popular' && !langReload && (
        <Popular />
      )}
      {category === 'Top' && !langReload && (
        <InfiniteScroll
          // requestData={async () => (await api().get('/rec?category=Music'))}
          requestData={() => ({ results: music_vocoplay })}
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
      {category === 'Cartoons' && !langReload && (
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
      {category === 'Trending 🔥' && !langReload && (
        <InfiniteScroll
          // requestData={async () => (await api().get(`/youtube_trends`))}
          requestData={async () => (await api().get("/youtube_playlist?playlistId=PLY_music_trending"))}
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
      {category === 'Podcasts' && !langReload && (
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
      {category === 'Series' && !langReload && (
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

const HELLO_MAP = { en: "Learn with Music!", uz: "Musiqa bilan o'rganing" }
// const INITIAL_HEADER_BY_LANG = {
//   'zh-CN': [{ the_word: "你好!", pronounciation: "Nǐ hǎo" }],
//   'ko': [{ the_word: "안녕하세요!", pronounciation: "annyeonghaseyo" }],
//   'en': [{ the_word: "Hello!", pronounciation: "həˈləʊ" }],
//   'sp': [{ the_word: "Hola!", pronounciation: "ow·luh" }],
//   'ru': [{ the_word: "Привет!", pronounciation: "privet" }],
//   'fr': [{ the_word: "Bonjour!", pronounciation: "bon·zhuor" }],
//   'tr': [{ the_word: "Merhaba!", pronounciation: "MER-ha-bah" }],
//   'ar': [{ the_word: "مرحبا!", pronounciation: "marḥabā" }],
//   'ar': [{ the_word: "नमस्ते", pronounciation: "namaste" }],
// }
const INITIAL_HEADER_BY_LANG = {
  "zh-CN": [{ "the_word": "跟音乐一起学", "pronounciation": "Gēn yīnyuè yīqǐ xué" }],
  "ko": [{ "the_word": "음악으로 배워요", "pronounciation": "eumageuro baewoyo" }],
  "en": [{ "the_word": "Learn with Music", "pronounciation": "lɜrn wɪð ˈmjuːzɪk" }],
  "sp": [{ "the_word": "Aprende con música", "pronounciation": "ah-PREN-deh kon MOO-see-kah" }],
  "ru": [{ "the_word": "Учись с музыкой", "pronounciation": "oo-CHEES' s MOO-zy-koy" }],
  "fr": [{ "the_word": "Apprends avec la musique", "pronounciation": "ah-prã ah-vek lah myu-zeek" }],
  "tr": [{ "the_word": "Müzikle öğren", "pronounciation": "MEW-zik-leh OH-ren" }],
  "ar": [{ "the_word": "تعلّم مع الموسيقى", "pronounciation": "taʿallam maʿa al-mūsīqā" }],
  "hi": [{ "the_word": "संगीत के साथ सीखें", "pronounciation": "sangeet ke saath seekhen" }]
}

function Hero() {
  const { t } = useTranslation();

  const [phrases, set_phrases] = useState([])
  const [wordInfos, set_wordInfos] = useState([])

  async function getPhrases() {
    try {
      const new_phrases = (await api().get('/rec?category=Words')).results
      console.log('new_phrases', new_phrases)
      set_phrases(new_phrases)
      const mainLang = localStorage.getItem("mainLanguage") || 'en'

      const new_wordInfos = (await Promise.allSettled(new_phrases.map((item) => {
        if (!item) return;
        return api().get(`/wordInfoLemma?mainLang=${mainLang}&the_word=${item?.the_word}`)
      }))).map(({ value }) => value)
      console.log('new_wordInfos', new_wordInfos)
      set_wordInfos(new_wordInfos)
    } catch (err) {
      console.log('error', err)
    }
  }

  const throttled_getPhrases = throttle(getPhrases, 1000)

  useEffect(() => {
    getPhrases()
  }, [])
  console.log('phrases', phrases)
  const mainLang = localStorage.getItem('mainLanguage')
  const learningLang = localStorage.getItem('learningLanguage')
  return (
    <>
      <HorizontalScrollCarousel
        dotPosition="bottom"
        active
        items={INITIAL_HEADER_BY_LANG[learningLang]?.concat(wordInfos).filter(item => item)}
        renderItem={({ the_word, shortDefinitions, pronounciation }, index) => {
          return (
            <div className="text-4xl text-center pb-1">
              <p className="text-xs color-indigo-2 text-center">{pronounciation}</p>
              <p className="color-primary font-bold" translate="no">
                {the_word}
              </p>
              <p className="color-secondary font-bold pb-2 text-2xl">
                {(!index && HELLO_MAP[mainLang])
                  || (shortDefinitions && shortDefinitions[mainLang])
                }
              </p>
            </div>
          )
        }}
      />
      <div className="Hero grid gap-1 grid-flow-col p-4 radius-4">
        <Link to="/quiz/repeating?listType=self_words" className="bg-white border p-2 rounded-lg text-center" style={{ minWidth: "68px", border: "1px solid rgb(200, 200, 200)", boxShadow: '1px 1px 10px rgb(20, 20, 20, 0.05)' }}>
          <i className="fa-regular fa-star color-secondary"></i>
          <p className="text-sm text-gray-600">Repeat</p>
        </Link>
        <button
          // to="/explore"
          onClick={() => throttled_getPhrases()}
          className="bg-white border p-2 rounded-lg text-center"
          style={{ minWidth: "68px", border: "1px solid rgb(200, 200, 200)", boxShadow: '1px 1px 10px 0px rgb(20, 20, 20, 0.05)' }}>
          {/* <i className="fa-regular fa-font-awesome color-secondary"></i> */}
          <svg xmlns="http://www.w3.org/2000/svg" style={{ margin: 'auto', margin: '2px auto' }} height={21} width={21} fill="red" viewBox="0 0 24 24" aria-hidden="true" class="icon "><path fill="orange" fill-rule="evenodd" d="M10.052 2.13h-2.59c-.921 0-1.667.896-1.667 2v12q0 .307.073.587l-.023.09c-.32 1.269.215 2.579 1.239 3.298-1.663-.225-2.956-1.919-2.956-3.975v-12c0-2.209 1.492-4 3.333-4h8.334c1.606 0 2.948 1.365 3.263 3.18l-2.087-.596c-.3-.36-.717-.584-1.176-.584h-.865l-2.146-.614a2.89 2.89 0 0 0-2.732.614" clip-rule="evenodd"></path><path fill="orange" fill-rule="evenodd" d="m9.94 19.75-2.934.786c-.889.239-1.841-.433-2.127-1.5L1.773 7.445c-.286-1.067.203-2.125 1.092-2.363l2.263-.607V3.13c0-.271.054-.53.152-.766l-2.932.786C.57 3.626-.41 5.742.163 7.876L3.27 19.467c.572 2.134 2.477 3.478 4.255 3.001l6.278-1.682zm2.115-18.703a2.9 2.9 0 0 0-1.658-.054l-.512.137h1.994q.086-.044.176-.083" clip-rule="evenodd"></path><path fill="orange" fill-rule="evenodd" d="m20.386 5.382-7.66-2.444c-.847-.27-1.779.388-2.083 1.47L7.342 16.17c-.304 1.083.136 2.179.982 2.449l7.66 2.444c.846.27 1.778-.388 2.082-1.47L21.368 7.83c.303-1.083-.136-2.179-.982-2.449zM13.276.978c-1.692-.54-3.557.777-4.165 2.942L5.81 15.68c-.608 2.165.271 4.358 1.963 4.898l7.66 2.444c1.693.54 3.557-.777 4.165-2.942L22.9 8.32c.607-2.165-.272-4.358-1.964-4.898z" clip-rule="evenodd"></path><path fill="orange" fill-rule="evenodd" d="M11.625 6.858c.152-.541.618-.87 1.041-.736l6.128 1.956c.423.135.643.683.491 1.224s-.618.87-1.04.736l-6.129-1.956c-.423-.135-.643-.683-.49-1.224zm-1.1 3.92c.152-.541.618-.87 1.04-.736l6.129 1.956c.423.135.643.683.49 1.224-.151.541-.617.87-1.04.736l-6.128-1.956c-.424-.135-.643-.683-.491-1.224m-1.101 3.92c.152-.541.618-.87 1.041-.736l3.064.978c.423.135.643.683.491 1.225-.152.54-.618.87-1.04.735l-3.065-.978c-.423-.135-.643-.683-.49-1.224z" clip-rule="evenodd"></path></svg>
          <p className="text-sm text-gray-600">Explore</p>
        </button>
        <button disabled to="/stories" className="bg-white border p-2 rounded-lg text-center" style={{ minWidth: "68px", border: "1px solid rgb(200, 200, 200)", boxShadow: '1px 1px 10px 0px rgb(20, 20, 20, 0.05)' }}>
          <i className="fa fa-book-open color-secondary opacity-50"></i>
          <p className="text-sm text-gray-600">Stories</p>
          {/* <svg fill="orange" height={22} width={22} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" class="icon "><path fill-rule="evenodd" d="M7.422 6.122a1 1 0 0 0-1.3 1.3l2.828 7.07a1 1 0 0 0 .557.558l7.071 2.828a1 1 0 0 0 1.3-1.3l-2.828-7.07a1 1 0 0 0-.557-.558zm3.226 7.23 4.507 1.803-1.803-4.507z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18m0 2c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11" clip-rule="evenodd"></path></svg> */}
        </button>
        <button disabled to="/livestream" className="bg-white border p-2 rounded-lg text-center" style={{ minWidth: "68px", border: "1px solid rgb(200, 200, 200)", boxShadow: '1px 1px 10px 0px rgb(20, 20, 20, 0.05)' }}>
          <i className="fa-solid fa-microphone color-secondary opacity-50"></i>
          <p className="text-sm text-gray-600">Live</p>
          {/* <svg fill="orange" height={22} width={22} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" class="icon "><path fill-rule="evenodd" d="M7.422 6.122a1 1 0 0 0-1.3 1.3l2.828 7.07a1 1 0 0 0 .557.558l7.071 2.828a1 1 0 0 0 1.3-1.3l-2.828-7.07a1 1 0 0 0-.557-.558zm3.226 7.23 4.507 1.803-1.803-4.507z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18m0 2c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11" clip-rule="evenodd"></path></svg> */}
        </button>
        {/* <Link to="/dialogs" className="bg-white border p-2 rounded-lg text-center" style={{ minWidth: "68px", border: "1px solid rgb(200, 200, 200)", boxShadow: '1px 1px 10px 0px rgb(20, 20, 20, 0.05)' }}>
          <i className="fa-regular fa-message color-secondary"></i>
          <p className="text-sm text-gray-600">Stories</p>
        </Link> */}
        {/* <Link to="/history" className="bg-white border p-2 rounded-lg text-center" style={{ minWidth: "68px", border: "1px solid rgb(200, 200, 200)", boxShadow: '1px 1px 10px 0px rgb(20, 20, 20, 0.05)' }}>
          <i className="fa-regular fa-clock color-secondary"></i>
          <p className="text-sm text-gray-600">History</p>
        </Link> */}
      </div>
    </>
  );
}

function Popular() {
  const [music_pop] = useGetPlaylist("PLY_music_pop")
  const [music_cartoon] = useGetPlaylist("PLY_music_cartoon")
  const [music_work] = useGetPlaylist("PLY_music_work")
  const [music_traditional] = useGetPlaylist("PLY_music_classical")
  const [music_morning] = useGetPlaylist("PLY_music_morning")
  const [music_calm] = useGetPlaylist("PLY_music_calm")
  
  const { t } = useTranslation();

  return <>
    <div className="">
      <h2 className="home-page__title">{"Pop songs"}</h2>
      <HorizontalScrollMenu items={music_pop} baseRoute={"movie"} card_className="horizontal list" />
    </div>
    <div className="">
      <h2 className="home-page__title">{"Cartoons & Movies"}</h2>
      <HorizontalScrollMenu items={music_cartoon} baseRoute={"movie"} />
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
      <h2 className="home-page__title">{t("Study & Work")}</h2>
      <HorizontalScrollMenu items={music_work} baseRoute={"movie"} card_className="full" />
    </div>
    <div className="">
      <h2 className="home-page__title">{t("Timeless Hits")}</h2>
      <HorizontalScrollMenu items={music_traditional} baseRoute={"movie"} card_className="full" />
    </div>
    <div className="">
      <h2 className="home-page__title">{t("Happy Mornings")}</h2>
      <HorizontalScrollMenu items={music_morning} baseRoute={"movie"} card_className="full" />
    </div>
    <div className="">
      <h2 className="home-page__title">{t("Relaxing")}</h2>
      <HorizontalScrollMenu items={music_calm} baseRoute={"movie"} card_className="full" />
    </div>
    <div className="">
      <h2 className="home-page__title">{t("Kids Songs")}</h2>
      <HorizontalScrollMenu items={music_cartoon} baseRoute={"movie"} card_className="full" />
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

function useGetPlaylist(category) {
  const [podcasts, set_podcasts] = useState([])
  const request_podcasts = async () => {
    api().get('/youtube_playlist?playlistId=' + category)
      .then((new_podcasts) => set_podcasts(new_podcasts.results))
      .catch((err) => { })
  }
  useEffect(() => {
    request_podcasts()
  }, [category])
  return [podcasts, set_podcasts]
}

export default HomePage;
