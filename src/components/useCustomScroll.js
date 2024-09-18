import { useState, useEffect, useRef, useCallback } from 'react';

const useCustomScroll = (isHorizontal = false) => {
  const DELTA_THRESHOLD = 20
  const containerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastTouchPosition, setLastTouchPosition] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState('');
  const [lastDeltaX, set_lastDeltaX] = useState(0);
  const [lastDeltaY, set_lastDeltaY] = useState(0);
  const [translateX, set_translateX] = useState(0)
  const [translateY, set_translateY] = useState(0)

  const lastMoveTime = useRef(0);

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
      console.log('log 1')
      setCurrentIndex(index);
    }
  }, []);

  const scrollToNext = useCallback(() => {
    if (containerRef.current && currentIndex < containerRef.current.children.length - 1) {
      scrollTo(currentIndex + 1);
      console.log('log 2')
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
    const timeElapsed = currentTime - lastMoveTime.current;

    if (timeElapsed > 50) {
      const velocityX = Math.abs(deltaX) / timeElapsed;
      const velocityY = Math.abs(deltaY) / timeElapsed;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        set_lastDeltaX(deltaX);
        setDirection(deltaX > 0 ? 'right' : 'left');
      } else {
        set_lastDeltaY(deltaY);
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
    set_lastDeltaY(0);

    if (currentVelocityX > 0.1 || currentVelocityY > 0.1) {
      console.log(`SCROLL VELOCITY! VelocityX: ${currentVelocityX.toFixed(2)} px/s, VelocityY: ${currentVelocityY.toFixed(2)} px/s. Direction: ${direction}`);
      if (direction === 'left' || direction === 'up') {
        scrollToNext();
      } else if (direction === 'right' || direction === 'down') {
        scrollToPrevious();
      } else {
        scrollTo(currentIndex)
      }
    } else {
      console.log('No significant scroll detected.');
    }
  }, [velocity, direction]);

  const handleScrollEnd = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerSize = isHorizontal ? container.clientWidth : container.clientHeight;
    const scrollOffset = isHorizontal ? container.scrollLeft : container.scrollTop;
    console.log('containerSize', scrollOffset)
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

  const handleWheel = useCallback((event) => {
    const { wheelDeltaX, wheelDeltaY } = event;

    let wheelDirection = '';
    if (Math.abs(wheelDeltaX) > Math.abs(wheelDeltaY)) {
      wheelDirection = wheelDeltaX > 0 ? 'right' : 'left';
    } else {
      wheelDirection = wheelDeltaY > 0 ? 'up' : 'down';
    }

    if (isHorizontal) {
      if (!lastDeltaX && !lastDeltaY && Math.abs(wheelDeltaX) > DELTA_THRESHOLD) {
        set_lastDeltaX(wheelDeltaX);
        console.log(`Horizontal Scroll Direction: ${wheelDirection}. DeltaX: ${wheelDeltaX}`);
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
        console.log(`Vertical Scroll Direction: ${wheelDirection}. DeltaY: ${wheelDeltaY}`);
      }
    }

    if (Math.abs(wheelDeltaX) < 4) {
      set_lastDeltaX(0);
      // if (isHorizontal) {
      //   handleScrollEnd()
      // }
    }

    if (Math.abs(wheelDeltaY) < 4) {
      set_lastDeltaY(0);
      // if (!isHorizontal) {
      //   handleScrollEnd()
      // }
    }
  }, [lastDeltaX, lastDeltaY]);

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
    obstacleBounceTranslate -= lastDelta * 2
  } else if (scrollingNegativeIndex) {
    obstacleBounceTranslate = obstacleBounceTranslate + lastDelta * 2
  }
  const transformTranslate = `translate${isHorizontal ? 'X' : 'Y'}(${scrollingNegativeIndex ? '' : '-'}${obstacleBounceTranslate}px)` // e.g. translateX(-400px)

  return { containerRef, currentIndex, scrollToNext, scrollToPrevious, translateX, translateY, lastDeltaX, lastDeltaY, transformTranslate };
};


const ShortsList = ({ items }) => {
  const { containerRef, currentIndex, scrollToNext, scrollToPrevious, transformTranslate } = useCustomScroll();
  
  return (
    <div style={{ maxHeight: '80vh', overflow: 'hidden' }}>
      {/* <button onClick={scrollToPrevious} disabled={currentIndex === 0}>Previous</button>
      <button onClick={scrollToNext} disabled={currentIndex === items.length - 1}>Next</button> */}
      <div style={{ maxHeight: '80vh', overflow: 'hidden' }}>
        <div ref={containerRef} style={{
          height: '100%',
          overflow: 'hidden',
          transition: 'all 0.5s ease-in-out',
          // transform: `translateY(-${currentIndex * 100}vh)`
          transform: transformTranslate
        }}>
          {items.map((item, index) => (
            <div key={index} style={{ borderBottom: '1px solid red', height: '80vh', }}>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShortsList;
