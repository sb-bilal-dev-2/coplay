import React, { useState, useRef, useEffect } from "react";
import useRequests from "../useRequests";
import useAuthentication from "../containers/Authentication.util";
import { getUserLanguage } from "../helper/useLocationLanguage";

const LANGUAGES = [
  { id: 0, label: "Uzbek", iso: "uz", flag: "./uzb.png" },
  { id: 1, label: "English", iso: "en", flag: "./USA.webp" },
  { id: 2, label: "Korean", iso: "ko", flag: "./korea.webp" },
  { id: 3, label: "China", iso: "zh", flag: "./china.png" },
];

const findFormLanguagesList = (selectedLanguage) => {
  return LANGUAGES.find((lanuage) => lanuage.iso === selectedLanguage);
};

const LanguageDropdown = ({
  selectedLanguage,
  title,
  withNameLanguage, //boolean
  name, //"mainLanguage" or "learningLanguages"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const dropdownRef = useRef(null);
  const { putItems } = useRequests("users");
  const { user: userIdAndEmail } = useAuthentication();
  const [languageFromLocation, setLanguageFromLocation] = useState("");
  const resentlySignUp = localStorage.getItem("resentlySignUp");

  console.log("user", userIdAndEmail);
  useEffect(() => {
    const fetchLanguage = async () => {
      const userLanguage = await getUserLanguage();
      setLanguageFromLocation(userLanguage);
    };

    fetchLanguage();
  }, []);

  useEffect(() => {
    if (resentlySignUp && name === "mainLanguage") {
      localStorage.setItem("mainLanguage", languageFromLocation);
      const resultOfListLanguage = findFormLanguagesList(languageFromLocation);

      setSelectedOption(resultOfListLanguage);
    }
  }, [resentlySignUp, languageFromLocation]);

  useEffect(() => {
    if (selectedLanguage) {
      const findSelected = findFormLanguagesList(selectedLanguage);
      setSelectedOption(findSelected);
    }
  }, [selectedLanguage]);

  const localLearningLanguage = localStorage.getItem("learningLanguage");

   useEffect(() => {
     if (localLearningLanguage && name === "learningLanguages") {
       const findSelected = findFormLanguagesList(localLearningLanguage);
       setSelectedOption(findSelected);
     }
   }, [localLearningLanguage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    chooseLanguage(option, name);
  };

  const chooseLanguage = (option, name) => {
    console.log("handleUserInfo", option, name);
    let newUserInfo;

    if (name === "mainLanguage") {
      newUserInfo = { mainLanguage: option.iso };
      localStorage.setItem("mainLanguage", option.iso);
    }

    if (name === "learningLanguages") {
      //Todo: add other learning languages
      newUserInfo = { learningLanguages: [option.iso] };
      localStorage.setItem("learningLanguage", option.iso);
    }

    putItems([
      {
        email: userIdAndEmail.email,
        _id: userIdAndEmail.id,
        ...newUserInfo,
      },
    ]);
  };

  return (
    <div className="relative inline-block py-2" ref={dropdownRef}>
      {title ? <p className="font-bold px-2">{title}</p> : null}
      <div
        className="border border-none rounded px-2 cursor-pointer items-center flex"
        onClick={toggleDropdown}
      >
        {selectedOption ? (
          <div className="flex justify-between">
            {withNameLanguage ? (
              <span className="pr-3">{selectedOption.label}</span>
            ) : null}
            <img
              alt="flag"
              src={selectedOption.flag}
              className="w-6 h-6 overflow-hidden rounded-full"
            />
          </div>
        ) : (
          "Choose language"
        )}

        <i class="fas fa-chevron-down float-right px-1"></i>
      </div>
      {isOpen && (
        <ul className="absolute z-10  w-28 bg-black border border-none mt-1 rounded shadow-lg  ">
          {LANGUAGES.map((option) => (
            <li
              key={option.id}
              className="text-white px-4 py-2 hover:bg-transparent cursor-pointer transition-colors duration-150 ease-in-out flex items-center justify-between"
              onClick={() => handleOptionClick(option)}
            >
              <span>{option.label}</span>
              <img
                alt="flag"
                src={option.flag}
                className="w-6 h-6 overflow-hidden rounded-full"
              />
            </li>
          ))}
          {/* <li
            className="px-4 py-2 hover:bg-transparent cursor-pointer transition-colors duration-150 ease-in-out flex items-center justify-between"
            onClick={() => openModal()}
          >
            <span>Add language </span>
            <i class="fa-solid fa-plus"></i>
          </li> */}
        </ul>
      )}
    </div>
  );
};

export default LanguageDropdown;
