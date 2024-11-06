import React, { useState, useEffect, useRef } from 'react';

const InfiniteScroll = ({ items = [], onLoadMore }) => {
//   const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  // Simulate fetching data from an API
  const fetchData = async () => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate dummy items (replace this with your API call)
      const newItems = Array.from({ length: 10 }, (_, i) => ({
        id: (page - 1) * 10 + i + 1,
        title: `Item ${(page - 1) * 10 + i + 1}`,
        description: `Description for item ${(page - 1) * 10 + i + 1}`
      }));
    //   onLoadMore()
    //   setItems(prev => [...prev, ...newItems]);
    //   setHasMore(page < 5); // Stop after 5 pages in this example
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '500px 0px', // Start loading 200px before the element comes into view
       }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, loading]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Infinite Scroll Example</h1>
      
      <div className="space-y-4">
        {items.map(item => (
          <div
            key={item.id}
            className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <h2 className="text-lg font-semibold text-gray-800">{item.title}</h2>
            <p className="text-gray-600 mt-2">{item.description}</p>
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className="w-6 h-6 border-2 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
        </div>
      )}

      {!loading && hasMore && (
        <div ref={loaderRef} className="h-10" />
      )}

      {!hasMore && (
        <p className="text-center text-gray-500 py-4">
          No more items to load
        </p>
      )}
    </div>
  );
};

export default InfiniteScroll;