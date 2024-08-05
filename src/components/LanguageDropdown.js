import React, { useState, useRef, useEffect } from "react";
import useRequests from "../useRequests";
import useAuthentication from "../containers/Authentication.util";
import { getUserLanguage } from "../helper/useLocationLanguage";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../store";
import { useTranslation } from "react-i18next";
import "./LanguageModal.css";

export const LANGUAGES = [
  { id: 0, label: "Uzbek", iso: "uz", flag: "./uzb.png" },
  { id: 1, label: "English", iso: "en", flag: "./USA.webp" },
  { id: 2, label: "Korean", iso: "ko", flag: "./korea.webp" },
  { id: 3, label: "China", iso: "zh", flag: "./china.png" },
];

export const APP_LANGUAGES = [
  { id: "en", iso: "en", label: "English" },
  { id: "uz", iso: "uz", label: "Uzbek" },
];

const findFormLanguagesList = (selectedLanguage) => {
  return LANGUAGES.find((lanuage) => lanuage.iso === selectedLanguage);
};

const LanguageDropdown = ({ selectedLanguage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const dropdownRef = useRef(null);
  const { putItems } = useRequests("users");
  const { user: userIdAndEmail } = useAuthentication();
  const [languageFromLocation, setLanguageFromLocation] = useState("");
  const resentlySignUp = localStorage.getItem("resentlySignUp");
  const dispatch = useDispatch();
  const [learningLanguagesList, setLearningLanguagesList] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const user = useSelector((state) => state.user.user);
  const { i18n, t } = useTranslation();

  useEffect(() => {
    const fetchLanguage = async () => {
      const userLanguage = await getUserLanguage();
      setLanguageFromLocation(userLanguage);
    };

    fetchLanguage();
  }, []);

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

  const localLearningLanguage = localStorage.getItem("learningLanguage");

  useEffect(() => {
    if (localLearningLanguage) {
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

  const handleOptionClick = (option, name) => {
    setIsOpen(false);
    chooseLanguage(option, name);
  };

  const chooseLanguage = (option, name) => {
    let newUserInfo;

    if (name === "mainLanguage") {
      newUserInfo = { mainLanguage: option.iso };
      localStorage.setItem("mainLanguage", option.iso);
      i18n.changeLanguage(option.iso);
    }

    if (name === "learningLanguages") {
      setSelectedOption(option);

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

  useEffect(() => {
    const matchingLanguages = LANGUAGES.filter((language) =>
      user?.learningLanguages?.includes(language.iso)
    );

    setLearningLanguagesList(matchingLanguages);
  }, [user]);

  const toggleModal = () => setShowModal(!showModal);

  return (
    <div ref={dropdownRef}>
      <div
        className="border border-none rounded cursor-pointer "
        onClick={() => toggleDropdown()}
      >
        {selectedOption ? (
          <div className="flex justify-between items-center">
            <img
              alt="flag"
              src={selectedOption.flag}
              className="w-6 h-6 rounded-full mr-1"
            />
            <span className="">{selectedOption.iso}</span>
            <i class="fas fa-chevron-down float-right px-1 text-sm"></i>
          </div>
        ) : (
          "Choose language"
        )}
      </div>

      {isOpen ? (
        <div className="language_modal absolute z-10 left-0 top-0 border border-none rounded shadow-lg bg-black p-6">
          <div className="flex justify-between items-center">
            <i
              class="fa-solid fa-x  cursor-pointer"
              onClick={() => toggleDropdown()}
            ></i>
            <span
              className="flex items-center bg-yellow-500 text-white py-1 px-2 rounded-full cursor-pointer"
              onClick={() => toggleModal()}
            >
              <i class="fa-solid fa-plus pr-2"></i> {t("add new languages")}
            </span>
          </div>

          <h1 className="font-bold text-white text-center">
            {t("add new language")}
          </h1>

          <div className="w-60 m-auto mt-10">
            <p className="font-bold mb-1 ">{t("learning")}:</p>
            {user
              ? learningLanguagesList?.map((option) => (
                  <li
                    key={option.id}
                    className={`${
                      selectedOption?.iso === option?.iso
                        ? "border-yellow-400"
                        : "border-gray-500"
                    } flex p-2 mt-4 border-2 rounded-xl cursor-pointer w-80`}
                    onClick={() =>
                      handleOptionClick(option, "learningLanguages")
                    }
                  >
                    <img
                      alt="flag"
                      src={option.flag}
                      className="w-6 h-6 overflow-hidden rounded-full mr-4"
                    />
                    <span>{option.label}</span>
                  </li>
                ))
              : null}
          </div>
        </div>
      ) : null}
      <ChooseLanguageModal
        show={showModal}
        toggleModal={toggleModal}
        handleOptionClick={handleOptionClick}
        selectedOption={selectedOption}
        t={t}
      />
    </div>
  );
};

function ChooseLanguageModal({
  show,
  toggleModal,
  handleOptionClick,
  selectedOption,
  t
}) {
  if (!show) return null;

  const mainLanguage = localStorage.getItem("mainLanguage");

  return (
    <div className="language_modal absolute z-10 left-0 top-0 border border-none rounded shadow-lg bg-black p-6">
      <i
        class="fa-solid fa-arrow-left float-left cursor-pointer"
        onClick={() => toggleModal()}
      ></i>
      <h1 className="font-bold text-white">{t("add new language")}</h1>

      <div className="w-60 m-auto mt-10">
        <p className="font-bold mb-2">{t("native language")}</p>
        <div className="py-2">
          {APP_LANGUAGES.map((option) => (
            <span
              key={option.iso}
              className={`${
                mainLanguage === option.iso
                  ? "border-yellow-400"
                  : "border-gray-500"
              } p-2 mr-4 border-2  rounded-xl cursor-pointer`}
              onClick={() => handleOptionClick(option, "mainLanguage")}
            >
              {option.label}
            </span>
          ))}
        </div>
      </div>

      <div className="w-60 m-auto mt-10">
        <p className="font-bold mb-1 ">{t("want to learn")}:</p>
        {LANGUAGES.map((option) => (
          <li
            key={option.id}
            className={`${
              selectedOption?.iso === option?.iso
                ? "border-yellow-400"
                : "border-gray-500"
            } flex p-2 mt-4 border-2 rounded-xl cursor-pointer w-80`}
            onClick={() => {
              handleOptionClick(option, "learningLanguages");
              toggleModal();
            }}
          >
            <img
              alt="flag"
              src={option.flag}
              className="w-6 h-6 overflow-hidden rounded-full mr-4"
            />
            <span>{option.label}</span>
          </li>
        ))}
      </div>
    </div>
  );
}

export default LanguageDropdown;
