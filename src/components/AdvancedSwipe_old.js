import React, { useState, useMemo, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./AdvancedSwipe.css";

/**
 * check react-tiner-card for initial code or documentation
 * import TinderCard from "react-tinder-card";
*/
// import TinderCard from "react-tinder-card";
import TinderCard from "./TinderCard";
import api from "../api";

function AdvancedSwipe({
  list: initialList,
  onSwipeLeft,
  onSwipeRight,
  onSwipeTop,
  onSwipeBottom,
  reversed,
}) {
  const reversedList = useMemo(() => initialList.reverse(), [initialList])
  const list = reversed ? reversedList : initialList
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(list.length - 1);
  const [lastDirection, setLastDirection] = useState();
  // used for outOfFrame closure
  const currentIndexRef = useRef(currentIndex);
  const [wordInfosByTheWordMap, set_wordInfosByTheWordMap] = useState(null);
  const requestWordInfo = async () => {
    // const wordInfos = (await (api().get('/wordInfos?the_word=' + JSON.stringify(list)))).data
    // console.log(wordInfos, "wordInfos")
    // const missingLemmas = wordInfos.filter(item => !item.lemma)
    
    // const missingLemmaInfo = await api().post('/wordLemmaInfo', missingLemmas)
    // console.log(missingLemmaInfo, "missingLemmaInfo")
    // const new_wordInfosByTheWordMap = {}
    // wordInfosByTheWordMap.forEach((value) => {new_wordInfosByTheWordMap[value.the_word] = value })
    // set_wordInfosByTheWordMap(new_wordInfosByTheWordMap)
  }

  useEffect(() => {
    requestWordInfo()
  }, [list])
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

  const canSwipe = currentIndex >= 0;

  // set last direction and decrease current index
  const swiped = (direction, lemma, index) => {
    setLastDirection(direction);
    updateCurrentIndex(index - 1);
    if (direction === "right") {
      onSwipeRight(lemma);
    } else if ((direction = "left")) {
      onSwipeLeft(lemma);
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

  // increase current index and show card
  const goBack = async () => {
    if (!canGoBack) return;
    const newIndex = currentIndex + 1;
    updateCurrentIndex(newIndex);

    await childRefs[newIndex].current.restoreCard();
  };

  return (
    <div className="cardMainContainer">
      <h1>{t("movie word list")}</h1>
      <div className="cardContainer">
        {list.map((character, index) => {
          if (index > currentIndex - 5 && index < currentIndex + 5) {
            return (
              <TinderCard
                ref={childRefs[index]}
                className="swipe"
                key={character?.lemma}
                swipeThreshold={0.2}
                onSwipe={(dir) => swiped(dir, character?.lemma, index)}
                onCardLeftScreen={() => outOfFrame(character?.lemma, index)}
                preventSwipe={["up", "down"]}
              >
                <div
                  style={{
                    backgroundImage: "url(" + character?.imageDescUrl + ")",
                    transform: `rotateZ(${index - currentIndex}deg)`,
                    boxShadow: '0.1px 0.1px 2px 0.1px rgba(0, 0, 0, 0.3)'
                  }}
                  className="card"
                >
                  <h3 style={{ color: "green" }}>{character?.lemma}</h3>
                </div>
              </TinderCard>
            );
          }
        })}
      </div>
      <div className="buttons">
        <button
          style={{ backgroundColor: !canSwipe && "#c3c4d3" }}
          onClick={() => swipe("left")}
        >
          <i className="fa fa-check-double"></i>
          <code className="text-xs text-center p-2">{t("know")}</code>
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
          <i className="fa fa-plus"></i>
          <code className="text-xs text-center"> {t("repeat")}</code>
        </button>
      </div>
    </div>
  );
}

export default AdvancedSwipe;
