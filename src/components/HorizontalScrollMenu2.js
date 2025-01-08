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
  const [hoveringItemId, setHoveringItemId] = useState()
  console.log('hoveringItemId', hoveringItemId, items.find(i => i.id === hoveringItemId))

  return (
    <div className="horizontal-scroll-menu2 no-scrollbar">
      <ul className="menu-list no-scrollbar" ref={scrollRef}>
        {items?.map(({ id, label, mediaTitle: title, posterUrl, youtubeUrl, vkVideoEmbed, thumbnail, startTime, text }) => (
          <li
            onMouseEnter={() => setHoveringItemId(id)}
            onMouseLeave={() => setHoveringItemId('')}
          >

            <Link
              className={`list-card ${card_className}`}
              to={[baseRoute, title].join("/")}
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
                <h2 style={{ right: '4px', position: 'absolute', zIndex: '10', textShadow: '1px 1px #333' }}>{secondsToDisplayTime(startTime / 1000)}</h2>
                <p style={{ fontSize: '0.8em', textAlign: 'right', padding: '4px', position: 'absolute', top: '20px', zIndex: '10', textShadow: '1px 1px #333' }}>{degausser(text)}</p>
                <p style={{ bottom: '0', position: 'absolute', right: '4px', maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis', maxHeight: '54px', fontSize: '0.7em', textAlign: 'right', zIndex: '10', textShadow: '1px 1px #333' }}>{(label || title).replaceAll('_', ' ')}</p>
                {id !== hoveringItemId && (
                  <VideoFrame
                    time={startTime / 1000}
                    title={title}
                  />
                )}
                {youtubeUrl && id === hoveringItemId && (
                  <YoutubePlayer
                    videoIdOrUrl={youtubeUrl}
                    onTimeUpdate={() => {
                    }}
                    isActive
                    startTime={startTime / 1000}
                  />
                )}
                {vkVideoEmbed && id === hoveringItemId && (
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
        ))}
      </ul>
    </div>
  );
};

function extractVkVideoEmbedFromMediaTitle(mediaTitle) {
  const vkEmbed = mediaTitle

  return "https://vkvideo.ru/video_ext.php?oid=878939759&id=456239017"
}

export default HorizontalScrollMenu2;
