import { useState, useEffect, useRef, useCallback } from 'react';

const useCustomScroll = (isHorizontal = false) => {
  const containerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastTouchPosition, setLastTouchPosition] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState('');
  const [firedX, setFiredX] = useState(false);
  const [firedY, setFiredY] = useState(false);

  const lastMoveTime = useRef(0);

  const scrollTo = useCallback((index) => {
    const container = containerRef.current;
    const newElementToScrollTo = container.children[index]
    if (container && newElementToScrollTo) {
      container.scrollTo({
        [isHorizontal ? 'left' : 'top']: isHorizontal ? newElementToScrollTo.offsetLeft : newElementToScrollTo.offsetTop,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  }, []);

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
        setDirection(deltaX > 0 ? 'right' : 'left');
      } else {
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

    if (currentVelocityX > 0.1 || currentVelocityY > 0.1) {
      alert('log 1 ' + direction)
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
      if (!firedX && !firedY && Math.abs(wheelDeltaX) > 25) {
        setFiredX(true);
        console.log(`Horizontal Scroll Direction: ${wheelDirection}. DeltaX: ${wheelDeltaX}`);
        if (wheelDirection === 'left') {
          scrollToNext();
        } else if (wheelDirection === 'right') {
          scrollToPrevious();
        }
      }  
    } else {
      if (!firedX && !firedY && Math.abs(wheelDeltaY) > 25) {
        setFiredY(true);
        if (wheelDirection === 'down') {
          scrollToNext();
        } else if (wheelDirection === 'up') {
          scrollToPrevious();
        }
        console.log(`Vertical Scroll Direction: ${wheelDirection}. DeltaY: ${wheelDeltaY}`);
      }
    }

    if (Math.abs(wheelDeltaX) < 4) {
      setFiredX(false);
      if (isHorizontal) {
        handleScrollEnd()
      }
    }

    if (Math.abs(wheelDeltaY) < 4) {
      setFiredY(false);
      if (!isHorizontal) {
        handleScrollEnd()
      }
    }
  }, [firedX, firedY]);

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

  return { containerRef, currentIndex, scrollToNext, scrollToPrevious };
};


const ShortsList = ({ items }) => {
  const { containerRef, currentIndex, scrollToNext, scrollToPrevious } = useCustomScroll();
  console.log('currentIndex', currentIndex)
  const containerStyle = {
    overflow: 'auto',
    maxHeight: '100vh'
    // width: '100%',
    // height: isHorizontal ? '100vh' : 'auto',
    // display: 'flex',
    // flexDirection: isHorizontal ? 'row' : 'column',
    // overflowX: isHorizontal ? 'auto' : 'hidden',
    // overflowY: isHorizontal ? 'hidden' : 'auto',
  };

  const itemStyle = {
    // flexShrink: 0,
    // width: isHorizontal ? '100%' : 'auto',
    borderBottom: '1px solid red',
    height: '100vh',
  };
  // const [lastTouchPosition, setLastTouchPosition] = useState({ x: 0, y: 0 });
  // const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  // const [direction, setDirection] = useState('');
  
  // const lastMoveTime = useRef(0);

  // const handleTouchStart = (event) => {
  //   const touch = event.touches[0];
  //   const currentTime = Date.now();

  //   setLastTouchPosition({ x: touch.clientX, y: touch.clientY });
  //   lastMoveTime.current = currentTime;
  //   setVelocity({ x: 0, y: 0 }); // Reset velocity
  //   setDirection(''); // Reset direction
  // };

  // const handleTouchMove = (event) => {
  //   const touch = event.touches[0];
  //   const currentTime = Date.now();

  //   const deltaX = touch.clientX - lastTouchPosition.x;
  //   const deltaY = touch.clientY - lastTouchPosition.y;

  //   const timeElapsed = currentTime - lastMoveTime.current; // Time in seconds

  //   if (timeElapsed > 50) {
  //     const velocityX = Math.abs(deltaX) / timeElapsed;
  //     const velocityY = Math.abs(deltaY) / timeElapsed;

  //     // Set the direction based on deltaX and deltaY
  //     if (Math.abs(deltaX) > Math.abs(deltaY)) {
  //       setDirection(deltaX > 0 ? 'right' : 'left');
  //     } else {
  //       setDirection(deltaY > 0 ? 'down' : 'up');
  //     }

  //     // Update velocity and last position
  //     setVelocity({ x: velocityX, y: velocityY });
  //     setLastTouchPosition({ x: touch.clientX, y: touch.clientY });
  //     lastMoveTime.current = currentTime;
  //   }
  // };

  // const handleTouchEnd = () => {
  //   const currentVelocityX = velocity.x;
  //   const currentVelocityY = velocity.y;

  //   console.log('Scroll direction:', direction);
    
  //   // If the velocity in the last 100ms is low, consider it as no scroll
  //   if (currentVelocityX > 0.1 || currentVelocityY > 0.1) {
  //     alert(`SCROLL VELOCITY! VelocityX: ${currentVelocityX.toFixed(2)} px/s, VelocityY: ${currentVelocityY.toFixed(2)} px/s. Direction: ${direction}`);
  //   } else {
  //     alert('No significant scroll detected.');
  //   }
  // };
  // const [firedX, setFiredX] = useState(false);
  // const [firedY, setFiredY] = useState(false);
  
  // const handleWheel = (event) => {
  //   const { wheelDeltaX, wheelDeltaY } = event.nativeEvent;
  
  //   let direction = '';
  //   console.log('wheelDeltaY', wheelDeltaY)
  //   // Determine the direction based on wheelDeltaX and wheelDeltaY
  //   if (Math.abs(wheelDeltaX) > Math.abs(wheelDeltaY)) {
  //     direction = wheelDeltaX > 0 ? 'right' : 'left';
  //   } else {
  //     direction = wheelDeltaY > 0 ? 'up' : 'down';
  //   }
  //   // console.log('firedX', firedX)
  //   // console.log('wheelDeltaX', wheelDeltaX)
  //   // Check if horizontal scroll deltas are significant and not already fired
  //   if (!firedX && !firedY && Math.abs(wheelDeltaX) > 25) {
  //     setFiredX(true); // Mark the horizontal scroll event as fired
  //     console.log(`Horizontal Scroll Direction: ${direction}. DeltaX: ${wheelDeltaX} ${firedY} ${firedX}`);
  //   }
  
  //   // Check if vertical scroll deltas are significant and not already fired
  //   if (!firedX && !firedY && Math.abs(wheelDeltaY) > 25) {
  //     setFiredY(true); // Mark the vertical scroll event as fired
  //     console.log(`Vertical Scroll Direction: ${direction}. DeltaY: ${wheelDeltaY} ${firedY} ${firedX}`);
  //   }
  
  //   // Check if scroll has stopped (both deltas near zero)
  //   if (Math.abs(wheelDeltaX) < 4 && Math.abs(wheelDeltaY) < 4) {
  //     console.log('set fired false')
  //     // Reset the fired states when the scroll has stopped
  //     setFiredX(false);
  //     setFiredY(false);
  //   }
  
  //   // // Store the last scroll deltas for comparison (optional)
  //   // lastWheelDelta.current = { x: wheelDeltaX, y: wheelDeltaY };
  // };

  return (
    <div style={{ overflow: 'hidden', maxHeight: '100vh' }}>
      {/* <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        scroll on me! {touchStart.x} {touchStart.y} {lastTouchPosition.x} {lastTouchPosition.y}
      </div> */}

      <button onClick={scrollToPrevious} disabled={currentIndex === 0}>Previous</button>
      <button onClick={scrollToNext} disabled={currentIndex === items.length - 1}>Next</button>
      <div ref={containerRef} style={containerStyle}
            // onTouchStart={handleTouchStart}
            // onTouchMove={handleTouchMove}
            // onTouchEnd={handleTouchEnd}
            //   onWheel={handleWheel}
      
      >
        {items.map((item, index) => (
          <div key={index} style={itemStyle}>
            {/* Your short content here */}
            <h2>{item.title}</h2>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShortsList;
