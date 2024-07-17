import React, { useState, useRef, useMemo, useEffect } from "react";
import TinderCard from "react-tinder-card";
import { useRequestUserWordLists } from "../helper/useUserWords";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import "./WordsPage.css";
import StickyHeader from "../components/StickyHeader";
import api from "../api";

const useRequestWordCollectionWordList = (listName) => {
  const location = useLocation();
  const [wordCollection, set_wordCollection] = useState();
  const requestWordCollection = async () => {
    const response = await api().get(`/wordLists?forTitle=${listName}`)

    set_wordCollection(response?.data?.results[0]?.list)
  }

  useEffect(() => {
    requestWordCollection()
  }, [location.pathname])

  return wordCollection
}

const WordsPage = () => {
  const listsMap = useRequestUserWordLists();
  const { list: listName } = useParams();
  const location = useLocation();
  const isWordCollectionPage =
    location.pathname.split("/")[1] === "wordCollection";
  const wordCollectionWordList = useRequestWordCollectionWordList(listName)
  console.log('wordCollectionWordList', wordCollectionWordList)
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center flex-col bg-gray-900 h-screen">
      <StickyHeader />
      <h1 className="font-bold text-2xl m-10 text-white">
        {isWordCollectionPage ? "Word collection" : "My words"}
      </h1>
      <WordsSlider
        listName={listName}
        list={isWordCollectionPage ? wordCollectionWordList : listsMap[listName + "List"]}
        onSwipeLeft={() => {}}
        onSwipeRight={() => {}}
      />
    </div>
  );

  function getPercentage(index, totalNumbers = 7) {
    const step = 100 / (totalNumbers - 1); // Calculate step size
    const percentage = Math.round(index * step);
    return `${Math.min(percentage, 100)}%`;
  }

  function WordsSlider({
    listName,
    list = [],
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

      return false;
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

    const toggleCard = () => {
      setFliped(!fliped);
    };

    return (
      <div className="cardMainContainer">
        {/* <i
          class="fa-solid fa-arrow-left text-3xl text-white absolute left-4 top-4 cursor-pointer"
          onClick={() => navigate(-1)}
        ></i> */}
        <div className="cardContainer">
          {list.map((item, index) => {
            const lemma = typeof item === 'string' ? item : item?.lemma
            if (index > currentIndex - 5 && index < currentIndex + 5) {
              return (
                <TinderCard
                  ref={childRefs[index]}
                  className="swipe"
                  key={lemma}
                  onSwipe={(dir) => swiped(dir, lemma, index)}
                  onCardLeftScreen={() => outOfFrame(lemma, index)}
                >
                  <div
                    style={{
                      backgroundImage: "url(" + item?.imageDescUrl + ")",
                    }}
                    className="card"
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
                      {!isWordCollectionPage ? (
                        <>
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
                            <Link
                              to={`/quiz/${listName}/${lemma.toLowerCase()}`}
                            >
                              <i
                                class="fa fa-play text-white text-l m-4 text-center "
                                aria-hidden="true"
                              ></i>
                            </Link>
                          </div>
                        </>
                      ) : null}
                      <div className="bg-green-100 w-full" onClick={toggleCard}>
                        <h3
                          style={{ color: "darkgrey" }}
                          className="text-center relative w-full m-auto cursor-pointer"
                        >
                          {lemma}
                        </h3>
                      </div>{" "}
                    </div>
                    <div
                      className={`face text-gray-950  ${
                        !fliped ? "face-back" : ""
                      } border p-2`}
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
