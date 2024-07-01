import React, { useState, useMemo, useRef } from "react";
import TinderCard from "react-tinder-card";
import "./AdvancedSwipe.css";
import { useTranslation } from "react-i18next";

function AdvancedSwipe({
  list,
  onSwipeLeft,
  onSwipeRight,
  onSwipeTop,
  onSwipeBottom,
}) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(list.length - 1);
  const [lastDirection, setLastDirection] = useState();
  // used for outOfFrame closure
  const currentIndexRef = useRef(currentIndex);

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
                onSwipe={(dir) => swiped(dir, character?.lemma, index)}
                onCardLeftScreen={() => outOfFrame(character?.lemma, index)}
                preventSwipe={["right", "left"]}
              >
                <div
                  style={{
                    backgroundImage: "url(" + character?.imageDescUrl + ")",
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
