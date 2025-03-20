import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

export const useScrolledItem = (type = 'vertical', options = {}) => {
  const {
    debounceTime = 50,
    itemDimention = 1,
  } = options;

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const lastScrollTime = useRef(0);
  const rafId = useRef(null);

  const calculateIndex = useCallback(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return 0;

    const isHorizontal = type === 'horizontal';
    const scrollPosition = isHorizontal 
      ? scrollContainer.scrollLeft 
      : scrollContainer.scrollTop;
    
    const containerDimension = isHorizontal 
      ? scrollContainer.clientWidth 
      : scrollContainer.clientHeight;

    // Calculate index with half-item threshold
    const index = Math.floor((scrollPosition + containerDimension / 2) / (containerDimension * itemDimention));

    return index;
  }, [type]);


  const handleScroll = useCallback(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const currentTime = Date.now();
    if (currentTime - lastScrollTime.current < debounceTime) {
      return;
    }

    // Cancel previous animation frame
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    rafId.current = requestAnimationFrame(() => {
      const scrollPosition = type === 'horizontal' 
        ? scrollContainer.scrollLeft 
        : scrollContainer.scrollTop;
      
      const containerDimension = type === 'horizontal' 
        ? scrollContainer.clientWidth 
        : scrollContainer.clientHeight;

      const currentIndex = calculateIndex(scrollPosition, containerDimension);
      
      setActiveIndex(prevIndex => {
        // Only update if the index has changed
        return prevIndex !== currentIndex ? currentIndex : prevIndex;
      });

      lastScrollTime.current = currentTime;
    });
  }, [type, calculateIndex, debounceTime]);

  const scrollToIndex = useCallback((index) => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const dimension = type === 'horizontal' 
      ? scrollContainer.clientWidth 
      : scrollContainer.clientHeight;

    const scrollOptions = {
      [type === 'horizontal' ? 'left' : 'top']: index * dimension,
      behavior: 'smooth'
    };

    scrollContainer.scrollTo(scrollOptions);
  }, [type]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    scrollContainer.addEventListener('scroll', handleScroll);
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      
      // Clean up potential pending animation frame
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [handleScroll]);

  return {scrollRef, activeIndex, scrollToIndex};
};