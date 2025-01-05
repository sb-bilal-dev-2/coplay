import React, { useEffect, useRef, useState } from "react";
import "./HorizontalScrollMenu.css";
import { Link } from "react-router-dom";
import { BASE_SERVER_URL } from "../api";
import VideoFrame, { VideoFrameForWord } from "./VideoFrame";
import BarsSmall from "./BarsSmall";
import { secondsToDisplayTime } from "../utils/secondsToDisplayTime";
import { degausser } from "../utils/degausser";

const HorizontalScrollMenu2 = ({ items, baseRoute, card_className = 'vertical' }) => {
  const scrollRef = useRef(null);
  const [hoveringItemId, setHoveringItemId] = useState()

  const renderVideoFrame = () => {
    return (
      <div>
        
      </div>
    )
  }

  return (
    <div className="horizontal-scroll-menu2 no-scrollbar">
      <ul className="menu-list no-scrollbar" ref={scrollRef}>
        {items?.map(({ _id, label, mediaTitle: title, posterUrl, youtubeUrl, thumbnail, startTime, text }) => (
          <li
            onMouseEnter={() => setHoveringItemId(_id)}
            onMouseLeave={() => setHoveringItemId('')}
          // className="w-full"
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
                {youtubeUrl && !!youtubeUrl?.length &&
                  <img
                    className="h-full w-full"
                    src={`https://img.youtube.com/vi/${youtubeUrl.split('v=')[1]}/hqdefault.jpg`}
                  />
                }
                <div className="hcard-info p-1 h-full">
                  <h2 style={{ textAlign: 'right' }}>{secondsToDisplayTime(startTime / 1000)}</h2>
                  <p style={{ fontSize: '0.8em', textAlign: 'right' }}>{degausser(text)}</p>
                </div>
                <p style={{ bottom: '0', position: 'absolute', right: '4px', maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis', maxHeight: '54px', fontSize: '0.7em', textAlign: 'right' }}>{(label || title).replaceAll('_', ' ')}</p>
                {(!youtubeUrl && !posterUrl &&
                  renderVideoFrame(title, startTime)
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HorizontalScrollMenu2;
