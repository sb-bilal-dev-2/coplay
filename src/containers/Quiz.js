import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import api from "../api";
import "./Quiz.css";
import { BASE_SERVER_URL } from "../api";
import classNames from "classnames";
import { Link, useNavigate } from "react-router-dom";
import { usePost } from './usePost';
import { sortByLearningState } from "../helper/sortByLearningState";

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
  const { list, word } = useParams();
  const [isShowingDefinitions, set_isShowingDefinitions] = useState();
  const [practicingWords, set_practicingWords] = useState([]);
  const [practicingWordIndex, set_practicingWordIndex] = useState(0);
  const [currentLemmaInfo, set_currentLemmaInfo] = useState();
  const [occurances, set_occurances] = useState([]);
  const [animatePause, set_animatePause] = useState(false);
  const navigate = useNavigate()

  const requestLemmaOccurances = async (the_word) => {
    try {
      const wordData = (await api().get(`/occurances_v2?lemma=${the_word}&limit=5`)).data;
      console.log("wordData", wordData);
      if (wordData.length) {
        set_occurances(wordData);
        const firstOccurance = wordData[0];
        console.log('firstOccurance', firstOccurance)
        const firstOccuranceSrc = BASE_SERVER_URL + "/movie?name=" + firstOccurance.mediaTitle;
        console.log('firstOccuranceSrc', firstOccuranceSrc)
        set_currentVideoSrc(firstOccuranceSrc);
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  const requestNextWord = async () => {
    updateRepeatCount(practicingWords[practicingWordIndex])
    const nextPracticingWord = practicingWords[practicingWordIndex + 1];
    set_occurances([]);
    if (!videoRef.current.paused) {
      videoRef.current.pause()
    }
    set_practicingWordIndex(practicingWordIndex + 1);
    console.log("nextPracticingWord?.the_word", nextPracticingWord?.the_word);
    await requestCurrentLemmaInfo(nextPracticingWord?.the_word);
  };

  const [error, set_error] = useState();
  const [currentVideoSrc, set_currentVideoSrc] = useState("");
  console.log('currentVideoSrc', currentVideoSrc)
  const [playingOccuranceIndex, set_playingOccuranceIndex] = useState(0);
  const videoRef = useRef();
  const inflections = currentLemmaInfo?.inflections.join(", ") || "";
  const requestCurrentLemmaInfo = async (newCurrent_the_word) => {
    let newCurrentLemmaInfo;
    try {
      requestLemmaOccurances(newCurrent_the_word);
      const response = await api().get(`/wordInfos?lemma=${newCurrent_the_word}`);
      console.log("response", response);

      newCurrentLemmaInfo = response?.data?.results[0];

      console.log("newCurrentLemmaInfo", newCurrentLemmaInfo);
      set_currentLemmaInfo(newCurrentLemmaInfo);
    } catch (err) {
      set_error(err);
      console.log("err: ", err);
    }
    set_currentLemmaInfo(newCurrentLemmaInfo);
  };
  const requestListAndGetCurrentLemmaInfo = async () => {
    let userWords = [];
    console.log("requesting initials");
    try {
      userWords = (await api().get("/get-user?allProps=1"))?.data
        ?.words;
      const { repeatingList, learningList, learnedList } = sortByLearningState(userWords);
      console.log('learnedList', learnedList)
      console.log('repeatingList', repeatingList)
      console.log('learningList', learningList)

      if (list === "repeating") {
        userWords = repeatingList;
      }
      if (list === "learning") {
        userWords = learningList;
      }
      console.log('repeatingList', repeatingList)
    } catch (err) {
      set_error(err);
      console.log("err: ", err);
    }

    let newCurrent_the_word = userWords[0]?.the_word;

    if (word) {
      newCurrent_the_word = userWords.find((item) => item.the_word === word)?.the_word
    }
    console.log('newCurrent_the_word', newCurrent_the_word)
    set_practicingWords(userWords);
    await requestCurrentLemmaInfo(newCurrent_the_word);
  };
  console.log('practicingWords', practicingWords)
  const playNextOccurance = async () => {
    if (!videoRef.current.paused) {
      // videoRef.current.pause();
    }
    const next_playingOccuranceIndex = playingOccuranceIndex + 1;
    const nextOccurance = occurances[next_playingOccuranceIndex];
    if (!nextOccurance) return;
    set_currentVideoSrc(
      `${BASE_SERVER_URL}/movie?name=${nextOccurance.mediaTitle}`
    );
    videoRef.current.currentTime = nextOccurance.startTime / 1000;
    if (videoRef.current && videoRef.current.paused) {
      videoRef.current.play();
    }
    set_playingOccuranceIndex(next_playingOccuranceIndex);
  };

  useEffect(() => {
    requestListAndGetCurrentLemmaInfo();
  }, []);

  const loadAndPlay = async () => {
    if (occurances.length) {
      await videoRef.current.load();
      console.log("currentVideoSrc", currentVideoSrc);
      if (videoRef.current) {
        videoRef.current.play();
      }
    }
  }

  useEffect(() => {
    loadAndPlay()
  }, [currentVideoSrc, occurances.length]);
  console.log('occurances', occurances)
  const currentOccurance = occurances[playingOccuranceIndex];
  const currentLemma = currentOccurance?.the_word;
  const currentInflection = currentOccurance?.inflection || currentLemma;
  const pattern = new RegExp(currentInflection, "i");
  const occuranceMainSubtitle = currentOccurance?.text;
  const matches = occuranceMainSubtitle?.match(pattern);
  //   console.log("matches", matches);
  const inflectionIndex = matches?.index;

  const occuranceMainSubtitleArray = [];
  for (var i = 0; i < occuranceMainSubtitle?.length; i++) {
    occuranceMainSubtitleArray.push(occuranceMainSubtitle);
  }

  const audioRef = useRef();
  useEffect(() => {
    audioRef.current.volume = 0.1;
  }, []);

  const pauseClick = async () => {
    set_animatePause(false);
    await new Promise((resolve) => setTimeout(resolve, 0));
    set_animatePause(true);
    await new Promise((resolve) => setTimeout(resolve, 725));
    set_animatePause(false);
  };
  const isVideoPaused = videoRef?.current && !videoRef?.current?.paused;

  const [postUserWords] = usePost()
  const updateRepeatCount = async (pWord) => {
    const usersPracticingWord = pWord || practicingWords[practicingWordIndex]
    if (!usersPracticingWord?.repeatCount) {
      usersPracticingWord.repeatCount = 0
    }
    usersPracticingWord.repeatCount += 1;
    usersPracticingWord.repeatTime = Date.now();
    postUserWords('/self_words', [usersPracticingWord])
  }

  // const pauseTimeoutRef = useRef()
  const handleTimeUpdate = async () => {
    if (
      videoRef.current.currentTime - 0.1 >=
      (currentOccurance?.endTime || 0) / 1000
    ) {
      audioRef.current.play();
      pauseClick();
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (!videoRef.current.paused) {
        videoRef.current.pause();
      }
      if (playingOccuranceIndex + 1 >= occurances.length || playingOccuranceIndex + 1 >= PLAYING_OCCURANCE_LIMIT) {
        if (practicingWordIndex + 1 === practicingWords.length) {
          updateRepeatCount()
        }
      }
    }
  }

  return (
    <>
      {/* <StickyHeader /> */}
      <button
        className={classNames("PlayButton", {
          animatePause,
          invisible: !animatePause,
        })}
        onClick={pauseClick}
      >
        <i class={`fa-solid fa-${isVideoPaused ? "play" : "pause"}`}></i>
      </button>
      <audio ref={audioRef} src="/tap-notification.mp3" />
      {/* <WebcamCapture /> */}
      <div className="QuizMain flex-grow bg-video text-gray text-gray-100 relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute z-10 top-4 left-4 text-white cursor-pointer"
        >
          <i className="fa fa-arrow-left" aria-hidden="true"></i>
        </button>
        <video
          className={classNames("w-full")}
          ref={videoRef}
          onLoadedMetadata={() => {
            console.log(
              "occurances[playingOccuranceIndex].startTime",
              occurances[playingOccuranceIndex].startTime
            );
            videoRef.current.currentTime =
              occurances[playingOccuranceIndex].startTime / 1000;
          }}
          onTimeUpdate={handleTimeUpdate}
        >
          <source src={currentVideoSrc} />
        </video>
        <div className="Subtitles text-center text-white px-8 text-lg">
          <b>
            {currentOccurance?.text}
            {/* {occuranceMainSubtitleArray.map((occChar, occCharIndex) => {
              const className =
                occCharIndex >= inflectionIndex &&
                  occCharIndex <= inflectionIndex + currentInflection?.length - 1
                  ? "text-primary"
                  : "";
              return <span className={className}>{occChar}</span>;
            })} */}
          </b>
        </div>
        <h1
          className="headline-1 cursor-default text-yellowishorange"
          onClick={() => set_isShowingDefinitions(!isShowingDefinitions)}
        >
          {(isShowingDefinitions ? inflections : currentLemma)?.toUpperCase()}
        </h1>
        <div className="opacity">
          <button
            className="float-right pr-4"
            onClick={() => {
              videoRef.current.currentTime =
                occurances[playingOccuranceIndex].startTime / 1000;
              if (videoRef.current && videoRef.current.paused) {
                videoRef.current.play();
              }
            }}
          >
            <b>Replay</b>
          </button>
          {practicingWordIndex < practicingWords.length - 1 && (
            <button className="float-right pr-4" onClick={requestNextWord}>
              <b>Next Word</b>
            </button>
          )}
          {playingOccuranceIndex + 1 < occurances.length && (
            <button className="float-right pr-4" onClick={playNextOccurance}>
              <b>Next</b>
            </button>
          )}
        </div>
        <div className="m-2 p-4 paper text-center">
          <h3 className="text-lg text-dark-yellowishorange">
            Vaqt | Safar | Martta
          </h3>
        </div>
      </div>
    </>
  );
};

export default Quiz;
