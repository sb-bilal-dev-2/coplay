import React, { useEffect, useState } from "react";
import LanguageDropdown from "./LanguageDropdown";

export default function Onboarding() {
  const [show, setShow] = useState();
  const isResentlySignUped = localStorage.getItem("resentlySignUp");

  useEffect(() => {
    setShow(isResentlySignUped);
  }, [isResentlySignUped]);

  const handleCloseModal = () => {
    localStorage.removeItem("resentlySignUp");
    setShow(false);
  };

  const localMainLanguage = localStorage.getItem("mainLanguage");
  const learningLanguage = localStorage.getItem("learningLanguage");

  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal bg-black text-white">
        <div className="modal-content">
          <h1 className="font-bold text-xl py-4">
            Let's get more info about you
          </h1>
          <LanguageDropdown
            selectedLanguage={localMainLanguage ? localMainLanguage : undefined}
            title="Native language"
            withNameLanguage
            name="mainLanguage"
          />
          <LanguageDropdown
            selectedLanguage={learningLanguage ? learningLanguage : undefined}
            title="Learning language"
            withNameLanguage
            name="learningLanguages"
          />
          <button
            className="font-bold bg-yellow-500 rounded-md text-white w-full text-center py-4 mt-4"
            onClick={handleCloseModal}
          >
            Let's start learn more!
          </button>
        </div>
      </div>
    </div>
  );
}
