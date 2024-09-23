import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion'
import { useThrottle } from '@uidotdev/usehooks';

const useCustomScroll = (options = {}) => {
  const {
    isHorizontal = false,
    pixelMoveOnDelta = 60,
    deltaThreshold = 20
  } = options
  const DELTA_THRESHOLD = deltaThreshold
  const THROTTLE_DELTACHANGE_EFFECT = 270
  const AFTER_SET_INDEX_EFFECT = 1000
  const SCROLL_MUTE_ON_OVERSCROLL_THRESHOLD = 200
  const PIXEL_MOVE_ON_DELTA_EFFECT = pixelMoveOnDelta
  const RESET_SCROLL_ON_DEFECTIVE_SCROLL = 600

  const containerRef = useRef(null);
  const [currentIndex, setCurrentIndex_] = useState(0);
  const setCurrentIndexDisabledTimeout = useRef()
  const setCurrentIndex = useCallback((index) => {
    setCurrentIndex_(index)
    setCurrentIndexDisabledTimeout.current = setTimeout(() => { setCurrentIndexDisabledTimeout.current = null }, AFTER_SET_INDEX_EFFECT)
  })
  // console.log('setCurrentIndexDisabledTimeout.current', setCurrentIndexDisabledTimeout.current)
  const [lastTouchPosition, setLastTouchPosition] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState('');
  const [lastDeltaX, set_lastDeltaX] = useState(0);
  const [lastDeltaY, set_lastDeltaY] = useState(0);
  const [translateX, set_translateX] = useState(0)
  const [translateY, set_translateY] = useState(0)

  const lastMoveTime = useRef(0);

  const delta = useRef(0)
  const scrollDelta = useRef(0)
  const scrollMuted = Math.abs(scrollDelta.current) > SCROLL_MUTE_ON_OVERSCROLL_THRESHOLD

  const scrollTo = useCallback((index) => {
    const container = containerRef.current;
    const newElementToScrollTo = container.children[index]
    if (container && newElementToScrollTo) {
      const newScrollPosition = isHorizontal ? newElementToScrollTo.offsetLeft : newElementToScrollTo.offsetTop
      container.scrollTo({
        [isHorizontal ? 'left' : 'top']: newScrollPosition,
        behavior: 'smooth'
      });
      if (isHorizontal) {
        set_translateX(newScrollPosition)
      } else {
        set_translateY(newScrollPosition)
      }

      setCurrentIndex(index);
    }
  }, []);

  const scrollToNext = useCallback(() => {
    if (containerRef.current && currentIndex < containerRef.current.children.length - 1) {
      scrollTo(currentIndex + 1);
    }
  }, [currentIndex, scrollTo]);

  const scrollToPrevious = useCallback(() => {
    if (containerRef.current && currentIndex > 0) {
      scrollTo(currentIndex - 1);
    }
  }, [currentIndex, scrollTo]);

  const handleTouchStart = useCallback((event) => {
    const touch = event.touches[0];
    const currentTime = Date.now();
    setLastTouchPosition({ x: touch.clientX, y: touch.clientY });
    lastMoveTime.current = currentTime;
    setVelocity({ x: 0, y: 0 });
    setDirection('');
  }, []);

  const handleTouchMove = useCallback((event) => {
    const touch = event.touches[0];
    const currentTime = Date.now();
    const deltaX = touch.clientX - lastTouchPosition.x;
    const deltaY = touch.clientY - lastTouchPosition.y;

    delta.current += isHorizontal ? deltaX : deltaY;
    const timeElapsed = currentTime - lastMoveTime.current;

    if (timeElapsed > 50) {
      const velocityX = Math.abs(deltaX) / timeElapsed;
      const velocityY = Math.abs(deltaY) / timeElapsed;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > DELTA_THRESHOLD) {
          set_lastDeltaX(deltaX);
        }
        setDirection(deltaX > 0 ? 'right' : 'left');
      } else {
        if (Math.abs(deltaY) > DELTA_THRESHOLD) {
          set_lastDeltaY(deltaY);
        }
        setDirection(deltaY > 0 ? 'down' : 'up');
      }

      setVelocity({ x: velocityX, y: velocityY });
      setLastTouchPosition({ x: touch.clientX, y: touch.clientY });
      lastMoveTime.current = currentTime;
    }
  }, [lastTouchPosition]);

  const handleTouchEnd = useCallback(() => {
    const currentVelocityX = velocity.x;
    const currentVelocityY = velocity.y;
    set_lastDeltaX(0);
    delta.current = 0;
    set_lastDeltaY(0);

    if (currentVelocityX > 0.1 || currentVelocityY > 0.1) {
      if (direction === 'left' || direction === 'up') {
        scrollToNext();
      } else if (direction === 'right' || direction === 'down') {
        scrollToPrevious();
      } else {
        scrollTo(currentIndex)
      }
    }
  }, [velocity, direction]);

  const handleScrollEnd = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerSize = isHorizontal ? container.clientWidth : container.clientHeight;
    const scrollOffset = isHorizontal ? container.scrollLeft : container.scrollTop;
    const itemSize = containerSize; // Assuming each item takes full width

    const currentItemIndex = Math.round(scrollOffset / itemSize);
    const currentItemOffset = scrollOffset % itemSize;

    let targetIndex;

    if (currentItemOffset > itemSize * 0.5) {
      // More than 50% scrolled to the next item
      targetIndex = currentItemIndex + 1;
    } else if (currentItemOffset < itemSize * 0.5) {
      // More than 50% scrolled to the previous item or within current item
      targetIndex = currentItemIndex;
    }

    // Ensure targetIndex is within bounds
    targetIndex = Math.max(0, Math.min(targetIndex, container.children.length - 1));

    if (targetIndex !== currentIndex) {
      scrollTo(targetIndex);
    } else {
      // If we're already at the correct index, just ensure perfect alignment
      scrollTo(currentIndex);
    }
  }, [currentIndex, scrollTo]);

  const wheelEndTimeout = useRef()
  const last_wheelEndTimeoutStart = useRef()

  const handleWheel = useCallback((event) => {
    const { wheelDeltaX, wheelDeltaY } = event;

    let wheelDirection = '';
    if (Math.abs(wheelDeltaX) > Math.abs(wheelDeltaY)) {
      wheelDirection = wheelDeltaX > 0 ? 'right' : 'left';
    } else {
      wheelDirection = wheelDeltaY > 0 ? 'up' : 'down';
    }

    if (scrollDelta.current !== 0 && Math.abs(scrollDelta.current) < SCROLL_MUTE_ON_OVERSCROLL_THRESHOLD) {
      const currentTime = Date.now()
      const timeDiff = currentTime - last_wheelEndTimeoutStart.current
      if (timeDiff > 50 || !last_wheelEndTimeoutStart.current) {
        last_wheelEndTimeoutStart.current = currentTime
        wheelEndTimeout.current = setTimeout(() => {
          if (scrollDelta.current !== 0) {
            scrollDelta.current = 0
            setLastTouchPosition({ x: wheelDeltaX, y: wheelDeltaY })
          }
          clearTimeout(wheelEndTimeout.current)
          wheelEndTimeout.current = null
        }, RESET_SCROLL_ON_DEFECTIVE_SCROLL)
      }
    }
    // const wheelDelta = isHorizontal ? wheelDeltaX : wheelDeltaY

    setLastTouchPosition({ x: wheelDeltaX, y: wheelDeltaY })

    if (!scrollMuted) {
      scrollDelta.current += isHorizontal ? wheelDeltaX : wheelDeltaY
    }
    if (isHorizontal) {

      if (!lastDeltaX && !lastDeltaY && Math.abs(wheelDeltaX) > DELTA_THRESHOLD) {
        set_lastDeltaX(wheelDeltaX);
        if (wheelDirection === 'left') {
          scrollToNext();
        } else if (wheelDirection === 'right') {
          scrollToPrevious();
        }
      }
    } else {
      if (!lastDeltaX && !lastDeltaY && Math.abs(wheelDeltaY) > DELTA_THRESHOLD) {
        set_lastDeltaY(wheelDeltaY);
        if (wheelDirection === 'down') {
          scrollToNext();
        } else if (wheelDirection === 'up') {
          scrollToPrevious();
        }
      }
    }

    const lastIndex = containerRef.current?.children.length === currentIndex;
    const scrollingNegativeIndex = !currentIndex && lastDeltaY > 0
    const scrollOverflow = lastIndex || scrollingNegativeIndex

    if (Math.abs(wheelDeltaX) < 4 || (scrollOverflow && Math.abs(lastDeltaX) > Math.abs(wheelDeltaX + DELTA_THRESHOLD))) {
      set_lastDeltaX(0);
      // if (isHorizontal) {
      //   handleScrollEnd()
      // }
    }

    if ((Math.abs(wheelDeltaY) < 4 && !isHorizontal) || Math.abs(wheelDeltaX) < 4 && isHorizontal) {
      scrollDelta.current = 0;
    }

    if (Math.abs(wheelDeltaY) < 4 || (scrollOverflow && Math.abs(lastDeltaY) > Math.abs(wheelDeltaY + DELTA_THRESHOLD))) {
      set_lastDeltaY(0);
      // if (!isHorizontal) {
      //   handleScrollEnd()
      // }
    }
  }, [lastDeltaX, lastDeltaY, currentIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart);
      container.addEventListener('touchmove', handleTouchMove);
      container.addEventListener('touchend', handleTouchEnd);
      container.addEventListener('wheel', handleWheel);

      return () => {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleWheel]);

  const lastIndex = containerRef.current?.children.length === currentIndex + 1;
  const scrollingNegativeIndex = !currentIndex && lastDeltaY > 0
  let obstacleBounceTranslate = isHorizontal ? translateX : translateY
  const lastDelta = isHorizontal ? lastDeltaX : lastDeltaY
  if (lastIndex) {
    obstacleBounceTranslate -= lastDelta
  } else if (scrollingNegativeIndex) {
    obstacleBounceTranslate = obstacleBounceTranslate + lastDelta
  }
  const transformTranslate = `translate${isHorizontal ? 'X' : 'Y'}(${scrollingNegativeIndex ? '' : '-'}${obstacleBounceTranslate}px)` // e.g. translateX(-400px)

  let scrollDeltaAdapted = Math.abs(scrollDelta.current) > 10 ? PIXEL_MOVE_ON_DELTA_EFFECT : 0

  if (scrollDelta.current < 0) scrollDeltaAdapted = -PIXEL_MOVE_ON_DELTA_EFFECT
  if (scrollMuted) scrollDeltaAdapted = 0
  const throttledScrollDelta = useThrottle(scrollDeltaAdapted, THROTTLE_DELTACHANGE_EFFECT)
  const scrollDeltaAdapted_ = !!setCurrentIndexDisabledTimeout.current ? 0 : throttledScrollDelta
  // console.log('scrollDeltaAdapted_', scrollDeltaAdapted_)
  const translate = (delta.current + scrollDeltaAdapted_) - (isHorizontal ? translateX : translateY)
  return {
    translate, containerRef, currentIndex, scrollToNext, scrollToPrevious, setCurrentIndex,
    delta: delta.current + scrollDeltaAdapted_, scrollDelta: scrollDelta.current, translateX, translateY, lastDeltaX, lastDeltaY, transformTranslate };
};


const SAMPLE_USAGE = ({ items }) => {
  const { translate, containerRef, currentIndex, scrollToNext, scrollToPrevious } = useCustomScroll();

  return (
    <div style={{ maxHeight: '100vh', overflow: 'hidden' }}>
      <button onClick={scrollToPrevious} disabled={currentIndex === 0}>Previous</button>
      <button onClick={scrollToNext} disabled={currentIndex === items.length - 1}>Next</button>
      <div style={{ maxHeight: '100vh', overflow: 'hidden' }}>
        <motion.div
          ref={containerRef}
          style={{
            height: '100%',
            overflow: 'hidden',
          }}
          transition={{ type: "just", damping: 200, stiffness: 500 }}
          animate={{ y: translate }}
        >
          {items.map((item, index) => (
            <div key={index} style={{ borderBottom: '1px solid red', height: '100vh', }}>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default useCustomScroll;
