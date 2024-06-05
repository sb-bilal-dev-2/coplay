import React, { useState, useRef, useMemo, useEffect } from "react";
import TinderCard from "react-tinder-card";
import { useRequestUserWordLists } from "../helper/useUserWords";
import { Link } from "react-router-dom";
import "./WordsPage.css";

const WordsPage = () => {
  const { learningList, learnedList, repeatingList } =
    useRequestUserWordLists();

  return (
    <div className="flex items-center justify-center flex-col bg-gray-900 h-screen">
      <h1 className="font-bold text-2xl m-10">My words</h1>
      <WordsSlider
        list={learningList}
        onSwipeLeft={() => {}}
        onSwipeRight={() => {}}
      />
    </div>
  );

  function getPercentage(index, totalNumbers = 7) {
    const step = 100 / (totalNumbers - 1); // Calculate step size
    return Math.round(index * step);
  }

  function WordsSlider({
    list,
    onSwipeLeft,
    onSwipeRight,
    onSwipeTop,
    onSwipeBottom,
  }) {
    const [currentIndex, setCurrentIndex] = useState(list.length - 1);
    const [lastDirection, setLastDirection] = useState();
    const [fliped, setFliped] = useState(false);
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
      setFliped(false);
      updateCurrentIndex(index - 1);
      if (direction === "right") {
        onSwipeRight(lemma);
      } else if ((direction = "left")) {
        onSwipeLeft(lemma);
      } else if ((direction = "top")) {
        onSwipeTop(lemma);
      } else if ((direction = "bottom")) {
        onSwipeBottom(lemma);
      }
      console.log("swiped");
    };

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

    const handleDoubleClick = () => {
      setFliped(!fliped);
    };

    return (
      <div className="cardMainContainer">
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
                >
                  <div
                    style={{
                      backgroundImage: "url(" + character?.imageDescUrl + ")",
                    }}
                    className="card"
                    onDoubleClick={handleDoubleClick}
                  >
                    <div className={`face ${fliped ? "face-front" : ""} `}>
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
                        <p className="font-bold text-white text-l m-4">
                          {getPercentage(character?.repeatCount)}%
                        </p>
                      </div>
                      <div
                        className="w-16 h-16 absolute rounded-full z-50 bottom-64 right-8 flex justify-center items-center cursor-pointer border-4 border-sky-400 shadow-sm"
                        style={{ background: "rgb(6 182 212)" }}
                      >
                        <Link to={"/quiz/" + character?.lemma.toLowerCase()}>
                          <i
                            class="fa fa-play text-white text-l m-4 text-center "
                            aria-hidden="true"
                          ></i>
                        </Link>
                      </div>
                      <div className="bg-green-100 w-full">
                        <h3
                          style={{ color: "darkgrey" }}
                          className="text-center relative w-full m-auto"
                        >
                          {character?.lemma}
                        </h3>
                      </div>{" "}
                    </div>
                    <div
                      className={`face text-gray-950  ${
                        !fliped ? "face-back" : ""
                      } border p-2`}
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
        <div className="buttons">
          <button
            style={{ backgroundColor: !canSwipe && "#c3c4d3" }}
            onClick={() => swipe("left")}
          >
            <i className="fa fa-angle-left"></i>
          </button>
          <button
            style={{ backgroundColor: !canGoBack && "#c3c4d3" }}
            onClick={() => goBack()}
          >
            <i className="fa fa-undo"></i>
          </button>
          <button
            style={{ backgroundColor: !canSwipe && "#c3c4d3" }}
            onClick={() => swipe("right")}
          >
            <i className="fa fa-angle-right"></i>
          </button>
        </div>
      </div>
    );
  }
};

export default WordsPage;
