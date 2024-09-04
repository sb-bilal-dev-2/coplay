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

const Quiz = () => {
  const { } = useTelegramWebApp()
  const { list, word: paramWord } = useParams();
  const [isShowingDefinitions, set_isShowingDefinitions] = useState();
  const [occurances, set_occurances] = useState([]);
  const [playingOccuranceIndex, set_playingOccuranceIndex] = useState(0);
  const { currentWord, wordInfos, wordCollection, practicingWordIndex, set_practicingWordIndex, currentWordInfo } = useWordColletionWordInfos(list, paramWord)
  // console.log('FOO', FOO)
  // const { wordInfos, wordCollection, practicingWordIndex, set_practicingWordIndex, currentWordInfo } = FOO
  const navigate = useNavigate()
  const requestLemmaOccurances = async (the_word) => {
    try {
      const wordData = (await api().get(`/occurances_v2?lemma=${the_word}&limit=5`)).data;
      console.log("wordData", wordData);
      if (wordData.length) {
        set_occurances(wordData);
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  const requestListAndGetCurrentLemmaInfo = async () => {
  };
  const playNextOccurance = async () => {
  };


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
  console.log('currentWord', currentWord)
  console.log('currentWordInfo', currentWordInfo)
  console.log('practicingWordIndex', practicingWordIndex)
  console.log('wordCollection', wordCollection)
  const currentAvailableOccurancesLength = currentWordInfo?.youglishSrcs?.length;
  const prevOccButtonDisabled = playingOccuranceIndex <= 0;
  const nextOccButtonDisabled = playingOccuranceIndex >= currentAvailableOccurancesLength - 1;
  return (
    <>
      {/* <WebcamCapture /> */}
      <div className="QuizMain flex-grow bg-video text-gray text-gray-100 relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute z-10 top-4 left-4 text-white cursor-pointer"
        >
          <i className="fa fa-arrow-left" aria-hidden="true"></i>
        </button>
        {
          currentAvailableOccurancesLength && (
            <YoutubePlayer videoIdOrUrl={currentWordInfo?.youglishSrcs[playingOccuranceIndex]} />
          )
        }
        <div className="Subtitles text-center text-white px-8 text-lg">
          {/* <b>
            {currentWord}
          </b> */}
        </div>
        <div className="mb-4">
          {currentAvailableOccurancesLength ?
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
          }
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
    </>
  );
};

function useWordColletionWordInfos(list, paramWord) {
  const [wordCollection, set_wordCollection] = useState()
  const [wordInfos, set_wordInfos] = useState({})
  const [practicingWordIndex, set_practicingWordIndex] = useState(0)
  const requestWords = async () => {
    const wordCollection = (await api('').get(`/wordCollections?title=${list}`)).data.results[0];
    set_wordCollection(wordCollection)
    set_practicingWordIndex(wordCollection.keywords.reduce((previousIndex, item, currentIndex) => item.the_word === paramWord ? currentIndex : previousIndex, 0))
    const new_wordInfos = {}
    await Promise.all(wordCollection.keywords.map(async (keyword) => {
      const response = await api().get(`/wordInfos?the_word=${keyword.the_word}`);

      if (!new_wordInfos[keyword.the_word]) {
        new_wordInfos[keyword.the_word] = response?.data?.results[0]
      }
    }))
    set_wordInfos(new_wordInfos)
  }
  useEffect(() => {
    requestWords()
  }, [list])
  const currentWord = wordCollection?.keywords[practicingWordIndex]?.the_word
  const currentWordInfo = wordInfos[currentWord]
  return { wordInfos, wordCollection, practicingWordIndex, set_practicingWordIndex, currentWordInfo, currentWord }
}


export default Quiz;
