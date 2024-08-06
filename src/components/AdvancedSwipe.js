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

function getPercentage(index, totalNumbers = 7) {
  const step = 100 / (totalNumbers - 1); // Calculate step size
  const percentage = Math.round(index * step);
  return `${Math.min(percentage, 100)}%`;
}

const Header = ({ item, listName, list, currentIndex }) => {
  return (
    <>
      <div
        className="w-18 h-18 absolute rounded-full z-50 bottom-64 left-8 border-4 border-green-300 shadow"
        style={{ background: "rgb(22 163 74)" }}
      >
        <p className="font-bold text-white text-l m-4">
          {list.length - currentIndex}/{list.length}
        </p>
      </div>
      <div
        className="w-16 h-16 absolute rounded-full z-50 bottom-64 right-36 border-4 border-red-200 shadow"
        style={{ background: "#f98787" }}
      >
        <p className="font-bold text-white text-l mt-4 text-center">
          {getPercentage(item?.repeatCount)}
        </p>
      </div>
      <div
        className="w-16 h-16 absolute rounded-full z-50 bottom-64 right-8 flex justify-center items-center cursor-pointer border-4 border-sky-400 shadow-sm"
        style={{ background: "rgb(6 182 212)" }}
      >
        <Link to={`/quiz/${listName}/${item?.lemma.toLowerCase()}`}>
          <i
            class="fa fa-play text-white text-l m-4 text-center "
            aria-hidden="true"
          ></i>
        </Link>
      </div>
    </>
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
  list: initialList,
  onSwipeLeft,
  onSwipeRight,
  onSwipeTop,
  onSwipeBottom,
  reversed,
  header,
  title,
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
  const reversedList = useMemo(() => initialList.reverse(), [initialList]);
  const list = reversed ? reversedList : initialList;
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(list.length - 1);
  const [lastDirection, setLastDirection] = useState();
  // used for outOfFrame closure
  const currentIndexRef = useRef(currentIndex);
  const [wordInfosByTheWordMap, set_wordInfosByTheWordMap] = useState(null);
  const requestWordInfo = async () => {
    const next10Items = list.slice(currentIndex, currentIndex + 10)
    // const wordInfos = (await (api().get('/wordInfos?the_word=' + JSON.stringify(list)))).data
    const new_wordInfosByTheWordMap = {}
    wordInfosByTheWordMap.forEach((value) => {new_wordInfosByTheWordMap[value.the_word] = value })
    set_wordInfosByTheWordMap(new_wordInfosByTheWordMap)
  };
  const [fliped, setFliped] = useState(false);

  useEffect(() => {
    requestWordInfo();
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

    await childRefs[newIndex].current.restoreCard();
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

  return (
    <div className="cardMainContainer">
      <h1 className="mb-10">{title}</h1>
      <div className="cardContainer">
        {list.map((character, index) => {
          if (index > currentIndex - 5 && index < currentIndex + 5) {
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
                    backgroundImage: "url(" + character?.imageDescUrl + ")",
                    transform: `rotateZ(${(index - currentIndex) * 1}deg)`,
                    boxShadow: "0.1px 0.1px 2px 0.1px rgba(0, 0, 0, 0.3)",
                    left: `${Math.abs((index - currentIndex) * 1)}px`
                  }}
                  className="card"
                >
                  <div className={`face ${fliped ? "face-front" : ""} `}>
                    {header ? (
                      <Header
                        item={character}
                        list={list}
                        currentIndex={currentIndex}
                      />
                    ) : null}
                    <div className="bg-green-100 w-full" onClick={toggleCard}>
                      <h3
                        style={{ color: "green" }}
                        className="text-center relative w-full m-auto cursor-pointer"
                      >
                         {typeof character === 'string' ? character : character?.lemma}
                      </h3>
                    </div>
                  </div>
                  <div
                    className={`${
                      !fliped ? "face-back" : ""
                    } border p-2 face text-gray-950  `}
                    onClick={toggleCard}
                  >
                    <div class="border-2 border-sky-300 rounded-md h-full p-4">
                      <p className="text-center text-gray-500 font-bold">
                        description description description
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
