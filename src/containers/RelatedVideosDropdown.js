
import React, { useEffect, useRef, useState } from 'react';
import { useOutsideAlerter } from '../components/useOutsideAlerter';
import InfiniteScroll, { InfiniteScrollOccurrences } from '../components/InfiniteScroll';
import ComposedInfiniteScroll from '../components/InfiniteScroll';
import api from '../api';
import { useDispatch, useSelector } from 'react-redux';
import { selectText } from '../store';
import { ShortVideo } from './ShortVideo';
import { degausser } from '../utils/degausser';

const RelatedVideosDropdown = ({ videos, isOpen, closeDropdown }) => {
  const outsideClickElementRef = useRef()

  useOutsideAlerter(outsideClickElementRef, closeDropdown)

  return (
    <>
      {isOpen && (
        <div
          className="RelatedVideosBackdrop"
        >
          <div
            className="RelatedVideosMenu px-4 pt-4 overflow-scroll"
            ref={outsideClickElementRef}
          >
            <h4 className="text-left">More Videos</h4>
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
              <InfiniteScroll />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const RadioButtons = ({ options = [], title, onChange }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionChange = (value) => {
    setSelectedOption(value);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div
      className="RadioButtons p-6 shadow-md rounded-lg max-w-md mx-auto"
    >
      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionChange(option.value)}
            className="flex items-center cursor-pointer group"
          >
            <input
              type="radio"
              name="radio-group"
              value={option.value}
              checked={selectedOption === option.value}
              onChange={() => handleOptionChange(option.value)}
              className="hidden"
            />
            <span
              className={`
                w-5 h-5 mr-3 rounded-full border-2 flex items-center justify-center
                ${selectedOption === option.value
                  ? 'border-red-400'
                  : 'border-gray-300 group-hover:border-red-200'}
              `}
            >
              {selectedOption === option.value && (
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
              )}
            </span>
            <span style={{ color: '#787378', fontWeight: 'bold' }} className="group-hover:text-blue-600">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const FilterDropdown = ({ videos, isOpen, closeDropdown, onChange, sort_options, list_options, bookmark_options}) => {
  const outsideClickElementRef = useRef()

  useOutsideAlerter(outsideClickElementRef, closeDropdown)

  return (
    <>
      {isOpen && (
        <div
          className="RelatedVideosBackdrop"
        >
          <div
            className="RelatedVideosMenu px-4 pt-4 overflow-scroll"
            ref={outsideClickElementRef}
          >
            <RadioButtons
              options={list_options}
              title="Select an Option"
              onChange={onChange}
            />
          </div>
        </div>
      )}
    </>
  );
};

export const WordInfoDropdown = ({ the_word, closeDropdown }) => {
  const dispatch = useDispatch()
  const selected_text = useSelector((state) => state.wordInfo.selected_text)
  const [wordInfo, setWordInfo] = useState()
  const [wordOccurrence, set_wordOccurrence] = useState()
  console.log('wordOccurrence', wordOccurrence)
  const outsideClickElementRef = useRef()
  console.log('selected_text', selected_text)
  const isOpen = !!selected_text.length
  useOutsideAlerter(outsideClickElementRef, () => dispatch(selectText('')))
  const requestWordInfo = async () => {
    try {
      const newWordInfo = (await api().get(`/wordInfoLemma?mainLang=${'en'}&the_word=` + selected_text))
      console.log('newWordInfo', newWordInfo)
      setWordInfo(newWordInfo)
    } catch (err) {

    }
  }
  const requestWordOccurrences = async (selected_text) => {
    try {
      const newWordOccurrence = (await api().get(`/occurances_v2?lemma=${selected_text}&limit=10`))
      set_wordOccurrence(newWordOccurrence)
    } catch (err) {

    }
  }

  useEffect(() => {
    requestWordInfo(selected_text)
    requestWordOccurrences(selected_text)
  }, [selected_text])

  return (
    <>
      {isOpen && (
        <div
          className="RelatedVideosBackdrop"
        >
          <div
            className="RelatedVideosMenu px-4 pt-4 overflow-scroll"
            ref={outsideClickElementRef}
          >
            <h4 className="text-left">{selected_text}</h4>
            <p>{wordInfo?.description}</p>
            <p>{wordInfo?.pronounciation}</p>
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
              {/* <ComposedInfiniteScroll
                requestData={async () => (await api().get(`/occurances_v2?lemma=${selected_text}&limit=10`)).results}
                renderItem={(item) => (console.log('item', item),
                  <div key={item.id} className='flex p-1'>
                    <div style={{ width: '44%', height: '80px' }}>
                      <ShortVideo
                        mediaTitle={item.mediaTitle}
                        forcedCurrentTimeChange={item.startTime}
                        isActive
                      />
                    </div>
                    <div className='flex-1 pl-2' style={{ color: '#333'}}>
                      <h5 className='text-left text-smx' style={{ color: '#333'}}>{item.mediaTitle}</h5>
                      <div className='text-xs' style={{ color: '#333'}}>{degausser(item.text)}</div>
                    </div>
                  </div>
                )}
              /> */}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RelatedVideosDropdown;