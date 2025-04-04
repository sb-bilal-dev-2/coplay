import React, { useEffect, useRef, useState } from "react";
import "./HorizontalScrollMenu.css";
import { Link } from "react-router-dom";
import { BASE_SERVER_URL } from "../api";
import VideoFrame from "./VideoFrame";
import BarsSmall from "./BarsSmall";
import { secondsToDisplayTime } from "../utils/secondsToDisplayTime";
import { degausser } from "../utils/degausser";
import { VkVideoInit } from "../containers/ShortVideo";
import YoutubePlayer from "./YoutubePlayer";

const HorizontalScrollMenu2 = ({ items, baseRoute, card_className = 'vertical', isActive }) => {
  const scrollRef = useRef(null);
  const [hoveringItemIndex, setHoveringItemIndex] = useState(1)
  console.log('hoveringItemIndex', hoveringItemIndex, items.find(i => i.id === hoveringItemIndex))
  // console.log('items', items)
  return (
    <div className="horizontal-scroll-menu2 no-scrollbar">
      <ul className="menu-list no-scrollbar" ref={scrollRef}>
        {items?.map(({ id, label, mediaTitle: title, posterUrl, youtubeUrl, vkVideoEmbed, thumbnail, startTime, text }, index) => {
          const isActiveItem = isActive && hoveringItemIndex !== null && hoveringItemIndex === index
          return (
            <li
              onMouseEnter={() => setHoveringItemIndex(index)}
              onMouseLeave={() => setHoveringItemIndex(null)}
            >

              <Link
                className={`list-card ${card_className}`}
              // to={[baseRoute, title].join("/")}
              >
                <div className="list-card__image mx-1" style={{
                  backgroundImage: `url('${posterUrl ||
                    `${BASE_SERVER_URL}/${baseRoute}Files/${title}.jpg`
                    }')` + `, url('${thumbnail}')` + ", url('https://as2.ftcdn.net/v2/jpg/01/06/56/01/1000_F_106560184_nv5HWNCckLtha3SlovZBi39nbaVBNzb1.jpg')",
                }}>
                  {/* TODO: Implement hover play video */}
                  {/* {youtubeUrl && !!youtubeUrl?.length &&
                  <img
                    className="h-full w-full"
                    src={`https://img.youtube.com/vi/${youtubeUrl.split('v=')[1]}/hqdefault.jpg`}
                  />
                } */}
                  <h2 style={{ right: '4px', position: 'absolute', zIndex: '10', textShadow: '1px 1px #333', color: 'white'}}>{secondsToDisplayTime(startTime / 1000)}</h2>
                  <p style={{ fontSize: '0.8em', textAlign: 'right', padding: '4px', position: 'absolute', top: '20px', zIndex: '10', textShadow: '1px 1px #333', color: 'white'}}>{degausser(text)}</p>
                  <p style={{ bottom: '0', position: 'absolute', right: '4px', maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis', maxHeight: '54px', fontSize: '0.7em', textAlign: 'right', zIndex: '10', textShadow: '1px 1px #333' }}>{(label || title)?.replaceAll('_', ' ')}</p>
                  {/* {id !== hoveringItemIndex && (
                  <VideoFrame
                    time={startTime / 1000}
                    title={title}
                  />
                )} */}
                  {youtubeUrl && !vkVideoEmbed && isActiveItem && (
                    // <YoutubePlayer
                    //   autoplay
                    //   scale={1}
                    //   videoIdOrUrl={youtubeUrl}
                    //   onTimeUpdate={() => {
                    //   }}
                    //   isActive
                    //   startTime={startTime}
                    // />
                    <div style={{ overflow: 'hidden', height: '100%', width: '100%', position: 'relative' }}>
                      <div style={{ height: '140%', width: '190%', position: 'absolute', left: `-${90 / 2}%`, bottom: `-${40 / 4}%` }}>
                        <iframe
                          style={{ height: '100%', width: '100%' }}
                          src={youtubeUrl + '?autoplay=1&start=' + Math.floor(startTime / 1000)}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin"
                        />
                      </div>
                    </div>
                  )}
                  {vkVideoEmbed && isActiveItem && (
                    <VkVideoInit
                      onTimeUpdate={() => {
                      }}
                      iframeSrc={vkVideoEmbed}
                      startTime={startTime / 1000}
                      isActive
                      halfVisible
                    />
                  )}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  );
};

function extractVkVideoEmbedFromMediaTitle(mediaTitle) {
  const vkEmbed = mediaTitle

  return "https://vkvideo.ru/video_ext.php?oid=878939759&id=456239017"
}

export default HorizontalScrollMenu2;
