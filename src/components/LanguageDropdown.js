import React, { useState, useRef, useEffect, useMemo } from "react";
import useRequests from "../useRequests";
import useAuthentication from "../containers/Authentication.util";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../store";
import { useTranslation } from "react-i18next";
import "./LanguageModal.css";

export const LANGUAGES = [
  // { id: 0, label: "Uzbek", iso: "uz", flag: "./uzb.png" },
  { id: 1, label: "English", iso: "en", flag: "./USA.webp" },
  { id: 2, label: "Korean", iso: "ko", flag: "./korea.webp" },
  { id: 3, label: "Chinese", iso: "zh-CN", flag: "./china.png" },
  { id: 3, label: "Turkish", iso: "tr", flag: "./country_flags/tr.svg" },
];

export const APP_LANGUAGES = [
  { id: "en", iso: "en", label: "English" },
  { id: "uz", iso: "uz", label: "O'zbekcha" },
  { id: "ru", iso: "ru", label: "Русский" },
  // { id: "tr", iso: "tr", label: "Türkçe" },
  // { id: "kz", iso: "kz", label: "Қазақ тілі" },
  // { id: "kz", iso: "kz", label: "Қазақ тілі" },
];

const findFormLanguagesList = (selectedLanguage) => {
  return LANGUAGES.find((lanuage) => lanuage.iso === selectedLanguage);
};

const LanguageDropdown = ({ selectedLanguage, afterLangChange }) => {
  const { i18n, t } = useTranslation();
  const dropdownRef = useRef(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [languageFromLocation, setLanguageFromLocation] = useState("");
  const [showModal, setShowModal] = useState(false);

  const dispatch = useDispatch();
  const { user: userIdAndEmail } = useAuthentication();
  const user = useSelector((state) => state.user.user);
  const { putItems } = useRequests("users");

  const resentlySignUp = localStorage.getItem("resentlySignUp");
  const localLearningLanguage = localStorage.getItem("learningLanguage");

  useEffect(() => {
    if (resentlySignUp) {
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

  useEffect(() => {
    if (localLearningLanguage) {
      const findSelected = findFormLanguagesList(localLearningLanguage);
      setSelectedOption(findSelected);
    }
  }, [localLearningLanguage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setShowModal(!showModal);
  const toggleModal = () => setShowModal(!showModal);

  const handleNativeLang = (option) => {
    let newUserInfo;

    newUserInfo = { mainLanguage: option.iso };

    localStorage.setItem("mainLanguage", option.iso);
    i18n.changeLanguage(option.iso);

    putItems([
      {
        email: userIdAndEmail.email,
        _id: userIdAndEmail.id,
        ...newUserInfo,
      },
    ]);

    dispatch(
      updateUser({
        ...user,
        mainLanguage: option.iso,
      })
    );
  };

  const handleLearningLang = (option) => {
    setSelectedOption(option);
    setShowModal(false);

    const token = localStorage.getItem("token")
    if (token) {
      if (user && user?.learningLanguages?.includes(option.iso)) {
        putItems([
          {
            email: userIdAndEmail.email,
            _id: userIdAndEmail.id,
            learningLanguages: [...user.learningLanguages, option.iso],
          },
        ]);

        dispatch(
          updateUser({
            ...user,
            learningLanguages: [...user.learningLanguages, option.iso],
          })
        );
      }
    }

    localStorage.setItem("learningLanguage", option.iso);

    if (afterLangChange) afterLangChange();
  };

  return (
    <div ref={dropdownRef}>
      <button
        className="border border-none rounded cursor-pointer px-2 mt-1"
        onClick={() => toggleDropdown()}
      >
        {selectedOption ? (
          <button className="flex justify-between items-center">
            <img
              alt="flag"
              src={selectedOption.flag}
              className="w-6 h-6 rounded-full mr-1"
            />
          </button>
        ) : (
          "Choose language"
        )}
      </button>
      <ChooseLanguageModal
        show={showModal}
        toggleModal={toggleModal}
        handleLearningLang={handleLearningLang}
        handleNativeLang={handleNativeLang}
        selectedOption={selectedOption}
        t={t}
      />
    </div>
  );
};

const ChooseLanguageModal = ({
  show,
  toggleModal,
  handleLearningLang,
  handleNativeLang,
  selectedOption,
  t,
}) => {
  const localMainLangugae = localStorage.getItem("mainLanguage");

  if (!show) return null;
  return (
    <div className="language_modal absolute z-10 left-0 top-0 border border-none rounded shadow-lg bg-black p-6">
      <i
        className="fa-solid fa-times float-left cursor-pointer"
        onClick={() => toggleModal()}
      ></i>
      <h1 className="font-bold text-white">{t("add new language")}</h1>

      <div className="m-auto mt-10" style={{ maxWidth: '280px' }}>
        <p className="text-gray-100 font-bold mb-2">{t("native language")}</p>
        <div className="py-2">
          {APP_LANGUAGES.map((option) => (
            <span
              key={option.iso}
              className={`${localMainLangugae === option.iso
                  ? "border-yellow-400"
                  : "border-gray-500"
                } p-2 mr-4 border-2 rounded-xl cursor-pointer`}
              onClick={() => handleNativeLang(option)}
            >
              {option.label}
            </span>
          ))}
        </div>
      </div>

      <div className="m-auto mt-10" style={{ maxWidth: '280px' }}>
        <p className="text-gray-100 font-bold mb-1 ">{t("want to learn")}</p>
        {LANGUAGES.map((option) => (
          <li key={option.id} className="list-none flex items-center">
            <button
              className={`${
                selectedOption.iso === option.iso
                  ? "border-yellow-400"
                  : "border-gray-500"
              } flex w-32 p-2 mt-4 border-2 rounded-xl cursor-pointer`}
              onClick={() => {
                handleLearningLang(option);
                toggleModal();
              }}
            >
              <img
                alt="flag"
                src={option.flag}
                className="w-6 h-6 overflow-hidden rounded-full mr-4"
              />
              <span>{option.label}</span>
            </button>
          </li>
        ))}
      </div>
    </div>
  );
};

export default LanguageDropdown;
