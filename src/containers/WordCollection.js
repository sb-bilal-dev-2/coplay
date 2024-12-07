
import React, { useState, useRef, useEffect } from 'react';
import { GoBackButton, useWordColletionWordInfos } from './Quiz';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useScrolledItem } from '../utils/useScrolledItem';
import { ShortVideo } from './ShortVideo';
import { degausser } from '../utils/degausser';
import SecondaryButton from '../components/SecondaryButton';
import RelatedVideosDropdown, { FilterDropdown } from './RelatedVideosDropdown';
import { usePost } from './usePost';
import api from '../api';

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
                    rounded-full transition-all duration-300 ease-in-out
                    ${startIndex + index === activeIndex
                                    ? 'w-10 h-3 bg-indigo-500'
                                    : 'w-3 h-3 bg-gray-300'}
                  `}
                            style={{
                                transform: `scale(${scale})`,
                                opacity: opacity
                            }}
                        />
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

const WordCollectionCarousel = ({ items, innerItemsMap, onIndexUpdate, onInnerIndexUpdate, lastItem }) => {

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
                style={{ width: '2px', height: progress * 100 + '%' }}
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
            </div>
        </div>
    );
};



const WordCollection = () => {
    const navigate = useNavigate()
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
        set_isRelOpen(false)
        set_isFilterOpen(false)
    }, [listName])

    const [isRelOpen, set_isRelOpen] = useState(false);
    const [isFilterOpen, set_isFilterOpen] = useState(false);
    const [bookmarkedAll, set_bookmarkedAll] = useState(false);

    const handleBookmark = async () => {
        if (!localStorage.getItem('token')) {
            console.log('fffff')
            return navigate('/auth/login')
        }
        set_bookmarkedAll(true)
        try {
            await api().post("/self_words", wordList.map((item) => {
                return {
                    the_word: item.the_word,
                    repeatCount: 0,
                    repeatTime: Date.now(),
                }
            }))
        } catch (err) {
            console.log('await api().post')
            set_bookmarkedAll(false)
        }
    }
    const handleUnbookmark = async () => {
        if (!localStorage.getItem('token')) {
            return navigate('/auth/login')
        }
        set_bookmarkedAll(false)
        try {
            await api().post("/self_words", wordList.map((item) => {
                return {
                    the_word: item.the_word,
                    repeatCount: 0,
                    archieved: true,
                    repeatTime: Date.now(),
                }
            }))
        } catch (err) {
            set_bookmarkedAll(true)
        }
    }

    return (
        <>
            <GoBackButton />
            <FilterDropdown
                isOpen={isFilterOpen}
                closeDropdown={() => set_isFilterOpen(false)}
                options={[
                    { label: 'Easiest', value: 'Easiest' },
                    { label: 'Hardest', value: 'Hardest' },
                    { label: 'Bookmarks', value: 'Bookmarks' },
                    { label: 'All New', value: 'All New' }
                ]}
                onChange={(option) => { }}
            />
            <RelatedVideosDropdown
                isOpen={isRelOpen}
                closeDropdown={() => set_isRelOpen(false)}
                videos={[]}
            />

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
                    lastItem={(
                        <div
                            className="flex flex-col items-center justify-center relative h-full"
                            style={{
                                margin: '8px',
                                border: '2px solid orange',
                                borderRadius: '12px'
                            }}
                        >
                            <div
                                className="absolute left-4 top-4 select-none"
                            >
                                {bookmarkedAll ?
                                    <button><i onClick={handleUnbookmark} className="fa-solid fa-bookmark text-red"></i></button>
                                    :
                                    <button><i onClick={handleBookmark} className="fa-regular fa-bookmark text-red"></i></button>
                                }
                                {" "}
                                {listName.replaceAll("_", " ")}
                            </div>
                            <h2 className="text-2xl font-bold mb-4 text-green-500">{'Keep it up!'}</h2>
                            <div className='grid grid-flow-col items-center gap-2'>
                                <SecondaryButton
                                    button
                                    title={"GET MORE"}
                                    onClick={() => set_isRelOpen(true)}
                                ></SecondaryButton>
                            </div>
                            {/* Horizontal Carousel (Inner) */}
                            {/* <HorizontalScroll
                                items={innerItemsMap[item.the_word]}
                                active={categoryIndex === activeCategory}
                                onIndexUpdate={onInnerIndexUpdate}
                            /> */}
                        </div>
                    )}
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