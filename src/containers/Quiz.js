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

export const WordCarousel = ({ list, activeIndex, currentWordInfo, onLeftClick, onRightClick }) => {
  const [isShowingDefinitions, set_isShowingDefinitions] = useState();
  return (
    <div className="overflow relative py-2">
      <div
        className="transition-transform duration-300 ease-in-out flex"
        style={{ transform: `translateX(calc(-${activeIndex * 80}% + 10%))` }}
      >
        {list?.map((keyword, index) => {
          return (
            <div
              key={keyword?.the_word}
              style={{ minHeight: '130px', flexShrink: 0, width: '80%', transform: `${activeIndex === index ? 'scale(1.15)' : ''}` }}
              className="headline-1 cursor-pointer p-4 paper text-yellowishorange flex flex-col justify-around items-center"
              onClick={() => set_isShowingDefinitions(!isShowingDefinitions)}
            >
              {!isShowingDefinitions ?
                <>
                  <h1>
                    {keyword?.the_word || typeof keyword === 'string' && keyword}
                  </h1>
                  <code className="block text-center" >{currentWordInfo?.pronounciation || keyword?.romanized}</code>
                </>
                :
                <>
                  {/* <h4>
                    {keyword?.meaning}
                  </h4> */}
                  <h4>
                    {currentWordInfo?.shortDefinition || keyword?.meaning}
                  </h4>
                </>
              }
            </div>
          )
        })
        }
      </div>
      {!!list?.length && activeIndex > 0 &&
        <i
          onClick={onLeftClick}
          className="fa-solid fa-chevron-left absolute p-2 py-11 left-0 top-1/2 transform -translate-y-1/2 text-gray" j
        />
      }
      {!!list?.length && activeIndex < list.length - 1 &&
        <i
          onClick={onRightClick}
          className="fa-solid fa-chevron-right absolute p-2 py-11 right-0 top-1/2 transform -translate-y-1/2 text-gray"
        />
      }
    </div>
  )
}

export const OccuranceButtons = ({ playingOccuranceIndex, currentAvailableOccurancesLength, set_playingOccuranceIndex }) => {
  const prevOccButtonDisabled = !currentAvailableOccurancesLength || playingOccuranceIndex <= 0;
  const nextOccButtonDisabled = !currentAvailableOccurancesLength || playingOccuranceIndex >= currentAvailableOccurancesLength - 1;


  return (
    <div className="py-12">
      <h4>
        <i
          className={`fa-solid fa-backward-step p-2 ${!!prevOccButtonDisabled ? 'opacity-50' : 'cursor-pointer'}`}
          onClick={() => !prevOccButtonDisabled && set_playingOccuranceIndex(playingOccuranceIndex - 1)}>
        </i>
        <span className="select-none">
          {playingOccuranceIndex + 1}/{currentAvailableOccurancesLength}

        </span>
        <i
          className={`fa-solid fa-forward-step p-2 ${!!nextOccButtonDisabled ? 'opacity-50' : 'cursor-pointer'}`}
          onClick={() => !nextOccButtonDisabled && set_playingOccuranceIndex(playingOccuranceIndex + 1)}>
        </i>
        <span>
          {/* <br /> */}
        </span>
      </h4>
    </div>

  )
}

const ShortsContainer = ({ items }) => {
  const { translate, containerRef, currentIndex, scrollToNext, scrollToPrevious } = useCustomScroll()

  useBodyOverflowHidden()

  return (
    <div style={{ maxHeight: '100vh', overflow: 'hidden' }}>
      {/* <button onClick={scrollToPrevious} disabled={currentIndex === 0}>Previous</button>
      <button onClick={scrollToNext} disabled={currentIndex === items.length - 1}>Next</button> */}
      <motion.div
        ref={containerRef}
        style={{
          height: '100%',
          overflow: 'hidden'
        }}
        transition={{ type: "just", damping: 200, stiffness: 400 }}
        animate={{ y: translate }}
      >
        {items.map((item) => {
          return (
            <div className="VideoContainer" key={item.id}>
              {item.renderItem(currentIndex)}
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}

const Quiz = () => {
  const { } = useTelegramWebApp()
  const { list: listName, word: paramWord } = useParams();
  const { wordList, set_practicingWordIndex, currentWordInfo, currentWordOccurances, currentAvailableOccurancesLength, wordInfos } = useWordColletionWordInfos(listName, paramWord)
  // console.log('wordList', wordList, currentWordOccurances)
  const { translate, containerRef: wordsContainer, currentIndex: playingWordIndex, scrollToNext: scrollToNextWord, scrollToPrevious: scrollToPrevWord, setCurrentIndex } = useCustomScroll({ isHorizontal: true, pixelMoveOnDelta: 20, deltaThreshold: 30 })

  useEffect(() => set_practicingWordIndex(playingWordIndex), [playingWordIndex])

  return (
    <ErrorBoundary>
      <GoBackButton />
      <div className="MainContainer">
        <div style={{ position: 'absolute', overflow: 'hidden', top: '84px', color: 'white', zIndex: '10' }}>
          <motion.div
            ref={wordsContainer}
            style={{ display: 'flex', padding: '0 60px', paddingRight: 240 }}
            transition={{ type: "just", damping: 200, stiffness: 400 }}
            animate={{ x: translate + 30 }}
          >
            {(wordList.length ? wordList : [{ the_word: '____' }, { the_word: '____' }]).map((item, wordIndex) => (
              <div
                // animate={{ }}
                onClick={() => { setCurrentIndex(wordIndex) }}
                style={{ cursor: 'pointer', position: 'relative', padding: '5px 10px' }}>
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
        <div style={{ overflow: 'hidden' }}>
          <motion.div
            transition={{ type: "easyIn", damping: 200, stiffness: 400 }}
            style={{ x: -(playingWordIndex * 100) + '%', margin: 'auto', display: 'flex', opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {(wordList.length ? wordList : [{ the_word: '____' }, { the_word: '____' }]).map((wordItem, wordIndex) => {
              return (
                <div style={{ flexShrink: 0 }}>
                  <ShortsContainer items={(currentWordOccurances.length ? currentWordOccurances : [{ mediaSrc: '' }]).map((occuranceItem, occuranceIndex) => {
                    const currentPlayingOccurance = occuranceItem
                    const currentOccuranceTypeIsYoutube = currentPlayingOccurance?.mediaSrc?.includes('youtube.com')

                    return {
                      id: occuranceItem.id, renderItem: (activeOccuranceIndex) => {
                        // const hidden = (playingWordIndex !== wordIndex && playingWordIndex + 1 !== wordIndex && playingWordIndex - 1 !== wordIndex) || (activeOccuranceIndex !== occuranceIndex && activeOccuranceIndex + 1 !== occuranceIndex && activeOccuranceIndex - 1 !== occuranceIndex)
                        const hidden = playingWordIndex !== wordIndex || (activeOccuranceIndex !== occuranceIndex && activeOccuranceIndex + 1 !== occuranceIndex && activeOccuranceIndex - 1 !== occuranceIndex)

                        return (
                          !hidden &&
                          (
                            currentOccuranceTypeIsYoutube ?
                              <YoutubePlayer videoIdOrUrl={currentPlayingOccurance?.mediaSrc} />
                              :
                              <VideojsInited
                                isActive={activeOccuranceIndex === occuranceIndex}
                                videoSrc={`${BASE_SERVER_URL}/movie?name=${currentPlayingOccurance?.mediaTitle}`}
                                startTime={currentPlayingOccurance?.startTime / 1000}
                              />
                          )
                        )
                      }
                    }
                  })}
                  />
                </div>

              )
            })}
          </motion.div>
        </div>
      </div>
      {/* <div className="page-container bg-video text-gray-100 relative min-h-screen">
        <GoBackButton />
        <div className="VideoContainer">
          {
            !!currentAvailableOccurancesLength && (
              currentOccuranceTypeIsYoutube ?
                <YoutubePlayer videoIdOrUrl={currentPlayingOccurance?.mediaSrc} />
                :
                <VideojsInited
                  // autoPlay={playingOccuranceIndex !== 0}
                  videoSrc={`${BASE_SERVER_URL}/movie?name=${currentPlayingOccurance?.mediaTitle}`}
                  startTime={currentPlayingOccurance?.startTime / 1000}
                />
            )
          }
        </div>
        <WordCarousel
          list={wordList}
          activeIndex={practicingWordIndex}
          currentWordInfo={currentWordInfo}
          onLeftClick={() => (set_playingOccuranceIndex(0), set_practicingWordIndex(practicingWordIndex - 1))}
          onRightClick={() => (set_playingOccuranceIndex(0), set_practicingWordIndex(practicingWordIndex + 1))}
        />
        <OccuranceButtons
          playingOccuranceIndex={playingOccuranceIndex}
          currentAvailableOccurancesLength={currentAvailableOccurancesLength}
          set_playingOccuranceIndex={set_playingOccuranceIndex}
        />
      </div> */}
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
