import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { motion } from 'framer-motion';
import api from "../api";
import "./Quiz.css";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useCustomScroll from "../components/useCustomScroll";
import BarsSmall from "../components/BarsSmall";
import { degausser } from "../utils/degausser";
import { ShortVideo, VkVideoInit } from "./ShortVideo";
import RelatedVideosDropdown, { FilterDropdown } from "./RelatedVideosDropdown";
import { WordCollectionCarousel } from "./WordCollectionCarousel";
import SecondaryButton from "../components/SecondaryButton";
import YoutubePlayer from "../components/YoutubePlayer";
import { getPronFunc } from "../utils/pron";


function useTelegramWebApp() {
  let telegramApp = window.Telegram.WebApp

  return {
    telegramApp,
    initData: telegramApp.initData
    // tg.initDataUnsafe // получаем данные от пользователя в виде объекта (работает только при запуске из меню команд бота). 
    // tg.isExpanded // возвращает true, если приложение открыто на всю высоту, false - если нет. 
    // tg.viewportHeight // вернёт ширину окна.
    // tg.sendData(data) // отправляет данные  боту в строковом виде, после чего закрывает приложение (работает только если приложение запущено с keyboard button). 
    // tg.ready() // метод позволяет отследить, когда приложение готово к отображению.
    // tg.expand() // метод позволяет растянуть окно на всю высоту.
    // tg.close() // метод закрывает приложение.
  }
}

export const GoBackButton = () => {
  const navigate = useNavigate()

  return (<button
    onClick={() => navigate(-1)}
    className="absolute z-50 top-4 left-4 cursor-pointer flex items-center justify-center"
    style={{ background: 'rgba(55, 55, 55, 0.85)', borderRadius: '30px', height: '30px', width: '30px', color: '#fff' }}
  >
    <i className="fa fa-arrow-left" aria-hidden="true"></i>
  </button>
  )
}

const ShortsContainer = ({ items, forceRenderFirstItem, wordsIndex, onSwipeLeft, onSwipeRight }) => {
  const { translate, containerRef, currentIndex, scrollTo } = useCustomScroll({ onSwipeLeft, onSwipeRight })

  useEffect(() => scrollTo(0), [wordsIndex])

  useBodyOverflowHidden()

  return (
    <div style={{ maxHeight: '100vh', overflow: 'hidden' }}>
      <motion.div
        ref={containerRef}
        style={{
          height: '100%',
          overflow: 'hidden'
        }}
        transition={{ type: "just", damping: 200, stiffness: 400 }}
        animate={{ y: translate }}
      >
        {forceRenderFirstItem && forceRenderFirstItem(currentIndex)}
        {items.map((item) => {
          return (
            <div className="VideoContainer" key={item?.id}>
              {item.renderItem(currentIndex)}
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}

export const ScrollingSubtitles = ({ subtitles, onTimeClick, currentIndex, singleLine, highlightedText = "" }) => {
  const scrollRef = useRef(null);

  const handleItemClick = (newIndex) => {
    console.log('newIndex', newIndex)
    if (onTimeClick) {
      const newItem = subtitles[newIndex]
      if (newItem?.startTime) {
        onTimeClick(newItem?.startTime)
      }
    }
  }

  const scrollToIndex = (index) => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const items = container.children;
      if (items[index]) {
        const item = items[index];
        const itemWidth = item.offsetHeight;
        const containerWidth = container.offsetHeight;

        // Calculate the scroll position to center the item
        const scrollPosition = item.offsetTop - (containerWidth / 2) + (itemWidth / 2);

        container.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  };
  useEffect(() => {
    scrollToIndex(currentIndex)
  }, [currentIndex])

  const handleWheel = useCallback((event) => {
    event.stopPropagation();
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.addEventListener('wheel', handleWheel)
      scrollRef.current.addEventListener('scroll', handleWheel)
    }

    return () => {
      if (scrollRef.current) {
        scrollRef.current.removeEventListener('wheel', handleWheel);
        scrollRef.current.removeEventListener('scroll', handleWheel);
      }
    }
  }, [scrollRef.current])

  function getHighlights(text, word) {
    const index = text.toLowerCase().indexOf(word.toLowerCase());
    return index;
  }

  return (
    // <DraggableResizableComponent>
    <div
      ref={scrollRef}
      style={{ height: "120px" }}
      className="scrollsub-container absolute bottom-10 px-4 left-5 z-20 overflow-scroll"
    >
      {subtitles?.map((subtitleLine, lineIndex) => {
        if (singleLine && currentIndex !== lineIndex) {
          return;
        }
        const degaussedText = degausser(subtitleLine.text)
        const highlightedIndexStart = currentIndex === lineIndex && getHighlights(degaussedText, highlightedText)
        // console.log('highlightedText', highlightedText)
        const highlightedIndexEnd = highlightedIndexStart === -1 ? -1 : highlightedIndexStart + highlightedText.length
        // console.log('highlightedIndexStart', highlightedIndexStart, highlightedIndexEnd)
        return (
          <div
            style={{
              scrollSnapAlign: 'center',
              transition: '0.125s ease-in',
              opacity: lineIndex === currentIndex ? '1' : '0.9',
            }}
            className="flex items-center"
          >
            {/* <i
              className="fa fa-play text-xs cursor-pointer hover:text-red-500 p-1"
              style={{ fontSize: '0.6em', display: 'block', transition: '0.125s ease-in' }}
              onClick={() => handleItemClick(lineIndex)}
            ></i> */}
            <div className="text-center">
              <b className="ml-1" style={{
                fontWeight: lineIndex === currentIndex ? 'bold' : 'normal',
                transition: '0.125s ease-in'
              }}>{degaussedText.split('').map((char, index) => <span style={{ color: index >= highlightedIndexStart && index < highlightedIndexEnd ? 'orange' : "" }}>{char}</span>)}</b>
              <br />
              {lineIndex === currentIndex && <div>{getPronFunc()(degaussedText)}</div>}
            </div>
          </div>
        )
      })}
    </div>
    // </DraggableResizableComponent>
  )
}

export const ShortsColumns = ({ currentWordOccurances, forceRenderFirstItem, wordsIndex, set_practicingWordIndex }) => {
  return (
    // <motion.div
    //   transition={{ type: "easyIn", damping: 200, stiffness: 400 }}
    //   style={{ x: -(playingWordIndex * 100) + '%', margin: 'auto', display: 'flex', opacity: 0 }}
    //   animate={{ opacity: 1 }}
    // >
    //   {(wordList.length ? wordList : [{ the_word: '____' }, { the_word: '____' }]).map((wordItem, wordIndex) => {
    //     return (
    //       <div style={{ flexShrink: 0 }}>
    <ShortsContainer
      wordsIndex={wordsIndex}
      forceRenderFirstItem={forceRenderFirstItem}
      onSwipeLeft={() => set_practicingWordIndex(wordsIndex + 1)}
      onSwipeRight={() => !!wordsIndex && set_practicingWordIndex(wordsIndex - 1)}
      items={(currentWordOccurances.length ? currentWordOccurances : []).map((occuranceItem, occuranceIndex) => {
        const currentPlayingOccurance = occuranceItem
        if (forceRenderFirstItem) { ++occuranceIndex }
        // console.log('currentPlayingOccurance', currentPlayingOccurance)
        return {
          id: occuranceItem?.id, renderItem: (activeOccuranceIndex) => {
            // const hidden = (playingWordIndex !== wordIndex && playingWordIndex + 1 !== wordIndex && playingWordIndex - 1 !== wordIndex) || (activeOccuranceIndex !== occuranceIndex && activeOccuranceIndex + 1 !== occuranceIndex && activeOccuranceIndex - 1 !== occuranceIndex)
            // const hidden = playingWordIndex !== wordIndex || (activeOccuranceIndex !== occuranceIndex && activeOccuranceIndex + 1 !== occuranceIndex && activeOccuranceIndex - 1 !== occuranceIndex)
            const currentOrFollowingItem = activeOccuranceIndex === occuranceIndex || activeOccuranceIndex + 1 === occuranceIndex
            // if (occuranceIndex === 0) return;
            return currentOrFollowingItem && <ShortVideo
              isActive={activeOccuranceIndex === occuranceIndex}
              mediaTitle={currentPlayingOccurance?.mediaTitle}
              forcedCurrentTimeChange={currentPlayingOccurance?.startTime / 1000}
            />
          }
        }
      })}
    />
  )
}

export const WordsScroll = ({ wordList, onIndexUpdate, forcedIndex, filterBarClick }) => {
  const scrollRef = useRef(null);
  const [currentIndex, set_currentIndex] = useState(0)
  const { list: title } = useParams()

  const handleItemClick = (newIndex) => {
    set_currentIndex(newIndex)
    onIndexUpdate(newIndex)
  }

  const scrollToIndex = (index) => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const items = container.children;
      if (items[index]) {
        const item = items[index];
        const itemWidth = item.offsetWidth;
        const containerWidth = container.offsetWidth;

        // Calculate the scroll position to center the item
        const scrollPosition = item.offsetLeft - (containerWidth / 2) + (itemWidth / 2);

        container.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  };
  useEffect(() => {
    scrollToIndex(currentIndex)
  }, [currentIndex])

  useEffect(() => {
    if (forcedIndex !== undefined && forcedIndex !== currentIndex) {
      set_currentIndex(forcedIndex)
    }
  }, [forcedIndex])

  useEffect(() => {
    set_isRelOpen(false)
  }, [title])

  const [isRelOpen, set_isRelOpen] = useState(false);

  return (
    <>
      <RelatedVideosDropdown
        isOpen={isRelOpen}
        closeDropdown={() => set_isRelOpen(false)}
        videos={[]}
      />
      <div className="scroll-list-container relative text-white z-20 scroll-main-container flex bg-transparent">
        <div ref={scrollRef} className="scroll-list flex w-full overflow-scroll top-0 mr-6">
          {wordList?.map((item, index) => {
            return (
              <div
                className="scroll-list__item px-1 mx-2 py-2 cursor-pointer"
                style={{
                  borderBottom: currentIndex === index && '2px solid orangered',
                  // backgroundColor: currentIndex === index && '#f9e7db5e',
                  color: currentIndex === index && 'orangered',
                  fontWeight: currentIndex === index && 'bolder',
                  transform: currentIndex === index && 'scale(1.2)',
                  height: '50px',
                  marginLeft: !index && 40,
                }}
                onClick={() => handleItemClick(index)}>
                {item.the_word}
              </div>
            )
          })}
          <div
            className="bg-icon scroll-list__item px-3 mx-2 py-2 cursor-pointer"
            style={{
              marginLeft: !wordList.length && 40,
              // borderLeft: wordList.length && '1px solid #333'
            }}
            onClick={() => set_isRelOpen(true)}
          >
            <i className="fa fa-plus"></i>
          </div>
        </div>
        <div
          onClick={filterBarClick}
          className="scroll-list-container__right-bar pt-1 absolute right-0 top-2"
        >
          <BarsSmall />
        </div>
      </div>
    </>
  )
}

const Quiz = () => {
  const navigate = useNavigate()
  const { list: listName, word: paramWord } = useParams();
  const [occuranceIndex, set_occuranceIndex] = useState()
  let [searchParams] = useSearchParams();
  const { wordOccurancesMap, wordList, set_practicingWordIndex, practicingWordIndex: playingWordIndex, currentWordInfo, currentWordOccurances, currentAvailableOccurancesLength, wordInfos } = useWordColletionWordInfos(listName, paramWord, searchParams.get('listType'), searchParams)
  const [loading, setLoading] = useState(false)
  // console.log('wordList', wordList)
  console.log('currentWordOccurances', currentWordOccurances)
  const currentOccurance = currentWordOccurances[occuranceIndex]
  console.log('currentWordOccurance[occuranceIndex]', currentOccurance)
  console.log('occuranceIndex', occuranceIndex)

  useEffect(() => {
    set_isRelOpen(false)
    set_isFilterOpen(false)
  }, [listName])

  const [isRelOpen, set_isRelOpen] = useState(false);
  const [isFilterOpen, set_isFilterOpen] = useState(false);
  const [bookmarkedAll, set_bookmarkedAll] = useState(false);

  const handleBookmark = async () => {
    if (!localStorage.getItem('token')) {
      console.log('fffff')
      return navigate('/auth/login')
    }
    set_bookmarkedAll(true)
    try {
      await api().post("/self_words", wordList.map((item) => {
        return {
          the_word: item.the_word,
          repeatCount: 0,
          repeatTime: Date.now(),
        }
      }))
    } catch (err) {
      console.log('await api().post')
      set_bookmarkedAll(false)
    }
  }
  const handleUnbookmark = async () => {
    if (!localStorage.getItem('token')) {
      return navigate('/auth/login')
    }
    set_bookmarkedAll(false)
    try {
      await api().post("/self_words", wordList.map((item) => {
        return {
          the_word: item.the_word,
          repeatCount: 0,
          archieved: true,
          repeatTime: Date.now(),
        }
      }))
    } catch (err) {
      set_bookmarkedAll(true)
    }
  }

  return (
    <>
      <GoBackButton />
      <FilterDropdown
        isOpen={isFilterOpen}
        closeDropdown={() => set_isFilterOpen(false)}
        options={[
          { label: 'Easiest', value: 'Easiest' },
          { label: 'Hardest', value: 'Hardest' },
          { label: 'Bookmarks', value: 'Bookmarks' },
          { label: 'All New', value: 'All New' }
        ]}
        onChange={(option) => { }}
      />
      <RelatedVideosDropdown
        isOpen={isRelOpen}
        closeDropdown={() => set_isRelOpen(false)}
        videos={[]}
      />

      <div>
        <div style={{ width: '100%', height: '60dvh', background: '#111' }}>
          {currentOccurance?.mediaId && !loading && (
            <>
              {currentOccurance?.youtubeUrl ?
                <YoutubePlayer
                  videoIdOrUrl={currentOccurance?.youtubeUrl}
                  autoplay
                  scale={1}
                  startTime={currentOccurance?.startTime}
                // onTimeUpdate={handleTimeUpdate}
                />
                :
                <VkVideoInit
                  scale={1}
                  isActive
                  iframeSrc={currentOccurance?.vkVideoEmbed}
                  startTime={Math.floor(currentOccurance?.startTime)}
                // onTimeUpdate={handleTimeUpdate}
                />
              }
            </>
          )}
          {/* // <ShortVideo
                      //     scale={1.5}
                      //     // onTimeUpdate={handleTimeUpdate}
                      //     mediaTitle={currentOccurance?.mediaTitle}
                      //     forcedCurrentTimeChange={currentOccurance?.startTime / 1000}
                      //     isActive
                      // /> */}
        </div>

        <WordCollectionCarousel
          items={wordList}
          lastItem={(
            <div
              className="flex flex-col items-center justify-center relative h-full"
              style={{
                margin: '8px',
                border: '2px solid orange',
                borderRadius: '12px'
              }}
            >
              {/* <div
                              className="absolute left-4 top-4 select-none"
                          >
                              {bookmarkedAll ?
                                  <button><i onClick={handleUnbookmark} className="fa-solid fa-bookmark text-red"></i></button>
                                  :
                                  <button><i onClick={handleBookmark} className="fa-regular fa-bookmark text-red"></i></button>
                              }
                              {" "}
                              {listName.replaceAll("_", " ")}
                          </div> */}
              <h2 className="text-2xl font-bold mb-4 text-green-500">{'Keep it up!'}</h2>
              <div className='grid grid-flow-col items-center gap-2'>
                <SecondaryButton
                  button
                  title={"GET MORE"}
                  onClick={() => set_isRelOpen(true)}
                ></SecondaryButton>
              </div>
              {/* Horizontal Carousel (Inner) */}
              {/* <HorizontalScroll
                              items={innerItemsMap[item.the_word]}
                              active={categoryIndex === activeCategory}
                              onIndexUpdate={onInnerIndexUpdate}
                          /> */}
            </div>
          )}
          innerItemsMap={wordOccurancesMap}
          onIndexUpdate={set_practicingWordIndex}
          onInnerIndexUpdate={(newIndex) => {
            const nextTitle = currentWordOccurances[newIndex]
            console.log('nextTitle', nextTitle)
            console.log('currentOccurance?.mediaTitle', currentOccurance?.mediaTitle)
            if (nextTitle?.mediaTitle !== currentOccurance?.mediaTitle) {
              setLoading(true)
            }
            setTimeout(() => {
              set_occuranceIndex(newIndex)
              setLoading(false)
            }, 10)
          }}
        />
      </div>
    </>
  )
}

function useBodyOverflowHidden() {
  useEffect(() => {
    document.body.style.overflow = 'hidden'

    // increment(2)
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])
}

const WORDS_FETCH_FUNCTION_BY_LISTTYPE = {
  'wordCollection': async (listName) => {
    const list = (await api('').get(`/wordCollections?title=${listName}`)).results[0]?.keywords || []
    return { list }
  },
  'video': async (listName) => {
    const list = (await api().get(`/movie_words/${listName}?without_user_words=true`))
    return { list }
  },
  'self_words': async (listName) => {
    const list = (await api().get(`/self_words/${listName}`))
    return { list };
  }
  // 'playlist': requestPlaylistWords,
  // 'userList': requestUserList,
}

export function useWordColletionWordInfos(listName, initialWord, listType = 'wordCollecition' /* video | series */, youtube) {
  const [wordList, set_wordList] = useState([])
  const [wordInfos, set_wordInfos] = useState({})
  const [practicingWordIndex, set_practicingWordIndex] = useState(0)
  const [wordOccurancesMap, set_wordOccurancesMap] = useState({})
  const [query, set_query] = useState('') // other | beginner | c1

  const getWordInfos = async () => {
    // const wordList = await requestWordCollectionWords(listName)
    const getWordsList = WORDS_FETCH_FUNCTION_BY_LISTTYPE[listType] || WORDS_FETCH_FUNCTION_BY_LISTTYPE['wordCollection']
    try {
      const { list: wordList, subtitle } = await getWordsList(listName, query)
      const { new_wordInfosMap, new_wordOccurancesMap } = await requestWordInfosAndOccurancesMap(wordList, wordInfos, wordOccurancesMap, practicingWordIndex)

      Object.keys(new_wordOccurancesMap).forEach((key) => {
        const item = new_wordOccurancesMap[key]
        console.log('item', item)
        // if (item.length < 5 && !y_wordOccurancesMap[key]) {
        //   const newOne = y_wordOccurancesMap[key] = searchFilmotSubtitles({ query: '"key"' })
        //   set_y_wordOccurancesMap({ ...y_wordOccurancesMap, ...newOne })
        // }
      })
      set_wordList(wordList)
      set_wordOccurancesMap(new_wordOccurancesMap)
      set_wordInfos(new_wordInfosMap)
    } catch (err) {

    }
  }

  useEffect(() => {
    if (listName) {
      getWordInfos()
    }
  }, [listName, practicingWordIndex])

  useEffect(() => {
    if (initialWord) {
      const new_practicingWordIndex = wordList?.reduce((previousIndex, item, currentIndex) => item.the_word === initialWord ? currentIndex : previousIndex, 0)
      set_practicingWordIndex(new_practicingWordIndex)
    }
  }, [initialWord, wordList])
  const currentWord = (typeof wordList[practicingWordIndex] === 'string' ? wordList[practicingWordIndex] : wordList[practicingWordIndex]?.the_word) || initialWord
  const currentWordInfo = wordInfos[currentWord]
  const currentWordOccurances = wordOccurancesMap[currentWord]?.concat(currentWordInfo?.youglishSrcs) || []
  const currentAvailableOccurancesLength = currentWordOccurances?.length
  // console.log('currentWordInfo', currentWordInfo)

  return {
    set_query,
    wordInfos,
    wordList,
    practicingWordIndex,
    set_practicingWordIndex,
    currentWordInfo,
    currentWord,
    currentWordOccurances,
    currentAvailableOccurancesLength,
    wordOccurancesMap
  }
}

async function requestWordInfosAndOccurancesMap(list, previousInfoMap, previousOccurancesMap, activeIndex) {
  const new_wordInfosMap = previousInfoMap || {}
  const new_wordOccurancesMap = previousOccurancesMap || {}
  await Promise.all(list.map(async (keyword, index) => {
    if (Math.abs(index - activeIndex) < 3) {
      const the_word = typeof keyword === 'string' ? keyword : keyword?.the_word
      const response = await api().get(`/wordInfos?the_word=${the_word}`);

      if (!new_wordInfosMap[the_word]) {
        new_wordInfosMap[the_word] = response?.data?.results[0]
      }

      const newOccurances = await request_wordOccurances(the_word)

      if (newOccurances?.length) {
        new_wordOccurancesMap[the_word] = newOccurances;
      }
    }
  }))

  return { new_wordInfosMap, new_wordOccurancesMap }
}

async function request_wordOccurances(the_word) {
  try {
    const wordData = (await api().get(`/occurances_v2?lemma=${the_word}&limit=10`));
    // console.log("wordData", wordData);
    if (wordData?.length) {
      return wordData
    }
  } catch (err) {
    console.log("err", err);
  }
};

export default Quiz;
