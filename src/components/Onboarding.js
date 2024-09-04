import React, { useEffect, useState } from "react";
import { APP_LANGUAGES, LANGUAGES } from "./LanguageDropdown";
import { useTranslation } from "react-i18next";
import "./LanguageModal.css";
import { motion } from "framer-motion";
import useAuthentication from "../containers/Authentication.util";
import useRequests from "../useRequests";
import { updateUser } from "../store";
import { useDispatch, useSelector } from "react-redux";
import { useRequestUserWordLists } from "../helper/useUserWords";

export default function Onboarding() {
  const [show, setShow] = useState();
  const isResentlySignUped = localStorage.getItem("resentlySignUp");
  const { i18n, t } = useTranslation();
  const [step, setStep] = useState(0);
  const { user: userIdAndEmail } = useAuthentication();
  const { getUserWords } = useRequestUserWordLists();
  const { putItems } = useRequests("users");
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  const nextStep = () => setStep((prevStep) => Math.min(prevStep + 1, 2));
  const prevStep = () => setStep((prevStep) => Math.max(prevStep - 1, 0));

  useEffect(() => {
    if (!user) {
      getUserWords();
    }
  }, []);

  const handleLearningLanguage = (option) => {
    let newUserInfo;

    newUserInfo = {
      learningLanguages: [option.iso],
    };

    putItems([
      {
        email: userIdAndEmail.email,
        _id: userIdAndEmail.id,
        ...newUserInfo,
      },
    ]);

    dispatch(updateUser({ ...user, learningLanguages: [option.iso] }));

    localStorage.setItem("learningLanguage", option.iso);
  };

  const handleNativeLanguage = (option) => {
    let newUserInfo;

    newUserInfo = { ...user, mainLanguage: option.iso };

    putItems([
      {
        email: userIdAndEmail.email,
        _id: userIdAndEmail.id,
        ...newUserInfo,
      },
    ]);

    dispatch(updateUser(newUserInfo));

    i18n.changeLanguage(option.iso);
    localStorage.setItem("mainLanguage", option.iso);
  };

  useEffect(() => {
    setShow(isResentlySignUped);
  }, [isResentlySignUped]);

  const handleCloseModal = () => {
    setShow(false);

    localStorage.removeItem("resentlySignUp");
  };

  const localMainLanguage = localStorage.getItem("mainLanguage");
  const learningLanguage = localStorage.getItem("learningLanguage");

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-4 text-yellow-500">
              Welcome to CoPlay
            </h2>
            <p className="text-xl text-green-500">
              Your interactive learning platform
            </p>
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 mx-auto mt-10"
          >
            <p className="font-bold mb-2 text-white">{t("native language")}</p>
            <div className="py-2">
              {APP_LANGUAGES.map((option) => (
                <span
                  key={option.iso}
                  className={`${
                    localMainLanguage === option.iso
                      ? "border-yellow-500"
                      : "border-gray-500"
                  } inline-block p-2 mr-4 border-2 rounded cursor-pointer hover:bg-orange-400 hover:text-white transition-colors`}
                  onClick={() => handleNativeLanguage(option)}
                >
                  {option.label}
                </span>
              ))}
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 mx-auto mt-10"
          >
            <p className="font-bold mb-1 text-white">{t("want to learn")}:</p>
            <ul>
              {LANGUAGES.map((option) => (
                <li
                  key={option.id}
                  className={`${
                    learningLanguage === option.iso
                      ? "border-yellow-500"
                      : "border-gray-500"
                  } flex items-center p-2 mt-4 border-2 border-gray-400 rounded cursor-pointer  hover:text-white transition-colors`}
                  onClick={() => handleLearningLanguage(option)}
                >
                  <img
                    alt="flag"
                    src={option.flag}
                    className="w-6 h-6 overflow-hidden rounded-full mr-4"
                  />
                  <span>{option.label}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        );
      default:
        return null;
    }
  };

  if (!show) return null;

  return (
    <div className="z-50 min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="h-2 bg-gray-700 rounded-full">
            <div
              className="h-full bg-green-400 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${(step + 1) * 33.33}%` }}
            ></div>
          </div>
        </div>

        {renderStep()}

        <div className="mt-8 flex justify-between">
          {step > 0 && (
            <button
              onClick={prevStep}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Previous
            </button>
          )}
          {step < 2 && (
            <button
              onClick={nextStep}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-400 transition-colors ml-auto"
            >
              Next
            </button>
          )}
          {step === 2 && (
            <button
              onClick={() => handleCloseModal()}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-400 transition-colors ml-auto"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
