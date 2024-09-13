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
import videojs from 'video.js';
import ErrorBoundary from "./ErrorBoundary";
import { usePrevious } from "@uidotdev/usehooks";

const PLAYING_OCCURANCE_LIMIT = 5;

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

const QuizVideoPlayer = ({ videoSrc, startTime, autoPlay }) => {
  const videoRef = useRef();
  const [error, set_error] = useState(null)
  const playerRef = useRef(null)
  const [isLoadedMetadata, set_isLoadedMetadata] = useState(false)

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    set_error(null)
    set_isLoadedMetadata(false)

    if (!playerRef.current) {
      playerRef.current = videojs(videoElement, {
        controls: true,
        autoplay: true,
        preload: 'auto',
        fluid: true,
        sources: [{
          src: videSrc,
          type: 'video/mp4'
        }],
        html5: {
          nativeControlsForTouch: false,
        },
        playsinline: true,
      });
      playerRef.current.on('aderror', () => {
        console.log('perror a', playerRef.current.error()); //Gives MEDIA_ERR_SRC_NOT_SUPPORTED error
      })
      playerRef.current.on('error', () => {
        console.log('perror', playerRef.current.error()); //Gives MEDIA_ERR_SRC_NOT_SUPPORTED error
      })

    } else {
      console.log('set src')
      playerRef.current.src('https://coplay.live/api/movieFiles/frozen.480.mp4')
      playerRef.current.currentTime(startTime)
      // playerRef.current.on('loadedmetadata', function() {
      //   console.log('load medatada finish')
      //   playerRef.current.currentTime(startTime);
      // });
    }

    // return () => {
    //   if (playerRef.current) {
    //     console.log('disposed')
    //     playerRef.current.dispose();
    //     playerRef.current = null;
    //   }
    // };
  }, [videoSrc]);

  async function playVideo() {
    if (!error) {
      console.log('play next')
      try {
        await playerRef.current.currentTime(startTime)
        await playerRef.current.play()
      } catch (error) {
        console.log('PLAY ERROR', error)
      }
    }
  }

  useEffect(() => {
    if (isLoadedMetadata) {
      playVideo()
    }
  }, [startTime, isLoadedMetadata])

  return (
    <div className="VideoContainer">
      <div data-vjs-player>
        {!error &&
          <video
            ref={videoRef}
            className="video-js vjs-default-skin w-full"
            onErrorCapture={(error) => console.error('NEW ERROR', error)}
            onLoadedMetadata={() => {
              set_isLoadedMetadata(true)
              try {
                console.log("occurances[playingOccuranceIndex].startTime", startTime);
                videoRef.current.currentTime = startTime;
              } catch (error) {
                console.error('onLoadedMetadata error: ', error)
              }
            }}
          />
        }
      </div>
    </div>
  )
}

const Quiz = () => {
  const { } = useTelegramWebApp()
  const { list, word: paramWord } = useParams();
  const [isShowingDefinitions, set_isShowingDefinitions] = useState();
  const [playingOccuranceIndex, set_playingOccuranceIndex] = useState(0);
  const { currentWord, wordInfos, wordCollection, practicingWordIndex, set_practicingWordIndex, currentWordInfo, currentWordOccurances, currentAvailableOccurancesLength } = useWordColletionWordInfos(list, paramWord)
  // console.log('FOO', FOO)
  // const { wordInfos, wordCollection, practicingWordIndex, set_practicingWordIndex, currentWordInfo } = FOO
  const navigate = useNavigate()

  // const [postUserWords] = usePost()
  // const updateRepeatCount = async (pWord) => {
  //   const usersPracticingWord = pWord || practicingWordInfos[practicingWordIndex]
  //   if (!usersPracticingWord?.repeatCount) {
  //     usersPracticingWord.repeatCount = 0
  //   }
  //   usersPracticingWord.repeatCount += 1;
  //   usersPracticingWord.repeatTime = Date.now();
  //   postUserWords('/self_words', [usersPracticingWord])
  // }
  // console.log('currentWord', currentWord)
  // console.log('currentWordInfo', currentWordInfo)
  // console.log('practicingWordIndex', practicingWordIndex)
  // console.log('wordCollection', wordCollection)
  // console.log('currentWordOccurances', currentWordOccurances)
  const currentOccuranceTypeIsYoutube = currentWordOccurances[playingOccuranceIndex]?.mediaSrc?.includes('youtube.com')
  const prevOccButtonDisabled = !currentAvailableOccurancesLength || playingOccuranceIndex <= 0;
  const nextOccButtonDisabled = !currentAvailableOccurancesLength || playingOccuranceIndex >= currentAvailableOccurancesLength - 1;
  return (
    <ErrorBoundary>
      {/* <WebcamCapture /> */}
      <div className="QuizMain flex-grow bg-video text-gray text-gray-100 relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute z-10 top-4 left-4 text-white cursor-pointer"
        >
          <i className="fa fa-arrow-left" aria-hidden="true"></i>
        </button>
        {
          !!currentAvailableOccurancesLength && (
            currentOccuranceTypeIsYoutube ?
              <YoutubePlayer videoIdOrUrl={currentWordOccurances[playingOccuranceIndex]?.mediaSrc} />
              :
              <QuizVideoPlayer
                // autoPlay={playingOccuranceIndex !== 0}
                videoSrc={`${BASE_SERVER_URL}/movie?name=${currentWordOccurances[playingOccuranceIndex]?.mediaTitle}`}
                startTime={currentWordOccurances[playingOccuranceIndex]?.startTime / 1000}
              />
          )
        }
        <div className="Subtitles text-center text-white px-8 text-lg">
          {/* <b>
            {currentWord}
          </b> */}
        </div>
        <div className="mb-4">
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
          </h4> : ''
        </div>
        <div className="overflow relative">
          <div
            className="transition-transform duration-300 ease-in-out flex"
            style={{ transform: `translateX(calc(-${practicingWordIndex * 80}% + 10%))` }}
          >
            {
              wordCollection?.keywords.map((keyword, crrIndex) => {
                return (
                  <div
                    style={{ minHeight: '130px', flexShrink: 0, width: '80%', transform: `${practicingWordIndex === crrIndex ? 'scale(1.15)' : ''}` }}
                    className="headline-1 cursor-pointer p-4 paper text-yellowishorange flex flex-col justify-around items-center"
                    onClick={() => set_isShowingDefinitions(!isShowingDefinitions)}
                  >
                    {!isShowingDefinitions ?
                      <>
                        <h1>
                          {keyword?.the_word}
                        </h1>
                        <code className="block text-center" >{keyword?.romanized}</code>
                      </>
                      :
                      <>
                        <h4>
                          {keyword?.meaning || currentWordInfo?.shortDefinition}
                        </h4>
                      </>
                    }
                  </div>
                )
              })
            }
          </div>
          {wordCollection && practicingWordIndex > 0 &&
            <i onClick={() => (set_playingOccuranceIndex(0), set_practicingWordIndex(practicingWordIndex - 1))} className="fa-solid fa-chevron-left absolute p-2 py-11 left-0 top-1/2 transform -translate-y-1/2 text-gray"></i>
          }
          {wordCollection && practicingWordIndex < wordCollection.keywords.length - 1 &&
            <i onClick={() => (set_playingOccuranceIndex(0), set_practicingWordIndex(practicingWordIndex + 1))} className="fa-solid fa-chevron-right absolute p-2 py-11 right-0 top-1/2 transform -translate-y-1/2 text-gray"></i>
          }
        </div>
        {/* <div className="m-2 text-center">
          <h3 className="text-lg text-dark-yellowishorange">
            {currentWordInfo?.shortDescription}
          </h3>
        </div> */}
      </div>
    </ErrorBoundary>
  );
};

function useWordColletionWordInfos(list, paramWord) {
  const [wordCollection, set_wordCollection] = useState()
  const [wordInfos, set_wordInfos] = useState({})
  const [practicingWordIndex, set_practicingWordIndex] = useState(0)
  const [wordOccurancesMap, set_wordOccurancesMap] = useState({})

  const request_wordOccurances = async (the_word) => {
    try {
      const wordData = (await api().get(`/occurances_v2?lemma=${the_word}&limit=10`)).data;
      // console.log("wordData", wordData);
      if (wordData.length) {
        return wordData
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  const requestWords = async () => {
    const wordCollection = (await api('').get(`/wordCollections?title=${list}`)).data.results[0];
    set_wordCollection(wordCollection)
    set_practicingWordIndex(wordCollection.keywords.reduce((previousIndex, item, currentIndex) => item.the_word === paramWord ? currentIndex : previousIndex, 0))
    const new_wordInfos = {}
    const new_wordOccurancesMap = {}
    await Promise.all(wordCollection.keywords.map(async (keyword) => {
      const response = await api().get(`/wordInfos?the_word=${keyword.the_word}`);

      if (!new_wordInfos[keyword.the_word]) {
        new_wordInfos[keyword.the_word] = response?.data?.results[0]
      }

      const newOccurances = await request_wordOccurances(keyword.the_word)
      // console.log('newOccurances', newOccurances)
      if (newOccurances?.length) {
        new_wordOccurancesMap[keyword.the_word] = newOccurances;
      }
    }))
    set_wordOccurancesMap(new_wordOccurancesMap)
    set_wordInfos(new_wordInfos)
  }
  useEffect(() => {
    requestWords()
  }, [list])
  const currentWord = wordCollection?.keywords[practicingWordIndex]?.the_word || list[practicingWordIndex] || paramWord
  const currentWordInfo = wordInfos[currentWord]
  const currentWordOccurances = wordOccurancesMap[currentWord]?.concat(currentWordInfo?.youglishSrcs) || []
  const currentAvailableOccurancesLength = currentWordOccurances?.length
  return { wordInfos, wordCollection, practicingWordIndex, set_practicingWordIndex, currentWordInfo, currentWord, currentWordOccurances, currentAvailableOccurancesLength }
}

async function checkResourceExists(url) {
  return fetch(url, { method: 'HEAD' })
    .then(response => {
      if (response.ok) {
        // Resource exists (status code 200-299)
        return true;
      } else if (response.status === 404) {
        // Resource does not exist
        return false;
      } else {
        // Some other status code
        throw new Error(`HTTP status ${response.status}`);
      }
    })
    .catch(error => {
      console.error('Error checking resource:', error);
      return false;
    });
}

export default Quiz;
