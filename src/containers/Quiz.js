import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import api from "../api";
import "./Quiz.css";
import { BASE_SERVER_URL } from "../useRequests";
import classNames from "classnames";

const Quiz = () => {
  const { title } = useParams();
  const [isShowingDefinitions, set_isShowingDefinitions] = useState();
  const [practicingWords, set_practicingWords] = useState([]);
  const [practicingWordIndex, set_practicingWordIndex] = useState(0);
  const [currentLemmaInfo, set_currentLemmaInfo] = useState();
  const [occurances, set_occurances] = useState([]);
  const [animatePause, set_animatePause] = useState(false);

  const requestLemmaOccurances = async (lemma) => {
    try {
      const wordData = (await api().get(`/occurances?lemma=${lemma}`)).data
        .results;
      console.log("wordData", wordData);
      if (wordData.length) {
        set_occurances(wordData);
        const firstOccurance = wordData[0];
        const firstOccuranceSrc =
          BASE_SERVER_URL +
          "/" +
          firstOccurance.mediaType +
          "?name=" +
          firstOccurance.mediaTitle;
        set_currentVideoSrc(firstOccuranceSrc);
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  const requestNextWord = async () => {
    const nextPracticingWord = practicingWords[practicingWordIndex + 1];
    set_occurances([]);
    set_practicingWordIndex(practicingWordIndex + 1);
    console.log("nextPracticingWord?.lemma", nextPracticingWord?.lemma);
    await requestCurrentLemmaInfo(nextPracticingWord?.lemma);
  };

  const [error, set_error] = useState();
  const [currentVideoSrc, set_currentVideoSrc] = useState("");
  const [playingOccuranceIndex, set_playingOccuranceIndex] = useState(0);
  const videoRef = useRef();
  const inflections = currentLemmaInfo?.inflections.join(", ") || "";
  const requestCurrentLemmaInfo = async (newCurrentLemma) => {
    let newCurrentLemmaInfo;
    try {
      requestLemmaOccurances(newCurrentLemma);
      const response = await api().get(`/wordInfos?lemma=${newCurrentLemma}`);
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
    let list = [];
    if (title === "learning") {
      console.log("requesting initials");
      try {
        const userWords = (await api().get("/get-user?allProps=1"))?.data
          ?.words;
        console.log("userWords", userWords);
        list = userWords.filter((item) => !item.learned);
      } catch (err) {
        set_error(err);
        console.log("err: ", err);
      }
    }

    console.log("list", list);
    const newCurrentLemma = list[0]?.lemma;
    set_practicingWords(list);
    await requestCurrentLemmaInfo(newCurrentLemma);
  };

  const playNextOccurance = async () => {
    if (!videoRef.current.paused) {
      // videoRef.current.pause();
    }
    const next_playingOccuranceIndex = playingOccuranceIndex + 1;
    const nextOccurance = occurances[next_playingOccuranceIndex];
    if (!nextOccurance) return;
    set_currentVideoSrc(
      `${BASE_SERVER_URL}/${nextOccurance.mediaType}?name=${nextOccurance.mediaTitle}`
    );
    videoRef.current.currentTime = nextOccurance.startTime / 1000;
    videoRef.current.play();
    set_playingOccuranceIndex(next_playingOccuranceIndex);
  };

  useEffect(() => {
    requestListAndGetCurrentLemmaInfo();
  }, []);

  useEffect(() => {
    if (occurances.length) {
      console.log("currentVideoSrc", currentVideoSrc);
      videoRef.current.load();
      videoRef.current.play();
    }
  }, [currentVideoSrc, occurances.length]);

  const currentOccurance = occurances[playingOccuranceIndex];
  const currentLemma = currentOccurance?.lemma;
  const currentInflection = currentOccurance?.inflection || currentLemma;
  const pattern = new RegExp(currentInflection, "i");
  const occuranceMainSubtitle = currentOccurance?.context[1];
  const matches = occuranceMainSubtitle?.match(pattern);
  console.log("matches", matches);
  const inflectionIndex = matches?.index;

  const occuranceMainSubtitleArray = [];
  for (var i = 0; i < occuranceMainSubtitle?.length; i++) {
    occuranceMainSubtitleArray.push(occuranceMainSubtitle[i]);
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
      <div className="QuizMain flex-grow bg-video text-gray text-gray-100">
        {occurances.length && (
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
            onTimeUpdate={async () => {
              if (
                videoRef.current.currentTime - 0.1 >=
                occurances[playingOccuranceIndex].endTime / 1000
              ) {
                audioRef.current.play();
                pauseClick();
                await new Promise((resolve) => setTimeout(resolve, 100));
                videoRef.current.pause();
              }
            }}
          >
            <source src={currentVideoSrc + "&quality=1080.ultra"} />
          </video>
        )}
        <div className="Subtitles text-center text-white px-8 text-lg">
          <b>
            {occuranceMainSubtitleArray.map((occChar, occCharIndex) => {
              const className =
                occCharIndex >= inflectionIndex &&
                occCharIndex <= inflectionIndex + currentInflection.length - 1
                  ? "text-primary"
                  : "";
              return <span className={className}>{occChar}</span>;
            })}
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
              videoRef.current.play();
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
