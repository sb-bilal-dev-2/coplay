import React, { useEffect, useRef, useState } from "react";
import "./HorizontalScrollMenu.css";
import { Link } from "react-router-dom";
import { BASE_SERVER_URL } from "../api";
import VideoFrame, { VideoFrameForWord } from "./VideoFrame";
import BarsSmall from "./BarsSmall";

const HorizontalScrollMenu = ({ items, baseRoute, card_className = 'vertical', renderItem }) => {
  const scrollRef = useRef(null);
  const [hoveringItemId, setHoveringItemId] = useState()

  return (
    <div className="horizontal-scroll-menu no-scrollbar">
      <ul className="menu-list no-scrollbar" ref={scrollRef}>
        {items?.map(({ _id, label, title, posterUrl, youtubeUrl, thumbnail, keywords }) => (
          <li
            onMouseEnter={() => setHoveringItemId(_id)}
            onMouseLeave={() => setHoveringItemId('')}
            className="w-full"
          >
            <HorizontalScrollMenuCardMain
              _id={_id}
              label={label}
              title={title}
              posterUrl={posterUrl}
              baseRoute={baseRoute}
              hoveringItemId={hoveringItemId}
              youtubeUrl={youtubeUrl}
              thumbnail={thumbnail}
              card_className={card_className}
              word={keywords && keywords[0]?.the_word}
            />
          </li>
        ))}
      </ul>
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
  youtubeUrl,
  thumbnail,
  card_className,
  word
}) => {
  const renderVideoFrame = () => {
    if (baseRoute === 'word_collection') {
      return <VideoFrameForWord word={word} />
    } else {
      return (
        <VideoFrame
          time={900}
          title={title}
          videoSrc={BASE_SERVER_URL + "/movie?name=" + title}
        />
      )
    }
  }

  return (
    <Link
      className={`list-card ${card_className}`}
      to={[baseRoute, (baseRoute === 'movie' ? _id : title)].join("/")}
    >
      <div className="list-card__image mx-1" style={{
        backgroundImage: `url('${posterUrl ||
          `${BASE_SERVER_URL}/${baseRoute}Files/${title}.jpg`
          }')` + `, url('${thumbnail}')` + ", url('https://as2.ftcdn.net/v2/jpg/01/06/56/01/1000_F_106560184_nv5HWNCckLtha3SlovZBi39nbaVBNzb1.jpg')",
      }}>
        {/* TODO: Implement hover play video */}
        {youtubeUrl?.length &&
          <img
            className="h-full w-full"
            style={{ objectFit: "cover" }}
            src={`https://img.youtube.com/vi/${youtubeUrl.split('embed/')[1]}/hqdefault.jpg`}
          />
        }
        {(!youtubeUrl && !posterUrl &&
          renderVideoFrame()
        )}
      </div>
      <p className="list-card__title">{label || title}</p>
    </Link>
  )
}

const TAGS = ['Trending 🔥', 'Popular', 'Music', 'Cartoon', 'Podcasts', 'Series'] // add 'Courses', 'Interactive',

export const TagsScroll = ({ tags = TAGS, onIndexUpdate, forcedIndex, firstSticky }) => {
  const scrollRef = useRef(null);
  const [currentIndex, set_currentIndex] = useState(0)

  const handleItemClick = (item, newIndex) => {
    set_currentIndex(newIndex)
    onIndexUpdate(item, newIndex)
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
    <div className="scroll-list-container relative text-white z-10 scroll-main-container flex bg-transparent pb-1">
      {firstSticky && (
        <div className="tags-first-sticky">
          <button
            key={tags[0]}
            className="px-3 mr-1 py-1 cursor-pointer select-none"
            style={{
              // borderBottom: currentIndex === index && '2px solid orangered',
              // color: currentIndex === index ? 'orangered' : '#333',
              // height: '42px',
              whiteSpace: 'nowrap',
              wordBreak: 'keep-all',
              fontWeight: 'bolder',
              background: currentIndex === 0 ? 'black' : 'rgb(255 249 244)',
              color: currentIndex === 0 ? 'white' : '#423531',
              borderRadius: '9px',
              border: '1px solid rgb(100 100 100)',
            }}
            onClick={() => handleItemClick(tags[0], 0)}
          >
            {tags[0]}
          </button>
        </div>
      )}
      <div ref={scrollRef} className="scroll-list flex w-full overflow-scroll top-0">
        {tags?.slice(firstSticky && 1).map((item, index) => {
          if (firstSticky) {
            ++index;
          }
          return (
            <button
              key={item.label}
              className="px-3 mx-0.5 py-1 cursor-pointer select-none"
              style={{
                // borderBottom: currentIndex === index && '2px solid orangered',
                // color: currentIndex === index ? 'orangered' : '#333',
                // padding: '4px',
                whiteSpace: 'nowrap',
                fontWeight: 'bolder',
                background: currentIndex === index ? 'black' : 'rgb(255 255 255)',
                color: currentIndex === index ? 'white' : '#423531',
                borderRadius: '9px',
                border: '1px solid rgb(255 164 104)',
              }}
              onClick={() => handleItemClick(item, index)}>
              {item}
            </button>
          )
        })}
      </div>
      {/* <div className="tags-bar pt-1 absolute right-0">
        <BarsSmall barsColor="#666" />
      </div> */}
    </div>
  )
}

export default HorizontalScrollMenu;
