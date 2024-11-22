
import React, { useRef } from 'react';
import { useOutsideAlerter } from '../components/useOutsideAlerter';
import InfiniteScroll from '../components/InfiniteScroll';

const RelatedVideosDropdown = ({ videos, isOpen, closeDropdown }) => {
  const outsideClickElementRef = useRef()

  useOutsideAlerter(outsideClickElementRef, closeDropdown)

  return (
    <>
      {isOpen && (
        <div
          className="RelatedVideosBackdrop"
        >
          <div
            className="RelatedVideosMenu px-4 pt-4 overflow-scroll"
            ref={outsideClickElementRef}
          >
            <h4 className="text-left">More Videos</h4>
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
              <InfiniteScroll />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RelatedVideosDropdown;