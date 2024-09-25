import React, { useEffect, useRef, useState } from "react";
import "./HorizontalScrollMenu.css";
import { createDebouncedFunction } from "../debounce";
import { Link } from "react-router-dom";
import { BASE_SERVER_URL } from "../api";

const HorizontalScrollMenu = ({ items, baseRoute, verticalCard }) => {
  const scrollRef = useRef(null);
  const [hasScrolledEnd, setHasScrolledEnd] = useState(false);
  const [hasScrolledStart, setHasScrolledStart] = useState(false);
  const handleScrolled = createDebouncedFunction(() => {
    // console.log(
    //   scrollRef?.current?.offsetWidth,
    //   scrollRef?.current?.scrollLeft,
    //   scrollRef?.current?.scrollWidth
    // );
    const newHasScrolledEnd =
      Math.ceil(
        scrollRef?.current?.offsetWidth + scrollRef?.current?.scrollLeft
      ) >= scrollRef?.current?.scrollWidth;
    setHasScrolledEnd(newHasScrolledEnd);
    setHasScrolledStart(!scrollRef?.current?.scrollLeft || scrollRef?.current?.scrollLeft < 0);
  }, 50);
  useEffect(() => {
    handleScrolled();
  }, []);
  const handleScrollClick = createDebouncedFunction(async (directionRight) => {
    if (scrollRef.current) {
      let left = scrollRef?.current?.offsetWidth - 80;
      if (!directionRight) {
        left = -left;
      }
      const currentPosition = scrollRef?.current?.scrollLeft
      const nextPos = currentPosition + left
      if (nextPos < 0) {
        left = -currentPosition;
      } 
      const containerWidth = scrollRef?.current?.scrollWidth - scrollRef?.current?.offsetWidth
      if (nextPos > containerWidth) {
        left = containerWidth - currentPosition;
      }
      await scrollRef.current.scrollBy({
        left,
        behavior: "smooth",
      });
    }
  }, 50);
  return (
    <div className="horizontal-scroll-menu">
      {!hasScrolledStart && (
        <button
          style={{
            background:
              "linear-gradient(-90deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.7))",
          }}
          className="scroll-button"
          onClick={() => handleScrollClick()}
        >
          {"<"}
        </button>
      )}
      <ul className="menu-list" ref={scrollRef} onScroll={handleScrolled}>
        {items?.map(({ _id, label, title, posterUrl, poster, isPremium }) => (
          <Link
            className={`list-card ${verticalCard ? "verticalCard" : ""}`}
            to={[baseRoute, title].join("/")}
            style={{
              backgroundImage: `url('${
                posterUrl ||
                poster ||
                `${BASE_SERVER_URL}/${baseRoute}Files/${title}.jpg`
              }')` + `, url('${
                posterUrl ||
                poster ||
                `${BASE_SERVER_URL}/${baseRoute}Files/${title}.webp`
              }')` + ", url('https://as2.ftcdn.net/v2/jpg/01/06/56/01/1000_F_106560184_nv5HWNCckLtha3SlovZBi39nbaVBNzb1.jpg')",
            }}
          >
            {/* TODO: Refactor if project needs premium */}
            {/* {isPremium ? (
              <span
                className="font-bold  bg-white rounded-full text-center text-sm relative mb-0.5 float-right"
                style={{ width: "30px", height: "30px", lineHeight: "2" }}
              >
                <i class="fa-solid fa-crown text-yellow-400"></i>
              </span>
            ) : null} */}

            <div className="list-card__title">{label || title}</div>
          </Link>
        ))}
      </ul>
      {!hasScrolledEnd && items?.length !== 1 && (
        <button
          style={{
            background:
              "linear-gradient(90deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.7))",
          }}
          className="scroll-button"
          onClick={() => handleScrollClick(true)}
        >
          {">"}
        </button>
      )}
    </div>
  );
};

export default HorizontalScrollMenu;
