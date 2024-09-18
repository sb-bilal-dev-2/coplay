import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
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
import ShortsList from "../components/useCustomScroll";

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
    className="absolute z-10 top-4 left-4 text-white cursor-pointer"
  >
    <i className="fa fa-arrow-left" aria-hidden="true"></i>
  </button>
  )
}

export const WordCarousel = ({list, activeIndex, currentWordInfo, onLeftClick, onRightClick}) => {
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

const Quiz = () => {
  useBodyOverflowHidden()

  return <ShortsList items={MOCK_SHORTS_ITEMS()} />
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

const Quiz_STASH = () => {
  const { } = useTelegramWebApp()
  const { list: listName, word: paramWord } = useParams();
  const [playingOccuranceIndex, set_playingOccuranceIndex] = useState(0);
  const { wordList, practicingWordIndex, set_practicingWordIndex, currentWordInfo, currentWordOccurances, currentAvailableOccurancesLength } = useWordColletionWordInfos(listName, paramWord)
  const currentPlayingOccurance = currentWordOccurances[playingOccuranceIndex]
  const currentOccuranceTypeIsYoutube = currentPlayingOccurance?.mediaSrc?.includes('youtube.com')
  useBodyOverflowHidden()
  
  // const { containerRef, currentIndex, scrollToNext, scrollToPrevious } = useCustomScroll()

  return (
    <ErrorBoundary>
      <div className="page-container bg-video text-gray-100 relative min-h-screen">
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
      </div>
    </ErrorBoundary>
  );
};

const WORDS_FETCH_FUNCTION_BY_LISTTYPE = {
  'wordCollection': async (listName) => (await api('').get(`/wordCollections?title=${listName}`)).data.results[0]?.keywords || [],
  'video': async (listName) => (await api().get(`/movie_words/${listName}?without_user_words=true`)).data,
  // 'playlist': requestPlaylistWords,
  // 'userList': requestUserList,
}

export function useWordColletionWordInfos(listName, initialWord, listType = 'wordCollecition' /* video | series */ ) {
  const [wordList, set_wordList] = useState([])
  const [wordInfos, set_wordInfos] = useState({})
  const [practicingWordIndex, set_practicingWordIndex] = useState(0)
  const [wordOccurancesMap, set_wordOccurancesMap] = useState({})
  console.log('wordInfos', wordInfos)

  const getWordInfos = async () => {
    // const wordList = await requestWordCollectionWords(listName)
    const getWordsList = WORDS_FETCH_FUNCTION_BY_LISTTYPE[listType] || WORDS_FETCH_FUNCTION_BY_LISTTYPE['wordCollection']
    const wordList = await getWordsList(listName)
    const { new_wordInfosMap, new_wordOccurancesMap } = await requestWordInfosAndOccurancesMap(wordList, wordInfos, wordOccurancesMap, practicingWordIndex)
    set_wordList(wordList)
    set_wordOccurancesMap(new_wordOccurancesMap)
    set_wordInfos(new_wordInfosMap)
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

function MOCK_SHORTS_ITEMS() {
  return [
    {
      id: 1,
      title: "Amazing Sunset",
      description: "Breathtaking view of the sun setting over the ocean.",
      type: "image",
      content: "/api/placeholder/800/600",
      likes: 1500,
      comments: 230
    },
    {
      id: 2,
      title: "Quick Healthy Breakfast",
      description: "How to make a nutritious breakfast in under 5 minutes.",
      type: "video",
      content: "/api/placeholder/800/600",
      duration: "00:59",
      views: 50000,
      likes: 3200
    },
    {
      id: 3,
      title: "Funny Cat Moment",
      description: "Watch this cat's hilarious reaction to a cucumber!",
      type: "gif",
      content: "/api/placeholder/800/600",
      likes: 10000,
      shares: 5000
    },
    {
      id: 4,
      title: "Daily Motivation",
      description: "Start your day with this inspiring quote.",
      type: "text",
      content: "The only way to do great work is to love what you do. - Steve Jobs",
      backgroundColor: "#FFD700",
      fontColor: "#000000",
      likes: 2000
    },
    {
      id: 5,
      title: "Quick Workout Routine",
      description: "5-minute HIIT workout you can do anywhere.",
      type: "video",
      content: "/api/placeholder/800/600",
      duration: "05:00",
      views: 75000,
      likes: 4800
    },
    {
      id: 6,
      title: "Beautiful Nature Scene",
      description: "Serene forest landscape with a gentle stream.",
      type: "image",
      content: "/api/placeholder/800/600",
      likes: 3500,
      comments: 420
    },
    {
      id: 7,
      title: "Tech Tip of the Day",
      description: "Learn this keyboard shortcut to boost your productivity!",
      type: "text",
      content: "Press Ctrl + Shift + T to reopen closed tabs in most browsers.",
      backgroundColor: "#4682B4",
      fontColor: "#FFFFFF",
      likes: 1200
    },
    {
      id: 8,
      title: "Cute Puppy Playtime",
      description: "Watch these adorable puppies play in the park.",
      type: "video",
      content: "/api/placeholder/800/600",
      duration: "01:30",
      views: 100000,
      likes: 8500
    }
  ];
}

export default Quiz;
