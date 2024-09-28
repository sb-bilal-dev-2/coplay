import React, { useState, useEffect, useRef } from "react";
import "./StickyHeader.css";
import { Link, useLocation } from "react-router-dom";
import { useOutsideAlerter } from "./useOutsideAlerter";
import useAuthentication from "../containers/Authentication.util";
import { BASE_SERVER_URL } from "../api";
import { useTranslation } from "react-i18next";
import LanguageDropdown from "./LanguageDropdown";
import { useDynamicReducer } from "../dynamicReducer";
import { googleLogout } from "@react-oauth/google";
import api from "../api";
import { useSelector } from "react-redux";
import HorizontalScrollMenu from "./HorizontalScrollMenu";

const StickyHeader = ({ type = "primary", authPage }) => {
  const { t } = useTranslation();
  const outsideSearchClickWrapperRef = useRef(null);
  const loggedIn = localStorage.getItem("token");
  const [isNavMenuVisible, setIsNavMenuVisible] = useState(false);
  const isSticky = useSticky();
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState("");
  // useOutsideAlerter(outsideSearchClickWrapperRef, () => setSearching(false));

  const { items: videoItems, getItems: getVideos } =
    useDynamicReducer("movies");
  const { items: wordCollections, getItems: getWordCollections } = useDynamicReducer("wordCollections");

  const filterByLabel = (items) => {
    return items?.filter((item) =>
      item?.label?.toLowerCase().startsWith(search.toLowerCase()) || item?.title?.toLowerCase().includes(search.toLowerCase())
    );
  };
  const filteredVideos = filterByLabel(videoItems)
  const filtered_wordCollections = filterByLabel(wordCollections)

  const location = useLocation();
  const isPricePage = location.pathname.includes("price_page");
  const learningLanguage = localStorage.getItem("learningLanguage");

  return (
    <header
      className={`sticky-header ${isSticky || searching ? "nav-menu-visible" : ""
        } ${type}`}
    >
      <Link to="/" className="relative min-h-max min-w-max">
        <img
          class="h-14 w-14"
          src="logo-black.png"
          alt="C Play logo placeholder"
        />
      </Link>
      <div class="flex items-center">
        {!authPage && (
          <>
            {searching ? (
              <div className="searchInputContainer mr-2">
                <input
                  value={search}
                  autoFocus
                  ref={outsideSearchClickWrapperRef}
                  onChange={(ev) => setSearch(ev.target.value)}
                />
                <button
                  className="text-gray-150 float-right pointer"
                  onClick={() => {
                    setSearching(!searching);
                    setSearch("");
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
                <div className={`search-container ${searching ? "show" : ""}`}>
                  <h3>Vidoes</h3>
                  {!!filteredVideos.length &&
                    <HorizontalScrollMenu items={filteredVideos} baseRoute={"movie"} />
                  }
                  <h3>Collections</h3>
                  {!!filtered_wordCollections.length && 
                    <HorizontalScrollMenu items={filtered_wordCollections} baseRoute={"quiz"} />
                
                  }
                </div>
              </div>
            ) : (
              <button
                className="text-gray-150 mr-4 ml-6 pointer"
                onClick={() => setSearching(!searching)}
              >
                <i className="fas fa-search"></i>
              </button>
            )}
            {/* 
            //TODO: return if buy premium is needed
            {!isPricePage ? (
              <Link
                to="/price_page"
                className="font-bold p-2 min-h-max min-w-max mr-2 hide_in_mobile"
              >
                Buy premium <i class="fa-solid fa-crown text-yellow-400"></i>
              </Link>
            ) : null}
            */}

            <LanguageDropdown
              selectedLanguage={learningLanguage ? learningLanguage : "en"}
              afterLangChange={() => (getVideos(), getWordCollections())}
            />

            <div className="user-menu">
              {loggedIn ? (
                <div className="flex items-center">
                  <Link to="/my_list" className="relative">
                    {/* <i class="fa-solid fa-book-bookmark m-2 text-xl hover:text-orangered" /> */}
                    <i class="fa-brands fa-font-awesome m-2 text-xl" />
                  </Link>
                  <UserNav
                    setIsNavMenuVisible={setIsNavMenuVisible}
                    isNavMenuVisible={isNavMenuVisible}
                  />
                </div>
              ) : (
                <button>
                  <Link to="/auth/login">
                    <b>{t("login")}</b>
                  </Link>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};

function getPlaceholderUrl(firstLetter) {
  const colors = {
    A: "cc3333", // Light Red
    B: "33cc33", // Light Green
    C: "3333cc", // Light Blue
    D: "cccc33", // Light Yellow
    E: "cc33cc", // Light Magenta
    F: "33cccc", // Light Cyan
    // Add more mappings for other letters as needed
  };

  const defaultColor = colors.D;

  const color = colors[firstLetter.toUpperCase()] || defaultColor;

  return `https://placehold.co/32x32/${color}/ffffff.png?text=${firstLetter}`;
}

const UserNav = ({ isNavMenuVisible, setIsNavMenuVisible }) => {
  const { t } = useTranslation();
  const { user: userIdAndEmail } = useAuthentication();
  const userEmail = userIdAndEmail?.email || "";
  const emailLetters = userEmail.match(/[A-Z]/gi) || [];
  const firstLetter =
    (!!emailLetters?.length && emailLetters[0]?.toUpperCase()) || "";
  const avatarPath = getPlaceholderUrl(firstLetter);
  const outsideNavClickWrapperRef = useRef(null);
  const isTelegramConnected = useSelector(
    (state) => state.user?.user?.isTelegramConnected
  );

  console.log("isTelegramConnected", isTelegramConnected);
  useOutsideAlerter(outsideNavClickWrapperRef, () =>
    setIsNavMenuVisible(false)
  );

  const handleLogout = () => {
    const isGoogleOuth = localStorage.getItem("googleOuth");

    if (isGoogleOuth) {
      googleLogout();
    }

    localStorage.removeItem("token");
  };

  // const location = useLocation();
  // const isPricePage = location.pathname.includes("price_page");

  const _Id = userIdAndEmail?.id;
  const generateConnectionCode = async () => {
    try {
      const response = await api().post("/api/generate-telegram-code", {
        _Id,
      });

      window.location.href = response.data.telegramLink;
    } catch (error) {
      console.error("Error generating connection code:", error);
    }
  };

  return (
    <div ref={outsideNavClickWrapperRef}>
      <img class="h-8 ml-4" src={avatarPath} alt="User avatar placeholder" onClick={() => setIsNavMenuVisible(!isNavMenuVisible)} />
      {isNavMenuVisible && (
        <ul className="nav-menu">
          <li>
            {" "}
            <Link to="/account">
              <i class="fa-solid fa-user text-gray-400 m-2" />
              <b>{t("account")}</b>
            </Link>
          </li>
          <li>
            <button onClick={handleLogout}>
              <i class="fa-solid fa-door-open text-gray-400  m-2" />
              <b>{t("sign out")}</b>
            </button>
          </li>
          {!isTelegramConnected && (
            <li className="list-none">
              <button className="flex" onClick={() => generateConnectionCode()}>
                <img
                  src="/tg-bot-img.png"
                  width={30}
                  height={30}
                  alt="tg-bot-img"
                />
                <b>{t("connect to telegram")}</b>
              </button>
            </li>
          )}

          {/*
          //TODO: Return if project has payment
          <li className="hide_link show_in_mobile">
            <Link
              to="/price_page"
              className="font-bold p-2 min-h-max min-w-max mr-2"
            >
              Buy premium <i class="fa-solid fa-crown text-yellow-400"></i>
            </Link>
          </li> */}
        </ul>
      )}
    </div>
  );
};

function useSticky(threshold = 50) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;

      if (scrollPosition > threshold) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    // Attach the event listener to the scroll event
    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return isSticky;
}

export default StickyHeader;
