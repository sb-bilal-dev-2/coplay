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
    console.log(
      scrollRef?.current?.offsetWidth,
      scrollRef?.current?.scrollLeft,
      scrollRef?.current?.scrollWidth
    );
    const newHasScrolledEnd =
      Math.ceil(
        scrollRef?.current?.offsetWidth + scrollRef?.current?.scrollLeft
      ) === scrollRef?.current?.scrollWidth;
    setHasScrolledEnd(newHasScrolledEnd);
    setHasScrolledStart(!scrollRef?.current?.scrollLeft);
  }, 50);
  useEffect(() => {
    handleScrolled();
  }, []);
  const handleScrollClick = createDebouncedFunction((directionRight) => {
    if (scrollRef.current) {
      let left = scrollRef?.current?.offsetWidth - 80;
      if (!directionRight) {
        left = -left;
      }
      scrollRef.current.scrollBy({
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
              }')`,
            }}
          >
            {isPremium ? (
              <span
                className="font-bold  bg-white rounded-full text-center text-sm relative mb-0.5 float-right"
                style={{ width: "30px", height: "30px", lineHeight: "2" }}
              >
                <i class="fa-solid fa-crown text-yellow-400"></i>
              </span>
            ) : null}

            <li key={_id}>{label}</li>
          </Link>
        ))}
      </ul>
      {!hasScrolledEnd && (
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
