
import React, { useState, useRef, useEffect } from 'react';

import { degausser } from '../utils/degausser';
import { useScrolledItem } from '../utils/useScrolledItem';


export const HorizontalScroll = ({ items, active, onIndexUpdate }) => {
    const [horizontalScrollRefs, activeIndex, scrollToSubCategory] = useScrolledItem('horizontal');

    useEffect(() => {
        if (!active) {
            scrollToSubCategory(0)
        }
    }, [active])

    useEffect(() => {
        if (activeIndex) {
            onIndexUpdate(activeIndex)
        }
    }, [activeIndex])

    const renderDots = (dots) => {
        const totalDots = dots?.length;
        const maxVisibleDots = 5;

        // Calculate start and end indices for visible dots
        let startIndex = Math.max(0, Math.min(activeIndex - 2, totalDots - maxVisibleDots));
        let endIndex = Math.min(startIndex + maxVisibleDots, totalDots);

        // Create an array of visible dots
        const visibleDots = dots?.slice(startIndex, endIndex);

        return (
            <div className="flex justify-center items-center space-x-2 my-2">
                {visibleDots?.map((item, index) => {
                    // Calculate the absolute distance from the active dot
                    const absoluteDistance = Math.abs(startIndex + index - activeIndex);

                    // More nuanced scaling approach
                    let scale = 1;
                    let opacity = 1;

                    switch (absoluteDistance) {
                        case 0:  // Active dot
                            scale = 1;
                            break;
                        case 1:  // Immediately adjacent dots
                            scale = 0.9;
                            break;
                        case 2:  // Outer dots
                            scale = 0.7;
                            opacity = 0.8;
                            break;
                        default:
                            scale = 0.5;
                            opacity = 0.6;
                    }

                    return (
                        <div
                            key={item?.id || `dot-${startIndex + index}`}
                            className={`
                    relative rounded-full transition-all duration-300 ease-in-out
                    ${startIndex + index === activeIndex
                                    ? 'w-5 h-3 bg-indigo-500'
                                    : 'w-3 h-3 bg-gray-300'}
                  `}
                            style={{
                                transform: `scale(${scale})`,
                                opacity: opacity
                            }}
                        >
                            {startIndex + index === activeIndex && (
                                <button className="absolute" style={{ fontSize: "8px", color: 'white', padding: '1.5px 7px'}}>
                                    <i className="fa-solid fa-play"></i>
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <>
            {renderDots(items)}
            <div
                ref={horizontalScrollRefs}
                className="horizontal-carousel no-scrollbar w-full h-[400px] overflow-x-scroll scroll-smooth snap-x snap-mandatory"
                style={{
                    scrollSnapType: 'x mandatory',
                    display: 'flex',
                    // overscrollBehavior: 'contain'
                }}
            >
                {items?.map((innerItem, subCategoryIndex) => (
                    <div
                        key={innerItem?.id}
                        style={{
                            scrollSnapAlign: 'center',
                            scrollSnapStop: 'always',
                        }}
                        className="min-w-full w-full h-full flex items-center justify-center"
                    >
                        <div
                            className={`
    p-4 rounded-lg text-lg 
    ${active && activeIndex === subCategoryIndex
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-gray-200 text-black'}
  `}
                        >
                            {/* {innerItem?.mediaTitle}<br /> */}
                            {degausser(innerItem?.text)}
                        </div>
                    </div>
                ))}
            </div>
        </>

    )
}

export const WordCollectionCarousel = ({ items, innerItemsMap, onIndexUpdate, onInnerIndexUpdate, lastItem }) => {

    const [verticalScrollRef, activeCategory, scrollToCategory] = useScrolledItem('vertical', { itemDimention: 85 / 100, itemMargin: 8 });
    console.log('active', activeCategory)
    useEffect(() => {
        if (onIndexUpdate) {
            onIndexUpdate(activeCategory)
            onInnerIndexUpdate(0)
        }
    }, [activeCategory])

    const progress = activeCategory / items.length

    return (
        <div
            className="w-full overflow-hidden relative"
            style={{
                height: '60dvh',
            }}
        >
            {/* Vertical Carousel (Outer) */}
            <div
                style={{ width: '2px', height: progress * 100 + '%', borderRadius: '0 0 2px 2px'}}
                className="bg-red-500 absolute left-0 transition-all duration-300 ease-in-out"
            />
            <div
                ref={verticalScrollRef}
                className="w-full h-full no-scrollbar overflow-y-scroll scroll-smooth snap-y snap-mandatory"
                style={{
                    scrollSnapType: 'y mandatory',
                    overflowX: 'hidden',
                    overscrollBehavior: 'contain'
                }}
            >
                {items.map((item, categoryIndex) => (
                    <div
                        key={item.the_word}
                        style={{
                            scrollSnapAlign: 'center',
                            scrollSnapStop: 'always',
                            height: '85%',
                        }}
                    >
                        <div
                            className="pl-2 pr-2 flex flex-col items-center justify-center relative h-full"
                            style={{
                                margin: '8px',
                                border: '2px solid orange',
                                borderRadius: '12px'
                            }}
                        >
                            {/* <div
                                className="absolute left-4 top-4 select-none"
                            >
                                <button><i className="fa-regular fa-bookmark text-gray-900 bold"></i></button>{" "}
                            </div> */}
                            <h2 className="text-2xl font-bold mb-4">{item.the_word}</h2>

                            {/* Horizontal Carousel (Inner) */}
                            <HorizontalScroll
                                items={innerItemsMap[item.the_word]}
                                active={categoryIndex === activeCategory}
                                onIndexUpdate={onInnerIndexUpdate}
                            />
                        </div>
                    </div>
                ))}
                {!!items.length &&
                    <div
                        style={{
                            scrollSnapAlign: 'center',
                            scrollSnapStop: 'always',
                            height: '85%',
                            marginBottom: '8px'
                        }}
                    >
                        {lastItem}
                    </div>
                }
            </div>
        </div>
    );
};
