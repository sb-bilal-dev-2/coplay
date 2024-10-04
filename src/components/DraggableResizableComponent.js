
import React, { useEffect, useState, useRef } from 'react';

const DraggableResizableComponent = ({ children }) => {
  const initialPositionBottom = localStorage.getItem('initialDragPositionBottom') || '5%';
  const initialPositionLeft = localStorage.getItem('initialDragPositionLeft') || '5%';
  const [isEditing, setIsEditing] = useState(false);
  const [position, setPosition] = useState({ bottom: initialPositionBottom, left: initialPositionLeft });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const componentRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('initialDragPositionBottom', position.bottom);
    localStorage.setItem('initialDragPositionLeft', position.left);
  }, [position]);

  const getPercentage = (pixelValue, dimension) => {
    return `${(pixelValue / window[dimension === 'width' ? 'innerWidth' : 'innerHeight']) * 100}%`;
  };

  const handleStart = (clientX, clientY) => {
    if (isEditing) {
      setIsDragging(true);
      const rect = componentRef.current.getBoundingClientRect();
      setDragStart({
        x: clientX - rect.left,
        y: clientY - rect.top
      });
      if (componentRef.current) {
        componentRef.current.style.transition = 'none';
      }
    }
  };

  const handleMove = (clientX, clientY) => {
    if (isDragging && isEditing) {
      const newLeft = getPercentage(clientX - dragStart.x, 'width');
      console.log('newLeft', newLeft)
      const newBottom = getPercentage(window.innerHeight - (clientY + componentRef.current.offsetHeight - dragStart.y), 'height');
      console.log('newBottom', newBottom)
      
      setPosition({ bottom: newBottom, left: newLeft });
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    if (componentRef.current) {
      componentRef.current.style.transition = 'all 0.3s ease';
    }
  };

  // Mouse event handlers
  const handleMouseDown = (e) => handleStart(e.clientX, e.clientY);
  const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);
  const handleMouseUp = () => handleEnd();

  // Touch event handlers
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };
  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };
  const handleTouchEnd = () => handleEnd();

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, isEditing]);

  return (
    <div
      ref={componentRef}
      className={`fixed ${isEditing ? 'cursor-move' : ''}`}
      style={{
        bottom: position.bottom,
        left: position.left,
        userSelect: 'none',
        touchAction: 'none',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '16px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <buttons 
        className="absolute top-2 right-2 z-10"
        onClick={() => setIsEditing(!isEditing)}
      >
        {isEditing ? 'Save' : 'Edit'}
      </buttons>
      <div className="pt-8">
        {children}
      </div>
    </div>
  );
};

export default DraggableResizableComponent;
