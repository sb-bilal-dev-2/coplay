import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { motion } from 'framer-motion';
import api from "../api";
import "./Quiz.css";
import { BASE_SERVER_URL } from "../api";
import classNames from "classnames";
import { Link, useNavigate } from "react-router-dom";
import { usePost } from './usePost';
import { sortByLearningState } from "../helper/sortByLearningState";
import YoutubePlayer from "../components/YoutubePlayer";
import ErrorBoundary from "./ErrorBoundary";
import VideojsInited from "../components/VideojsInited";
import useCustomScroll from "../components/useCustomScroll";

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
    className="absolute z-10 top-4 left-4 text-yellowishorange cursor-pointer"
  >
    <i className="fa fa-arrow-left" aria-hidden="true"></i>
  </button>
  )
}

const ShortsContainer = ({ items, forceRenderFirstItem, wordsIndex }) => {
  const { translate, containerRef, currentIndex, scrollTo } = useCustomScroll()

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

const extractYoutubeId = title => {
  if (title = title.split('YOUTUBE_ID[')[1]) {
    return 'https://www.youtube.com/watch?v=' + title.split(']')[0];
  }
  return ''
}

export const ShortVideo = ({ isActive, mediaTitle, startTime, onTimeUpdate }) => {
  const isYoutubeVideo = mediaTitle && mediaTitle?.includes('YOUTUBE_ID[')
  let mediaSrc = ''

  if (isYoutubeVideo) {
    mediaSrc = extractYoutubeId(mediaTitle)
  } else {
    mediaSrc = `${BASE_SERVER_URL}/movie?name=${mediaTitle}`
  }
  return (
    isYoutubeVideo ?
      <YoutubePlayer
        isActive={isActive}
        videoIdOrUrl={mediaSrc}
        startTime={startTime}
        onTimeUpdate={onTimeUpdate}
      />
      :
      <VideojsInited
        onTimeUpdate={onTimeUpdate}
        isActive={isActive}
        videoSrc={mediaSrc}
        startTime={startTime}
      />
  )
}

export const ShortsColumns = ({ currentWordOccurances, forceRenderFirstItem, wordsIndex }) => {
  return (
    // <motion.div
    //   transition={{ type: "easyIn", damping: 200, stiffness: 400 }}
    //   style={{ x: -(playingWordIndex * 100) + '%', margin: 'auto', display: 'flex', opacity: 0 }}
    //   animate={{ opacity: 1 }}
    // >
    //   {(wordList.length ? wordList : [{ the_word: '____' }, { the_word: '____' }]).map((wordItem, wordIndex) => {
    //     return (
    //       <div style={{ flexShrink: 0 }}>
    <ShortsContainer wordsIndex={wordsIndex} forceRenderFirstItem={forceRenderFirstItem} items={(currentWordOccurances.length ? currentWordOccurances : [{ mediaSrc: '' }]).map((occuranceItem, occuranceIndex) => {
      const currentPlayingOccurance = occuranceItem
      if (forceRenderFirstItem) { ++occuranceIndex }

      return {
        id: occuranceItem?.id, renderItem: (activeOccuranceIndex) => {
          // const hidden = (playingWordIndex !== wordIndex && playingWordIndex + 1 !== wordIndex && playingWordIndex - 1 !== wordIndex) || (activeOccuranceIndex !== occuranceIndex && activeOccuranceIndex + 1 !== occuranceIndex && activeOccuranceIndex - 1 !== occuranceIndex)
          // const hidden = playingWordIndex !== wordIndex || (activeOccuranceIndex !== occuranceIndex && activeOccuranceIndex + 1 !== occuranceIndex && activeOccuranceIndex - 1 !== occuranceIndex)
          const hidden = activeOccuranceIndex !== occuranceIndex && activeOccuranceIndex + 1 !== occuranceIndex && activeOccuranceIndex - 1 !== occuranceIndex
          // if (occuranceIndex === 0) return;
          return !hidden && <ShortVideo
            isActive={activeOccuranceIndex === occuranceIndex}
            mediaTitle={currentPlayingOccurance?.mediaTitle}
            startTime={currentPlayingOccurance?.startTime / 1000}
          />
        }
      }
    })}
    />
  )
}

export const WordsScroll = ({ wordList, set_practicingWordIndex, forcedIndex }) => {
  const { translate, containerRef: wordsContainer, currentIndex: playingWordIndex, scrollToNext: scrollToNextWord, scrollToPrevious: scrollToPrevWord, scrollTo } = useCustomScroll({ isHorizontal: true, pixelMoveOnDelta: 20, deltaThreshold: 30 })

  useEffect(() => {
    if (forcedIndex !== playingWordIndex) {
      set_practicingWordIndex(playingWordIndex)
    }
  }, [playingWordIndex])
  useEffect(() => {
    if (forcedIndex !== undefined && forcedIndex !== playingWordIndex) {
      scrollTo(forcedIndex)
    }
  }, [forcedIndex])
  return (
    <div style={{ position: 'absolute', overflow: 'hidden', top: '84px', color: 'white', zIndex: '10' }}>
      <motion.div
        ref={wordsContainer}
        style={{ display: 'flex', padding: '0 60px', paddingRight: 240 }}
        transition={{ type: "just", damping: 200, stiffness: 400 }}
        animate={{ x: translate + 60 }}
      >
        {(wordList.length ? wordList : [{ the_word: '____' }, { the_word: '____' }]).map((item, wordIndex) => (
          <div
            // animate={{ }}
            onClick={() => { scrollTo(wordIndex) }}
            style={{ cursor: 'pointer', position: 'relative', padding: '5px 10px', borderBottom: wordIndex !== playingWordIndex ? '1px solid gray' : '' }}>
            {item.the_word}
            <motion.div
              animate={{ height: '100%', width: wordIndex === playingWordIndex ? '100%' : '0%', backgroundColor: wordIndex === playingWordIndex ? '#f9e7db5e' : 'transparent' }}
              style={{
                position: 'absolute', bottom: 0, left: 0, borderBottom: '1px solid orangered', margin: 'auto'
              }}
            ></motion.div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

const Quiz = () => {
  const { } = useTelegramWebApp()
  const { list: listName, word: paramWord } = useParams();
  const { wordList, set_practicingWordIndex, practicingWordIndex: playingWordIndex, currentWordInfo, currentWordOccurances, currentAvailableOccurancesLength, wordInfos } = useWordColletionWordInfos(listName, paramWord)
  // console.log('wordList', wordList, currentWordOccurances)

  return (
    <ErrorBoundary>
      <GoBackButton />
      <div className="MainContainer">
        <WordsScroll wordList={wordList} set_practicingWordIndex={set_practicingWordIndex} />
        <ShortsColumns wordList={wordList} currentWordOccurances={currentWordOccurances} wordsIndex={playingWordIndex} />
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
  'wordCollection': async (listName) => (await api('').get(`/wordCollections?title=${listName}`)).data.results[0]?.keywords || [],
  'video': async (listName) => (await api().get(`/movie_words/${listName}?without_user_words=true`)).data,
  // 'playlist': requestPlaylistWords,
  // 'userList': requestUserList,
}

export function useWordColletionWordInfos(listName, initialWord, listType = 'wordCollecition' /* video | series */) {
  const [wordList, set_wordList] = useState([])
  const [wordInfos, set_wordInfos] = useState({})
  const [practicingWordIndex, set_practicingWordIndex] = useState(0)
  const [wordOccurancesMap, set_wordOccurancesMap] = useState({})
  console.log('wordInfos', wordInfos)

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
  console.log('currentWordInfo', currentWordInfo)
  return { wordInfos, wordList, practicingWordIndex, set_practicingWordIndex, currentWordInfo, currentWord, currentWordOccurances, currentAvailableOccurancesLength }
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
      console.log('newOccurances', newOccurances)
      if (newOccurances?.length) {
        new_wordOccurancesMap[the_word] = newOccurances;
      }
    }
  }))

  return { new_wordInfosMap, new_wordOccurancesMap }
}

async function request_wordOccurances(the_word) {
  try {
    const wordData = (await api().get(`/occurances_v2?lemma=${the_word}&limit=10`)).data;
    // console.log("wordData", wordData);
    if (wordData?.length) {
      return wordData
    }
  } catch (err) {
    console.log("err", err);
  }
};

export default Quiz;
