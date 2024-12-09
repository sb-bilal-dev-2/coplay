
import React, { useState, useRef, useEffect } from 'react';
import { GoBackButton, useWordColletionWordInfos } from './Quiz';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ShortVideo } from './ShortVideo';
import SecondaryButton from '../components/SecondaryButton';
import RelatedVideosDropdown, { FilterDropdown } from './RelatedVideosDropdown';
import { usePost } from './usePost';
import api from '../api';
import { WordCollectionCarousel } from './WordCollectionCarousel';

// Sample data - replace with your actual word collections

const WordCollection = () => {
    const navigate = useNavigate()
    const { list: listName, word: paramWord } = useParams();
    const [occuranceIndex, set_occuranceIndex] = useState()
    let [searchParams] = useSearchParams();
    const { wordOccurancesMap, wordList, set_practicingWordIndex, practicingWordIndex: playingWordIndex, currentWordInfo, currentWordOccurances, currentAvailableOccurancesLength, wordInfos } = useWordColletionWordInfos(listName, paramWord, searchParams.get('listType'), searchParams)
    const [loading, setLoading] = useState(false)
    // console.log('wordList', wordList)
    // console.log('currentWordOccurances', currentWordOccurances)
    const currentOccurance = currentWordOccurances[occuranceIndex]
    // console.log('currentWordOccurance[occuranceIndex]', currentOccurance)
    // console.log('occuranceIndex', occuranceIndex)

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
                        <ShortVideo
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
                />
            </div>
        </>
    )
}

export default WordCollection;