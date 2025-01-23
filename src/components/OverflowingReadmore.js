import React, { useRef, useEffect, useState } from 'react';

const OverflowingContainer = ({ maxHeight = '64px', content }) => {
  const containerRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const checkOverflow = () => {
    const container = containerRef.current;
    if (container) {
      setIsOverflowing(container.scrollHeight > container.clientHeight);
    }
  };

  useEffect(() => {
    checkOverflow();

    // Recheck on window resize
    window.addEventListener('resize', checkOverflow);
    return () => {
      window.removeEventListener('resize', checkOverflow);
    };
  }, [content]);

  return (
    <div>
      <div
        ref={containerRef}
        className='text-xs overflow-hidden'
        style={{ maxHeight: expanded ? 'none' : maxHeight }}
      >
        {content}
      </div>
      {isOverflowing && !expanded && (
        <button
          className='text-blue-500 mt-1 underline'
          onClick={() => setExpanded(true)}
        >
          Read More
        </button>
      )}
    </div>
  );
};

export default OverflowingContainer;
