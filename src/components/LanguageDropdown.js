import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
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
  const { i18n, t } = useTranslation();
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
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
    setIsOpen(false);

    let newUserInfo;

    newUserInfo = {
      learningLanguages: [...user.learningLanguages, option.iso],
    };

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
        learningLanguages: [...user.learningLanguages, option.iso],
      })
    );

    localStorage.setItem("learningLanguage", option.iso);
  };

  const handleLangLocal = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    localStorage.setItem("learningLanguage", option.iso);
  }

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
            <i class="fas fa-chevron-down float-right px-1 text-sm"></i>
          </div>
        ) : (
          "Choose language"
        )}
      </div>

      {isOpen ? (
        !user ? (
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
              <LearningLanguages
                selectedOption={selectedOption}
                handleLearningLang={handleLearningLang}
              />
            </div>
          </div>
        ) : (
          <div className="language_modal absolute z-10 left-0 top-0 border border-none rounded shadow-lg bg-black p-6">
            <div className="flex justify-between items-center">
              <i
                class="fa-solid fa-x  cursor-pointer"
                onClick={() => toggleDropdown()}
              ></i>
            </div>
            <div className="w-60 m-auto mt-10">
              <p className="font-bold mb-1 ">{t("want to learn")}:</p>
              {LANGUAGES.map((option) => (
                <li
                  key={option.id}
                  className={`${
                    localLearningLanguage === option.iso
                      ? "border-yellow-400"
                      : "border-gray-500"
                  } flex p-2 mt-4 border-2 rounded-xl cursor-pointer w-80`}
                  onClick={() => handleLangLocal(option)}
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
        )
      ) : null}

      <ChooseLanguageModal
        show={showModal}
        toggleModal={toggleModal}
        handleLearningLang={handleLearningLang}
        handleNativeLang={handleNativeLang}
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
  t,
}) => {
  const user = useSelector((state) => state.user.user);
  const localMainLangugae = localStorage.getItem("mainLanguage");
  console.log("mainLanguage", localMainLangugae);

  const filteredLanguages = useMemo(() => {
    return LANGUAGES.filter(
      (lang) => !user?.learningLanguages?.includes(lang.iso)
    );
  }, [user?.learningLanguages]);

  if (!show) return null;

  return (
    <div className="language_modal absolute z-10 left-0 top-0 border border-none rounded shadow-lg bg-black p-6">
      <i
        className="fa-solid fa-arrow-left float-left cursor-pointer"
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
                localMainLangugae === option.iso
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

      <div className="w-60 m-auto mt-10">
        <p className="font-bold mb-1 ">{t("want to learn")}:</p>
        {filteredLanguages.map((option) => (
          <li key={option.id} className="list-none flex items-center">
            <div
              className={`flex p-2 mt-4 border-2 rounded-xl cursor-pointer w-80`}
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
            </div>
          </li>
        ))}
      </div>
    </div>
  );
};

const LearningLanguages = ({ selectedOption, handleLearningLang }) => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const { user: userIdAndEmail } = useAuthentication();
  const { putItems } = useRequests("users");

  const languageItem = useMemo(() => {
    return LANGUAGES.filter((lang) =>
      user?.learningLanguages?.includes(lang.iso)
    );
  }, [user.learningLanguages]);

  const handleDelete = useCallback(
    (option) => {
      const newLearningLanguages = user.learningLanguages.filter(
        (iso) => iso !== option.iso
      );

      putItems([
        {
          email: userIdAndEmail.email,
          _id: userIdAndEmail.id,
          learningLanguages: newLearningLanguages,
        },
      ]);

      dispatch(
        updateUser({ ...user, learningLanguages: newLearningLanguages })
      );
    },
    [user, userIdAndEmail, dispatch, putItems]
  );

  return (
    <>
      {languageItem.map((option) => (
        <li key={option.id} className="list-none flex items-center h-auto">
          <div
            className={`${
              selectedOption?.iso === option?.iso
                ? "border-yellow-400"
                : "border-gray-500"
            } flex p-2 mt-4 border-2 rounded-xl cursor-pointer w-80`}
            onClick={() => handleLearningLang(option)}
          >
            <img
              alt="flag"
              src={option.flag}
              className="w-6 h-6 overflow-hidden rounded-full mr-4"
            />
            <span>{option.label}</span>
          </div>
          <i
            class="fa-solid fa-x cursor-pointer p-2 mt-2"
            onClick={() => handleDelete(option)}
          ></i>
        </li>
      ))}
    </>
  );
};

export default LanguageDropdown;
