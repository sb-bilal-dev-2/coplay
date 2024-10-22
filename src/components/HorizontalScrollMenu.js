import React, { useEffect, useRef, useState } from "react";
import "./HorizontalScrollMenu.css";
import { createDebouncedFunction } from "../debounce";
import { Link } from "react-router-dom";
import { BASE_SERVER_URL } from "../api";
import VideojsInited from "./VideojsInited";
import { ShortVideo } from "../containers/Quiz";
import VideoFrame from "./VideoFrame";
import BarsSmall from "./BarsSmall";

const HorizontalScrollMenu = ({ items, baseRoute, card_className = 'vertical' }) => {
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
      ) >= scrollRef?.current?.scrollWidth - 200;
    setHasScrolledEnd(newHasScrolledEnd);
    setHasScrolledStart(!scrollRef?.current?.scrollLeft || scrollRef?.current?.scrollLeft < 200);
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

  const [hoveringItemId, setHoveringItemId] = useState()

  return (
    <div className="horizontal-scroll-menu">
      {/* {!hasScrolledStart && (
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
      )} */}
      <ul className="menu-list" ref={scrollRef} onScroll={handleScrolled}>
        {items?.map(({ _id, label, title, posterUrl }) => (
          <li
            onMouseEnter={() => setHoveringItemId(_id)}
            onMouseLeave={() => setHoveringItemId('')}
          >
            <HorizontalScrollMenuCardMain
              _id={_id}
              label={label}
              title={title}
              posterUrl={posterUrl}
              baseRoute={baseRoute}
              hoveringItemId={hoveringItemId}
              card_className={card_className}
            />
          </li>
        ))}
      </ul>
      {/* {!hasScrolledEnd && items?.length !== 1 && (
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
      )} */}
    </div>
  );
};

export const HorizontalScrollMenuCardMain = ({
  _id,
  label,
  title,
  posterUrl,
  baseRoute,
  hoveringItemId,
  card_className
}) => {
  return (
    <Link
      className={`list-card ${card_className}`}
      to={[baseRoute, title].join("/")}
    >
      <div className="list-card__image" style={{
        backgroundImage: `url('${posterUrl ||
          `${BASE_SERVER_URL}/${baseRoute}Files/${title}.jpg`
          }')` + `, url('${posterUrl ||
          `${BASE_SERVER_URL}/${baseRoute}Files/${title}.webp`
          }')` + ", url('https://as2.ftcdn.net/v2/jpg/01/06/56/01/1000_F_106560184_nv5HWNCckLtha3SlovZBi39nbaVBNzb1.jpg')",
      }}>
        {hoveringItemId === _id ?
          <ShortVideo
            isActive={hoveringItemId === _id}
            mediaTitle={title}
            forcedCurrentTimeChange={100}
            showSubtitles={hoveringItemId === _id}
          />
          :
          (
            <VideoFrame time={1000} videoSrc={BASE_SERVER_URL + "/movie?name=" + title} />
          )
        }
      </div>
      <p className="list-card__title">{label || title}</p>
    </Link>
  )
}

const TAGS = ['All', 'New', 'Music', 'Books', 'Podcasts', 'Cartoon', 'Phrases', 'Words', 'Series', 'Movies', 'Interactive', 'Courses']

export const TagsScroll = ({ tags = TAGS, onIndexUpdate, forcedIndex, firstSticky }) => {
  const scrollRef = useRef(null);
  const [currentIndex, set_currentIndex] = useState(0)

  const handleItemClick = (newIndex) => {
    set_currentIndex(newIndex)
    onIndexUpdate(newIndex)
  }

  const scrollToIndex = (index) => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const items = container.children;
      if (items[index]) {
        const item = items[index];
        const itemWidth = item.offsetWidth;
        const containerWidth = container.offsetWidth;

        // Calculate the scroll position to center the item
        const scrollPosition = item.offsetLeft - (containerWidth / 2) + (itemWidth / 2);

        container.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  };
  useEffect(() => {
    if (firstSticky) {
      const stickyScroll = currentIndex - 2
      scrollToIndex(stickyScroll >= 0 ? stickyScroll : 0)
    } else {
      scrollToIndex(currentIndex)
    }
  }, [currentIndex])

  useEffect(() => {
    if (forcedIndex !== undefined && forcedIndex !== currentIndex) {
      console.log('force', forcedIndex)
      set_currentIndex(forcedIndex)
    }
  }, [forcedIndex])

  return (
    <div className="scroll-list-container relative text-white z-10 scroll-main-container flex bg-transparent">
      {firstSticky && (
        <div style={{
          marginRight: '-40px',
          marginLeft: '40px',
          zIndex: 30,
        }}>
          <div
            key={tags[0]}
            className="px-3 mx-1 py-1 cursor-pointer select-none"
            style={{
              // borderBottom: currentIndex === index && '2px solid orangered',
              // color: currentIndex === index ? 'orangered' : '#333',
              // height: '42px',
              fontWeight: 'bolder',
              background: currentIndex === 0 ? 'black' : 'rgb(255 248 238)',
              color: currentIndex === 0 ? 'white' : '#423531',
              borderRadius: '8px',
              border: '1px solid rgb(100 100 100)',
            }}
            onClick={() => handleItemClick(0)}
          >
            {tags[0]}
          </div>
        </div>
      )}
      <div ref={scrollRef} className="scroll-list flex w-full overflow-scroll top-0 mr-10">
        {tags?.slice(firstSticky && 1).map((item, index) => {
          if (firstSticky) {
            ++index;
          }
          return (
            <div
              key={item.label}
              className="px-3 mx-1 py-1 cursor-pointer select-none"
              style={{
                // borderBottom: currentIndex === index && '2px solid orangered',
                // color: currentIndex === index ? 'orangered' : '#333',
                // padding: '4px',
                fontWeight: 'bolder',
                background: currentIndex === index ? 'black' : 'rgb(255 248 238)',
                color: currentIndex === index ? 'white' : '#423531',
                borderRadius: '8px',
                border: '1px solid rgb(255 235 222)',
              }}
              onClick={() => handleItemClick(index)}>
              {item}
            </div>
          )
        })}
      </div>
      <div className="pt-1 absolute right-0" style={{ background: '#fff6ff', padding: '2px 16px' }}>
        <BarsSmall barsColor="#666" />
      </div>
    </div>
  )
}

export default HorizontalScrollMenu;
