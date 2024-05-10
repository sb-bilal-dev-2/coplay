import React, { useRef } from 'react';
import './Tooltip.css';
import classNames from 'classnames';

function Tooltip(props) {
  const { text, selectionText, className } = props;
  const tooltipRef = useRef(null)

  const handleMouseEnter = async () => {
      requestPhrase(text)
  }
  const requestPhrase = async () => {}
  const handleHeartClick = () => {}
  const handleInfoClick = () => {}

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