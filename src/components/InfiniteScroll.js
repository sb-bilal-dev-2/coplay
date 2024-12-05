import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShortVideo } from '../containers/ShortVideo';
import { VideoFrameForWord } from './VideoFrame';
import { Link } from 'react-router-dom';
import api from '../api';

const InfiniteScroll = ({
  items: initialItems = [],
  onLoadMore,
  renderItem,
  hasMore: externalHasMore = true,
  loading: externalLoading = false,
  loadingComponent,
  endMessage = "No more items to load",
  threshold = 0.1,
  rootMargin = '500px 0px'
}) => {
  const [items, setItems] = useState(initialItems);
  const loaderRef = useRef(null);

  // Update items when initialItems prop changes
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  // Memoize the intersection observer callback
  const handleObserver = useCallback((entries) => {
    const [target] = entries;
    if (target.isIntersecting && externalHasMore && !externalLoading) {
      onLoadMore?.();
    }
  }, [externalHasMore, externalLoading, onLoadMore]);

  // Set up the intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold,
      rootMargin,
    });

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [handleObserver, threshold, rootMargin]);

  const defaultRenderItem = (item, index) => (
    <div
      key={item.id || index}
      className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <h2 className="text-lg font-semibold text-gray-800">{item.title}</h2>
      <p className="text-gray-600 mt-2">{item.description}</p>
    </div>
  );

  const defaultLoadingComponent = (
    <div className="flex justify-center items-center py-4">
      <div className="w-6 h-6 border-2 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="space-y-4">
        {items.map((item, index) => (
          renderItem?.(item, index) || defaultRenderItem(item, index)
        ))}
      </div>

      {externalLoading && (loadingComponent || defaultLoadingComponent)}

      {!externalLoading && externalHasMore && (
        <div ref={loaderRef} className="h-10" />
      )}

      {!externalHasMore && items.length > 0 && (
        <p className="text-center text-gray-500 py-4">
          {endMessage}
        </p>
      )}
    </div>
  );
};

const ParentComponent = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    setLoading(true);
    try {
      const newItems = await fetchData(page); // Your API call
      console.log('newItems', newItems)
      setItems(prev => [...prev, ...newItems]);
      setPage(prev => prev + 1);
      setHasMore(newItems.length > 0);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    let wordCollections
    try {
      wordCollections = (await api().get('/wordCollections')).results
    } catch(err) {

    }
    return wordCollections
    // keywords = [
    //   { the_word: 'hello' },
    //   { the_word: 'other' },
    //   { the_word: 'consequence' },
    //   { the_word: 'dust' },
    //   { the_word: 'hustle' },
    // ]
    // return [{ id: 1, title: 'Acoomodations', description: 'description 1', keywords }, { id: 2, title: 'A2 Greetings', description: 'description 2', keywords }]
  }

  return (
    <div className="px-1">
      <InfiniteScroll
        items={items}
        onLoadMore={loadMore}
        hasMore={hasMore}
        loading={loading}
        renderItem={(item, index) => (
          <Link to={`/word_collection/${item.title}`}>
            <div key={item.id} className='flex p-1'>
              <div style={{ width: '44%', height: '80px' }}>
                {
                  item?.keywords && item.keywords[0] &&
                  <VideoFrameForWord word={item.keywords[0].the_word} />
                }
              </div>
              <div className='flex-1 pl-2'>
                <h5 className='text-left text-smx'>{item.title}</h5>
                <div className='text-xs'>{item.keywords.map((keyword) => keyword.the_word).join(', ')}</div>
              </div>
            </div>
          </Link>
        )}
      />
    </div>
  );
};

export default ParentComponent;