import React, { useRef } from 'react';
import './Tooltip.css';
import axios from 'axios';
import classNames from 'classnames';

function Tooltip(props) {
  const { text, selectionText, className } = props;

  const subtitlePartRef = useRef(null)
  const tooltipRef = useRef(null)

  const handleMouseEnter = async (event) => {
      requestPhrase(text)
  }

  const requestPhrase = async (text) => {
    // const gResult = await axios.get(`https://www.googleapis.com/customsearch/v1?key=AIzaSyB4ZBrVYfmrK7b4p9Grl3PNPl-Ll-dL0WA&cx=017576662512468239146:omuauf_lfve&q=define+${text}`)
    // console.log(gResult)
    // return gResult
  }

  const handleHeartClick = () => {

  }

  const handleInfoClick = () => {

  }

  return (
    <div className="tooltip">
      <span className={classNames(['tooltipTarget', 'tooltipTarget-opacity-05', className])} onMouseEnter={handleMouseEnter}>
        {text}&#xa0;
      </span>
      <div className="tooltipContent" ref={tooltipRef}>
        <div className='tooltipContentButtons'>
          <i className='iconButton' onClick={handleInfoClick}>❤️</i>
          <a className='iconButton' href={`https://www.google.com/search?q=define+${selectionText || text}`} target="_blank" rel="noreferrer">🔎</a>
          <i className='iconButton' onClick={handleInfoClick}>🤯</i>
        </div>
      </div>
    </div>
  );
}

export default Tooltip;