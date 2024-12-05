
import React, { useRef, useState } from 'react';
import { useOutsideAlerter } from '../components/useOutsideAlerter';
import InfiniteScroll from '../components/InfiniteScroll';

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

const RadioButtons = ({ options, title, onChange }) => {
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
          <label
            key={index}
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
                <span className="w-2 h-2 rounded-full"></span>
              )}
            </span>
            <span className="text-gray-700 group-hover:text-blue-600">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export const FilterDropdown = ({ videos, isOpen, closeDropdown, options }) => {
  const outsideClickElementRef = useRef()

  useOutsideAlerter(outsideClickElementRef, closeDropdown)
  const handleChange = (value) => {
    console.log('Selected:', value);
  };

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
              options={options}
              title="Select an Option"
              onChange={handleChange}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default RelatedVideosDropdown;