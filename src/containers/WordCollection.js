
import React, { useState, useRef, useEffect } from 'react';
import { GoBackButton, useWordColletionWordInfos } from './Quiz';
import { useParams, useSearchParams } from 'react-router-dom';
import { useScrolledItem } from '../utils/useScrolledItem';
import { ShortVideo } from './ShortVideo';
import { degausser } from '../utils/degausser';

// Sample data - replace with your actual word collections

const HorizontalScroll = ({ items, active, onIndexUpdate }) => {
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
    
    return (
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
                    style={{ scrollSnapAlign: 'center' }}
                    className="min-w-full w-full h-full flex items-center justify-center"
                >
                    <div
                        className={`
    p-4 rounded-lg text-lg 
    ${active && activeIndex === subCategoryIndex
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-black'}
  `}
                    >
                        {/* {innerItem?.mediaTitle}<br /> */}
                        {degausser(innerItem?.text)}
                    </div>
                </div>
            ))}
        </div>
    )
}

const WordCollectionCarousel = ({ items, innerItemsMap, onIndexUpdate, onInnerIndexUpdate, renderItems, renderInnerItems }) => {

    const [verticalScrollRef, activeCategory, scrollToCategory] = useScrolledItem('vertical');
    console.log('active', activeCategory)
    useEffect(() => {
        if (onIndexUpdate) {
            onIndexUpdate(activeCategory)
            onInnerIndexUpdate(0)
        }
    }, [activeCategory])

    return (
        <div
            className="w-full overflow-hidden"
            style={{ height: '60dvh' }}
        >
            {/* Vertical Carousel (Outer) */}
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
                        style={{ scrollSnapAlign: 'center' }}
                        className="w-full h-full flex flex-col items-center justify-center relative"
                    >
                        <h2 className="text-2xl font-bold mb-4">{item.the_word}</h2>

                        {/* Horizontal Carousel (Inner) */}
                        <HorizontalScroll
                            items={innerItemsMap[item.the_word]}
                            active={categoryIndex === activeCategory}
                            onIndexUpdate={onInnerIndexUpdate}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};



const WordCollection = () => {
    const { list: listName, word: paramWord } = useParams();
    const [occuranceIndex, set_occuranceIndex] = useState()
    let [searchParams] = useSearchParams();
    const { wordOccurancesMap, wordList, set_practicingWordIndex, practicingWordIndex: playingWordIndex, currentWordInfo, currentWordOccurances, currentAvailableOccurancesLength, wordInfos } = useWordColletionWordInfos(listName, paramWord, searchParams.get('listType'), searchParams)
    const [loading, setLoading] = useState(false)
    console.log('wordList', wordList)
    console.log('currentWordOccurances', currentWordOccurances)
    const currentOccurance = currentWordOccurances[occuranceIndex]
    console.log('currentWordOccurance[occuranceIndex]', currentOccurance)
    console.log('occuranceIndex', occuranceIndex)

    useEffect(() => {
        // set_isRelOpen(false)
        set_isFilterOpen(false)
    }, [listName])
    const [isFilterOpen, set_isFilterOpen] = useState(false);

    return (
        <>
            <GoBackButton />

            <div>
                <div style={{ width: '100%', height: '40dvh', background: '#111' }}>

                    {currentOccurance?.mediaTitle && !loading &&
                        < ShortVideo
                        // onTimeUpdate={handleTimeUpdate}
                        mediaTitle={currentOccurance?.mediaTitle}
                    forcedCurrentTimeChange={currentOccurance?.startTime / 1000}
                    isActive
                    />
                }
                </div>
                <WordCollectionCarousel
                    items={wordList}
                    innerItemsMap={wordOccurancesMap}
                    onIndexUpdate={set_practicingWordIndex}
                    onInnerIndexUpdate={(newIndex) => {
                        const nextTitle = currentWordOccurances[newIndex]
                        console.log('nextTitle', nextTitle)
                        console.log('currentOccurance?.mediaTitle', currentOccurance?.mediaTitle)
                        if (nextTitle?.mediaTitle !== currentOccurance?.mediaTitle) {
                            setLoading(true)
                        }
                        setTimeout(() => {
                            set_occuranceIndex(newIndex)
                            setLoading(false)
                        }, 10)
                    }}
                    // renderItem={(item) => {
                    //     return (
                    //         <div>
                    //             <span>{item.the_word}</span>
                    //             <span>{item.pronounciation}</span>
                    //         </div>
                    //     )
                    // }}
                    // renderInnerItem={(innerItem) => {
                    //     return (
                    //         <div>{innerItem.mediaTitle}</div>
                    //     )
                    // }}
                />
            </div>
        </>
    )
}

export default WordCollection;