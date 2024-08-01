import React, { useState, useRef, useEffect } from "react";
import useRequests from "../useRequests";
import useAuthentication from "../containers/Authentication.util";
import { getUserLanguage } from "../helper/useLocationLanguage";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../store";
import { useRequestUserWordLists } from "../helper/useUserWords";

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
  learningLanguages,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const dropdownRef = useRef(null);
  const { putItems } = useRequests("users");
  const { user: userIdAndEmail } = useAuthentication();
  const [languageFromLocation, setLanguageFromLocation] = useState("");
  const resentlySignUp = localStorage.getItem("resentlySignUp");
  const dispatch = useDispatch();
  const [learningLanguagesList, setLearningLanguagesList] = useState(null);

  const user = useSelector((state) => state.user.user);
  console.log("get userwords", useRequestUserWordLists());

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
    let newUserInfo;

    if (name === "mainLanguage") {
      newUserInfo = { mainLanguage: option.iso };
      localStorage.setItem("mainLanguage", option.iso);
    }

    if (name === "learningLanguages") {
      newUserInfo = {
        learningLanguages: [...user.learningLanguages, option.iso],
      };
      localStorage.setItem("learningLanguage", option.iso);
    }

    console.log("new user", newUserInfo);
    putItems([
      {
        email: userIdAndEmail.email,
        _id: userIdAndEmail.id,
        ...newUserInfo,
      },
    ]);
  };

  const handleSwitch = (option) => {
    setSelectedOption(option);
    toggleDropdown();
  };

  useEffect(() => {
    if (learningLanguages) {
      const matchingLanguages = LANGUAGES.filter((language) =>
        user?.learningLanguages?.includes(language.iso)
      );

      setLearningLanguagesList(matchingLanguages);
    }
  }, [user]);

  const [addLanguageModal, setAddLanguageModal] = useState(false);
  const handleClose = () => {
    setAddLanguageModal(false);
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
        <ul className="absolute z-10  w-28 bg-black border border-none mt-1 rounded shadow-lg">
          {learningLanguages && user
            ? learningLanguagesList?.map((option) => (
                <li
                  key={option.id}
                  className="text-white px-4 py-2 hover:bg-transparent cursor-pointer transition-colors duration-150 ease-in-out flex items-center justify-between"
                  onClick={() => handleSwitch(option)}
                >
                  <span>{option.label}</span>
                  <img
                    alt="flag"
                    src={option.flag}
                    className="w-6 h-6 overflow-hidden rounded-full"
                  />
                </li>
              ))
            : LANGUAGES.map((option) => (
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

          {learningLanguages ? (
            <button
              className=" text-white w-full font-bold py-2 px-2"
              onClick={() => {
                setAddLanguageModal(true);
              }}
            >
              Add language
              <i class="fa-solid fa-plus px-1"></i>
            </button>
          ) : null}

          <ChooseLanguageModal
            handleClose={handleClose}
            show={addLanguageModal}
            learningLanguagesList={learningLanguagesList}
          />
        </ul>
      )}
    </div>
  );
};

function ChooseLanguageModal({ handleClose, show, learningLanguagesList }) {
  const { putItems } = useRequests("users");
  const user = useSelector((state) => state.user.user);
  const { user: userIdAndEmail } = useAuthentication();

  const addLanguage = (option) => {
    let newUserInfo;

    newUserInfo = {
      learningLanguages: [...user.learningLanguages, option.iso],
    };
    localStorage.setItem("learningLanguage", option.iso);

    putItems([
      {
        email: userIdAndEmail.email,
        _id: userIdAndEmail.id,
        ...newUserInfo,
      },
    ]);
  };

  const removeLanguage = (option) => {
    const updatedLanguages = user.learningLanguages.filter(
      (language) => language !== option.iso
    );

    const newUserInfo = {
      ...user,
      learningLanguages: updatedLanguages,
    };

    putItems([
      {
        email: userIdAndEmail.email,
        _id: userIdAndEmail.id,
        ...newUserInfo,
      },
    ]);
  };

  if (!show) return null;
  return (
    <div className="modal-overlay">
      <div className="modal bg-black text-white">
        <div className="modal-content">
          <h1 className="font-bold text-xl py-4">Choose new language</h1>
          <ul>
            {LANGUAGES.map((option) =>
              learningLanguagesList?.map((learningLanguage) => (
                <li
                  key={option.id}
                  className="text-white px-4 py-2 hover:bg-transparent cursor-pointer transition-colors duration-150 ease-in-out flex items-center justify-between"
                  onClick={() => alert("something")}
                >
                  <span>{option.label}</span>
                  <img
                    alt="flag"
                    src={option.flag}
                    className="w-6 h-6 overflow-hidden rounded-full"
                  />
                  {option.iso === learningLanguage.iso ? (
                    <div className="flex justify-between items-center">
                      <i class="fa-solid fa-check"></i>
                      <i
                        class="fa-solid fa-x"
                        onClick={() => removeLanguage(option)}
                      ></i>
                    </div>
                  ) : (
                    <i
                      class="fa-solid fa-plus"
                      onClick={() => addLanguage(option)}
                    ></i>
                  )}
                </li>
              ))
            )}
          </ul>
          <button
            className="font-bold bg-yellow-500 rounded-md text-white w-full text-center py-4 mt-4"
            onClick={() => handleClose()}
          >
            Let's start learn more!
          </button>
        </div>
      </div>
    </div>
  );
}

export default LanguageDropdown;
