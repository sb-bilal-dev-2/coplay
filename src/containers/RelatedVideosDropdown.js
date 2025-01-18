
import React, { useEffect, useRef, useState } from 'react';
import { useOutsideAlerter } from '../components/useOutsideAlerter';
import InfiniteScroll, { InfiniteScrollOccurrences } from '../components/InfiniteScroll';
import ComposedInfiniteScroll from '../components/InfiniteScroll';
import api from '../api';
import { useDispatch, useSelector } from 'react-redux';
import { selectText } from '../store';
import { ShortVideo } from './ShortVideo';
import { degausser } from '../utils/degausser';
import HorizontalScrollMenu2 from '../components/HorizontalScrollMenu2';

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

const RadioButtons = ({ options = [], title, onChange, horizontal }) => {
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
      <h4>{title}</h4>
      <div className="space-y-3" style={{ display: 'flex' }}>
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

export const FilterDropdown = ({ isOpen, closeDropdown, onSubmit, sort_options, level_options, bookmark_options }) => {
  const outsideClickElementRef = useRef()
  const [selected_sort, set_selected_sort] = useState('Not Sorted')
  const [selected_bookmark, set_selected_bookmark] = useState([])
  const [selected_level, set_selected_level] = useState(['Intermediate', 'Advanced'])

  useOutsideAlerter(outsideClickElementRef, closeDropdown)
  const handleSubmit = (ev) => {
    // console.log('ev', ev)
    const result = { sort: selected_sort }
    if (selected_bookmark.length) { result.bookmark = selected_bookmark }
    if (selected_level.length) { result.level = selected_level }
    onSubmit(result, ev)
    closeDropdown()
  }
  useEffect(() => {
    handleSubmit()
  }, [])

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
            <form
              className="RadioButtons p-6 shadow-md rounded-lg max-w-md mx-auto"
            >

              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2">Sort By</h4>
                <div className="flex space-x-2">
                  {sort_options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => set_selected_sort(option.value)}
                      className="px-4 py-2 rounded-lg text-sm bg-white"
                      style={{
                        color: "#544",
                        border: selected_sort.includes(option.value) && "solid 2px var(--color-secondary)"
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bookmark Options */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2">Include Bookmarks</h4>
                <div className="flex space-x-2">
                  {bookmark_options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        const new_selected_bookmark = selected_bookmark.includes(option.value) ?
                          selected_bookmark.filter(sl => sl !== option.value) :
                          [...selected_bookmark, option.value]
                        set_selected_bookmark(new_selected_bookmark)
                      }}
                      className="px-4 py-2 rounded-full text-sm bg-white"
                      style={{
                        color: "#544",
                        border: selected_bookmark.includes(option.value) ? "solid 2px var(--color-secondary)" : "solid 2px white"
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* level Options */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Skill Level</h4>
                <div className="flex flex-wrap gap-2">
                  {level_options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        const new_selected_level = selected_level.includes(option.value) ?
                          selected_level.filter(sl => sl !== option.value) :
                          [...selected_level, option.value]
                        set_selected_level(new_selected_level)
                      }}
                      className="px-4 py-2 rounded-full text-sm bg-white"
                      style={{
                        color: "#544",
                        border: selected_level.includes(option.value) ? "solid 2px var(--color-secondary)" : "solid 2px white"
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  className="px-4 py-2 text-sm"
                  style={{ color: '#333' }}
                  onClick={closeDropdown}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 text-sm bg-indigo text-white rounded-lg">
                  Apply Filters
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export const WordInfoDropdown = ({ excludeOccurrence = { mediaTitle: '' } }) => {
  const dispatch = useDispatch()
  const selected_text = useSelector((state) => state.wordInfo.selected_text)
  const [wordInfo, setWordInfo] = useState()
  const [wordOccurrences, set_wordOccurrences] = useState()
  console.log('wordOccurrences', wordOccurrences)
  const outsideClickElementRef = useRef()
  console.log('selected_text', selected_text)
  const isOpen = !!selected_text.length
  useOutsideAlerter(outsideClickElementRef, () => dispatch(selectText('')))
  const request_wordInfo = async () => {
    try {
      const new_wordInfo = (await api().get(`/wordInfoLemma?mainLang=${'en'}&the_word=` + selected_text))
      console.log('new_wordInfo', new_wordInfo)
      setWordInfo(new_wordInfo)
    } catch (err) {

    }
  }
  const request_wordOccurrencess = async (selected_text) => {
    try {
      const new_wordOccurrences = (await api().get(`/occurances_v2?lemma=${selected_text}&limit=10`))
      console.log('new_wordOccurrences', new_wordOccurrences)
      const new_wordOccurrences_adjusted = new_wordOccurrences.filter(item => (item.mediaTitle !== excludeOccurrence.title))
      set_wordOccurrences(new_wordOccurrences)
    } catch (err) {

    }
  }

  useEffect(() => {
    request_wordInfo(selected_text)
    request_wordOccurrencess(selected_text)
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
            <h4 className="text-left">{selected_text + " " + "selected text translation"}</h4>
            <p>{wordInfo?.description}</p>
            <p>{wordInfo?.pronounciation}</p>
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                {(console.log('wordOccurrences', wordOccurrences), !!wordOccurrences.length) && (
                  <>
                    <span className="px-2" style={{ color: '#333', fontSize: '1em', fontWeight: 'bold' }}>
                      {/* <span>{wordInfo?.the_word}</span><span>{wordInfo?.translation && '- ' + wordInfo?.translation}</span> */}
                    </span>
                    <br />
                    <span>{wordInfo?.pronounciation}</span>
                    <HorizontalScrollMenu2 isActive items={wordOccurrences} baseRoute={"movie"} mainText={wordInfo?.the_word} />
                  </>
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RelatedVideosDropdown;