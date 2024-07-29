import React, { useEffect, useState } from "react";
import StickyHeader from "../components/StickyHeader";
import Footer from "../components/Footer";
import useAuthentication from "./Authentication.util";
import axios from "axios";
import "./Account.css";
import { BASE_SERVER_URL } from "../api";
import { useTranslation } from "react-i18next";
import LanguageDropdown from "../components/LanguageDropdown";

const Account = () => {
  const { user: userIdAndEmail } = useAuthentication();
  const [userInfo, setUserInfo] = useState(null);
  const { t, i18n } = useTranslation();

  const requestUserInfo = async () => {
    try {
      const response = await axios(`${BASE_SERVER_URL}/users/${userId}`);
      const newUserInfo = response.data;
      console.log("newUserInfo", newUserInfo);
      setUserInfo(newUserInfo);
    } catch (err) {
      console.log("ITEM GET ERROR: ", err);
    }
  };

  const userId = userIdAndEmail?.id;

  useEffect(() => {
    if (userId) {
      requestUserInfo();
    }
  }, [userId]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  
  const localMainLanguage = localStorage.getItem("mainLanguage");
  const learningLanguage = localStorage.getItem("learningLanguage");

  return (
    <>
      <StickyHeader />
      <div className="account_page bg-gray-900 h-screen">
        <div className="p-2 w-4/5 m-auto ">
          <h1 className="p-4 text-2xl">{t("account")}</h1>
          <div className="w-16 h-16 rounded-full border-2 border-gray-400 border-solid m-auto mb-6">
            <i class="fa-solid fa-user text-gray-400 text-center w-full h-full mt-6" />
          </div>
          <div className="bg-gray-700 m-auto p-2 rounded-md md:w-2/4 ">
            <div className="info m-10 flex">
              <i
                class="fa fa-envelope text-gray-400 p-4 text-2xl"
                aria-hidden="true"
              />
              <div>
                <span className="font-bold">{t("email")}</span>
                <p>{userInfo?.email}</p>
              </div>
            </div>
            {/* <div className="info m-10 flex">
              <i class="fa-solid fa-lock text-gray-400 p-4 text-2xl" />
              <div className="flex flex-col">
                <span className="font-bold">Password</span>
                <input type="password" value={"Password"} disabled />
              </div>
            </div> */}
            <div className="info m-10 flex">
              <i
                class="fa fa-language  text-gray-400 p-4 text-2xl"
                aria-hidden="true"
              />
              <div className="flex flex-col">
                <span className="font-bold">{t("language")}</span>
                <div className="flex">

                <LanguageDropdown
                  selectedLanguage={
                    localMainLanguage ? localMainLanguage : undefined
                  }
                  title="Native language"
                  withNameLanguage
                  name="mainLanguage"
                />
                <LanguageDropdown
                  selectedLanguage={
                    learningLanguage ? learningLanguage : undefined
                  }
                  title="Learning language"
                  withNameLanguage
                  name="learningLanguages"
                />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Account;
