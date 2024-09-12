import React, { useState, useMemo, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./AdvancedSwipe.css";
import { useLocation } from "react-router-dom";

/**
 * check react-tiner-card for initial code or documentation
 * import TinderCard from "react-tinder-card";
 */
// import TinderCard from "react-tinder-card";
import TinderCard from "./TinderCard";
import { Link } from "react-router-dom";
import api from "../api";
import { speakText } from "./speakText";
import { useSelector } from "react-redux";

function getPercentage(index, totalNumbers = 7) {
  const step = 100 / (totalNumbers - 1); // Calculate step size
  const percentage = Math.min(Math.round(index * step), 100) || 0;

  return percentage && `${percentage}%`;
}
const DISPLAY_ITEMS_LIMIT = 5;

const Header = ({ repeatCount, the_word, title, list, currentIndex }) => {
  const percentage = getPercentage(repeatCount);
  return (
    <div className="px-2">
      <div
        className="w-18 h-18 absolute rounded-full z-50 -top-4 left-12 border-4 border-green-300 shadow"
        style={{ background: "rgb(22 163 74)" }}
      >
        <p className="font-bold text-white text-l m-4">
          {list.length - currentIndex}/{list.length}
        </p>
      </div>
      {!!percentage &&
      <div
        className="w-16 h-16 absolute rounded-full z-50 -top-4 right-36 border-4 border-red-200 shadow"
        style={{ background: "#f98787" }}
      >
        <p className="font-bold text-white text-l mt-4 text-center">
          {percentage}
        </p>
      </div>
      }
      <div
        className="w-16 h-16 absolute rounded-full z-50 -top-4 right-12 flex justify-center items-center cursor-pointer border-4 border-sky-400 shadow-sm"
        style={{ background: "rgb(212 78 6)" }}
      >
        <Link to={`/quiz/${title}/${the_word?.toLowerCase()}`}>
          <i
            class="fa fa-play text-white text-l m-4 text-center "
            aria-hidden="true"
          ></i>
        </Link>
      </div>
    </div>
  );
};

const ControllerButtons = ({ swipe, canSwipe, canGoBack, goBack, t }) => {
  const location = useLocation();
  let leftButton = "";
  let rightButton = "";

  switch (location.pathname) {
    case "/words/learning":
      leftButton = "repeat";
      rightButton = "got it";
      break;
    case "/words/repeating":
      leftButton = "repeat";
      rightButton = "got it";
      break;
    case "/words/learned":
      leftButton = "";
      rightButton = "";
      break;

    case "/movie/":
      leftButton = "know";
      rightButton = "learn";
      break;
    default:
      leftButton = "know";
      rightButton = "learn";

      break;
  }

  const isLearnedPage = location.pathname === "/words/learned";

  return (
    <div className="buttons">
      <button
        style={{ backgroundColor: !canSwipe && "#c3c4d3" }}
        onClick={() => swipe("left")}
      >
        {!isLearnedPage ? (
          <i className="fa fa-check-double"></i>
        ) : (
          <i class="fa-solid fa-arrow-left"></i>
        )}

        <code className="text-xs text-center p-2">{leftButton}</code>
      </button>
      <button
        style={{ backgroundColor: !canGoBack && "#c3c4d3" }}
        onClick={() => goBack()}
      >
        <i className="fa fa-undo"></i>
        <code className="text-xs text-center"> {t("back")}</code>
      </button>
      <button
        style={{ backgroundColor: !canSwipe && "#c3c4d3" }}
        onClick={() => swipe("right")}
      >
        {!isLearnedPage ? (
          <i className="fa fa-plus"></i>
        ) : (
          <i class="fa-solid fa-arrow-right"></i>
        )}

        <br />
        <code className="text-xs text-center"> {rightButton}</code>
      </button>
    </div>
  );
};

function AdvancedSwipe({
  list,
  onSwipeLeft,
  onSwipeRight,
  onSwipeTop,
  onSwipeBottom,
  reversed,
  header,
  title,
  mediaLang,
  onError = (err) => {
    if (err?.response?.status === 401) {
      if (window.confirm('Sign in to add words and for more! \nPress ok to go to login screen')) {
        window.location.replace(window.location.origin + '/#/auth/login')
      }
    } 
    // if (err?.response?.status === 403) {
    //   redirectToLoginPage = LoginSreen('Login expired, please sign in again \nPress ok to go to login screen')
    // }
  }
}) {
  const mainLang = useSelector(state => state.user?.user?.mainLanguage)
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState();
  // used for outOfFrame closure
  const currentIndexRef = useRef(currentIndex);
  const [wordInfosByTheWordMap, set_wordInfosByTheWordMap] = useState({});
  const requestWordInfo = async () => {
    console.log('list', list)
    
    const next10Items = list.slice(-currentIndex)
    console.log('next10Items', next10Items)
    const itemsToRequest = next10Items.filter(item => !wordInfosByTheWordMap[item])
    // console.log('wordInfoLemmas', await (api().get('/wordInfoLemmas?mainLang=en&the_word=' + itemsToRequest[0])))
    const newWordInfos = await Promise.all(itemsToRequest.map(async (item) => {
      const wordInfo = (await (api().get(`/wordInfoLemma?mainLang=${'en'}&the_word=` + item))).data
      return wordInfo
    }).map(prms => prms.catch((err) => console.log('err', err, err?.response?.status))))
    console.log('newWordInfos', newWordInfos)
    newWordInfos.filter(item => item).forEach((item) => (wordInfosByTheWordMap[item.the_word] = item))
    set_wordInfosByTheWordMap(wordInfosByTheWordMap)
  };
  const [fliped, setFliped] = useState(false);
  console.log('wordInfosByTheWordMap', wordInfosByTheWordMap)

  useEffect(() => {
    requestWordInfo();
    updateCurrentIndex(list.length - 1)
  }, [list]);
  const childRefs = useMemo(
    () =>
      Array(list.length)
        .fill(0)
        .map((i) => React.createRef()),
    []
  );

  const updateCurrentIndex = (val) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  const canGoBack = currentIndex < list.length - 1;
  // increase current index and show card
  const goBack = async () => {
    if (!canGoBack) return;
    const newIndex = currentIndex + 1;
    console.log('GO BACK to index', newIndex)
    updateCurrentIndex(newIndex);
    console.log('childRefs', childRefs, childRefs[newIndex], newIndex)
    await childRefs[newIndex]?.current?.restoreCard();
  };
  const handleSwipeError = (err) => {
    console.log('err', err)
    onError(err)
    goBack()
  }
  const canSwipe = currentIndex >= 0;
  // set last direction and decrease current index
  const swiped = async (direction, lemma, index) => {
    setLastDirection(direction);
    setFliped(false);

    updateCurrentIndex(index - 1);
    if (direction === "right") {
      onSwipeRight(lemma).catch(handleSwipeError);
    } else if ((direction = "left")) {
      onSwipeLeft(lemma).catch(handleSwipeError);
    }  

    if (direction === "up" || direction === "down") {
      console.log("Swipe up or down is disabled");
      return;
    }
    console.log("Swiped: " + direction);
  };

  console.log("lastDirection", lastDirection);

  const outOfFrame = (word, idx) => {
    console.log(`${word} (${idx}) left the screen!`, currentIndexRef.current);
    // handle the case in which go back is pressed before card goes outOfFrame
    currentIndexRef.current >= idx && childRefs[idx].current.restoreCard();
    // TODO: when quickly swipe and restore multiple times the same card,
    // it happens multiple outOfFrame events are queued and the card disappear
    // during latest swipes. Only the last outOfFrame event should be considered valid
  };

  const swipe = async (dir) => {
    if (canSwipe && currentIndex < list.length) {
      await childRefs[currentIndex].current.swipe(dir); // Swipe the card!
    }
  };

  const toggleCard = () => {
    setFliped(!fliped);
  };
  console.log('currentIndex', currentIndex)

  return (
    <div className="cardMainContainer">
      <h1 className="mb-10">{title}</h1>
      <div className="cardContainer">
        {list.map((character, index) => {
          const wordInfo = wordInfosByTheWordMap[character]
          if (index > currentIndex - DISPLAY_ITEMS_LIMIT || index > currentIndex + DISPLAY_ITEMS_LIMIT) {
            return (
              <TinderCard
                ref={childRefs[index]}
                className="swipe"
                key={character}
                swipeThreshold={0.2}
                onSwipe={(dir) => swiped(dir, character, index)}
                onCardLeftScreen={() => outOfFrame(character, index)}
                preventSwipe={["up", "down"]}
              >
                <div
                  style={{
                    backgroundImage: "url(" + wordInfo?.imageDescUrl + ")",
                    transform: `rotateZ(${(index - currentIndex) * 1}deg)`,
                    boxShadow: "0.1px 0.1px 2px 0.1px rgba(0, 0, 0, 0.3)",
                    left: `${Math.abs((index - currentIndex) * 1)}px`
                  }}
                  className="card"
                >
                  <div className={`face ${fliped ? "face-front" : ""} `}>
                    {header ? (
                      <Header
                        title={title}
                        repeatCount={wordInfo?.repeatCount}
                        the_word={character}
                        list={list}
                        currentIndex={currentIndex}
                      />
                    ) : null}
                    <div className="w-full" onClick={toggleCard}>
                      <i className="fa-solid fa-volume-high p-4 cursor-pointer hover:opacity-70" style={{ color: '#9198e5' }} onClick={() => speakText(character, wordInfo?.lang || mediaLang, 0.7)}></i>
                      <div className="absolute bottom-8 w-full" >
                        <h3
                          style={{ color: "green" }}
                          className="text-center w-full m-auto cursor-pointer text-4xl py-5 hover:opacity-90"
                        >
                          {wordInfo?.the_word || character}
                        </h3>
                        <p className="text-center w-full text-xl text-gray-700">{wordInfo?.rominized || wordInfo?.pronounciation}</p>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`${
                      !fliped ? "face-back" : ""
                    } border p-2 face text-gray-950  `}
                    onClick={toggleCard}
                  >
                    <div class="border-2 border-sky-300 rounded-md h-full p-4">
                      {wordInfo?.the_word_translations && wordInfo?.the_word_translations[mainLang] &&
                        <p className="text-center text-gray-500 font-bold">
                          {wordInfo?.the_word_translations[mainLang]}
                        </p>                    
                      }
                      <p className="text-center text-gray-500">
                        <b>Definition:</b> {wordInfo?.shortDefinition}
                      </p>
                      <br />
                      <p className="text-center text-gray-500">
                        <b>Explanation:</b> {wordInfo?.shortExplanation}
                      </p>
                    </div>
                  </div>
                </div>
              </TinderCard>
            );
          }
        })}
      </div>
      <ControllerButtons
        swipe={swipe}
        canSwipe={canSwipe}
        canGoBack={canGoBack}
        goBack={goBack}
        t={t}
      />
    </div>
  );
}

export default AdvancedSwipe;
