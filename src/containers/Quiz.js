import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { motion } from 'framer-motion';
import api from "../api";
import "./Quiz.css";
import { BASE_SERVER_URL } from "../api";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import YoutubePlayer from "../components/YoutubePlayer";
import ErrorBoundary from "./ErrorBoundary";
import useCustomScroll from "../components/useCustomScroll";
import BarsSmall from "../components/BarsSmall";
import DraggableResizableComponent from "../components/DraggableResizableComponent";
import { degausser } from "../utils/degausser";
import { ShortVideo } from "./ShortVideo";
import RelatedVideosDropdown, { FilterDropdown } from "./RelatedVideosDropdown";


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

const ScrollingSubtitles = ({ subtitles, setCurrentTime, currentIndex }) => {
  const scrollRef = useRef(null);

  const handleItemClick = (newIndex) => {
    console.log('newIndex', newIndex)
    if (setCurrentTime) {
      const newItem = subtitles[newIndex]
      if (newItem?.startTime) {
        setCurrentTime(newItem?.startTime)
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


  return (
    // <DraggableResizableComponent>
    <div
      ref={scrollRef}
      className="scrollsub-container absolute bottom-10 px-4 left-5 z-20 overflow-scroll"
    >
      {subtitles?.map((subtitleLine, lineIndex) => {
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
            <b className="ml-1" style={{
              fontWeight: lineIndex === currentIndex ? 'bold' : 'normal',
              transition: '0.125s ease-in'
            }}>{degausser(subtitleLine.text)}</b>
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
  const { } = useTelegramWebApp()
  const { list: listName, word: paramWord } = useParams();
  let [searchParams] = useSearchParams();
  const { wordList, set_practicingWordIndex, practicingWordIndex: playingWordIndex, currentWordInfo, currentWordOccurances, currentAvailableOccurancesLength, wordInfos } = useWordColletionWordInfos(listName, paramWord, searchParams.get('listType'), searchParams)
  // console.log('wordList', wordList, currentWordOccurances)
  // const [subtitles] = useSubtitles('kung_fu_panda_3')
  useEffect(() => {
    // set_isRelOpen(false)
    set_isFilterOpen(false)
  }, [listName])

  // const [isRelOpen, set_isRelOpen] = useState(false);
  const [isFilterOpen, set_isFilterOpen] = useState(false);

  return (
    <ErrorBoundary>
      <GoBackButton />
      <FilterDropdown
        isOpen={isFilterOpen}
        closeDropdown={() => set_isFilterOpen(false)}
        options={[
          { label: 'New Bookmarks', value: 'new_words' },
          { label: 'Old Bookmarks', value: 'old_words' },
          { label: 'Learned', value: 'all_words' }
        ]}
        onChange={(option) => {}}
      />
      <div className="MainContainer" style={{ background: '#000', minHeight: '100vh' }}>
        <div className="absolute z-20 w-full bg-red" style={{ top: '0' }}>
          <WordsScroll wordList={wordList} onIndexUpdate={set_practicingWordIndex} forcedIndex={playingWordIndex} filterBarClick={() => set_isFilterOpen(true)} />
        </div>
        <ShortsColumns
          wordList={wordList}
          currentWordOccurances={currentWordOccurances}
          wordsIndex={playingWordIndex}
          set_practicingWordIndex={set_practicingWordIndex}
        />
        {/* <ScrollingSubtitles subtitles={subtitles} /> */}
      </div>
    </ErrorBoundary>
  );
};

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
  'wordCollection': async (listName) => (await api('').get(`/wordCollections?title=${listName}`)).results[0]?.keywords || [],
  'video': async (listName) => (await api().get(`/movie_words/${listName}?without_user_words=true`)),
  'self_words': async (listName) => {
    const wordList = (await api().get(`/self_words/${listName}`))

    return wordList;
  }
  // 'playlist': requestPlaylistWords,
  // 'userList': requestUserList,
}

export function useWordColletionWordInfos(listName, initialWord, listType = 'wordCollecition' /* video | series */) {
  const [wordList, set_wordList] = useState([])
  const [wordInfos, set_wordInfos] = useState({})
  const [practicingWordIndex, set_practicingWordIndex] = useState(0)
  const [wordOccurancesMap, set_wordOccurancesMap] = useState({})

  const getWordInfos = async () => {
    // const wordList = await requestWordCollectionWords(listName)
    const getWordsList = WORDS_FETCH_FUNCTION_BY_LISTTYPE[listType] || WORDS_FETCH_FUNCTION_BY_LISTTYPE['wordCollection']
    try {
      const wordList = await getWordsList(listName)
      const { new_wordInfosMap, new_wordOccurancesMap } = await requestWordInfosAndOccurancesMap(wordList, wordInfos, wordOccurancesMap, practicingWordIndex)
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
  console.log('wordList', wordList)

  return { wordInfos, wordList, practicingWordIndex, set_practicingWordIndex, currentWordInfo, currentWord, currentWordOccurances, currentAvailableOccurancesLength, wordOccurancesMap }
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
