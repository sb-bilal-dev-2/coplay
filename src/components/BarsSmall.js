import React from 'react';

export const BarsSmall = () => {
  return (
    <button className="BarsSmall w-8 h-8 relative cursor-pointer">
      <div className="absolute inset-0 rounded-full transform rotate-45"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full flex flex-col items-center justify-center">
          <div className="w-5 h-0.5 bg-white mb-2 rounded"></div>
          <div className="w-5 h-0.5 bg-white rounded"></div>
        </div>
      </div>
    </button>
  );
};

export const BarsSmallMultiple = () => {
  return (
    <button className="BarsSmall w-8 h-8 relative cursor-pointer">
      <div className="absolute inset-0 rounded-full transform rotate-45"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-5 h-5 rounded-full flex flex-col items-center justify-center">
          <div className="w-5 h-0.5 rounded" style={{ flexShrink: 0, background: '#f7fff4', marginTop: '7px'}}></div>
          <div className="w-5 h-0.5 rounded" style={{ flexShrink: 0, background: '#f7fff4', marginTop: '2px', alignSelf: 'start', width: '6.5px' }}></div>
          <div className="h-0.5 rounded" style={{ flexShrink: 0, background: '#f7fff4', marginTop: '2px', alignSelf: 'start', width: '6px' }}></div>
          <div className="h-0.5 rounded" style={{ flexShrink: 0, background: '#f7fff4', marginTop: '2px', alignSelf: 'start', width: '6.5px' }}></div>
        </div>
      </div>
    </button>
  );
}

export const WatchAgainIcon = () => {
  return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="#f7fff4" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true"><path clip-rule="evenodd" d="M14.203 4.83c-1.74-.534-3.614-.418-5.274.327-1.354.608-2.49 1.6-3.273 2.843H8.25c.414 0 .75.336.75.75s-.336.75-.75.75H3V4.25c0-.414.336-.75.75-.75s.75.336.75.75v2.775c.935-1.41 2.254-2.536 3.815-3.236 1.992-.894 4.241-1.033 6.328-.392 2.088.641 3.87 2.02 5.017 3.878 1.146 1.858 1.578 4.07 1.215 6.223-.364 2.153-1.498 4.1-3.19 5.48-1.693 1.379-3.83 2.095-6.012 2.016-2.182-.08-4.26-.949-5.849-2.447-1.588-1.499-2.578-3.523-2.784-5.697-.039-.412.264-.778.676-.817.412-.04.778.263.818.675.171 1.812.996 3.499 2.32 4.748 1.323 1.248 3.055 1.973 4.874 2.04 1.818.065 3.598-.532 5.01-1.681 1.41-1.15 2.355-2.773 2.657-4.567.303-1.794-.056-3.637-1.012-5.186-.955-1.548-2.44-2.697-4.18-3.231ZM12.75 7.5c0-.414-.336-.75-.75-.75s-.75.336-.75.75v4.886l.314.224 3.5 2.5c.337.241.806.163 1.046-.174.241-.337.163-.806-.174-1.046l-3.186-2.276V7.5Z" fill-rule="evenodd"></path></svg>
  )
}

export const BarsWatchAgain = () => {
  return (
      <div className="-ml-1" style={{ transform: 'scale(1.2)', marginTop: '-2px'}}>
          <BarsSmallMultiple />
          <div className="absolute right-0" style={{ transform: 'scale(0.75)', bottom: '4.5px' }}>
            <WatchAgainIcon />
          </div>
      </div>
  )
}

export const YourVideosIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" style={{ transform: 'scale(1.35)', opacity: 0.93 }} fill="#f7fff4" height="30" viewBox="0 0 30 24" width="24" focusable="false" aria-hidden="true"><path clip-rule="evenodd" d="M4.5 6.5h17v13h-17v-13ZM2 5.5C2 4.672 2.672 4 3.5 4h17c.828 0 0.5.672 1.5 1.5v13c0 .828-.672 1.5-1.5 1.5h-17c-.828 0-1.5-.672-1.5-1.5v-13Zm7.748 2.927c-.333-.19-.748.05-.748.435v6.276c0 .384.415.625.748.434L16 12 9.748 8.427Z" fill-rule="evenodd"></path></svg>
  )
}

export default BarsSmall;
