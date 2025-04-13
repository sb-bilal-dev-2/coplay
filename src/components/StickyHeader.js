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
import { BarsWatchAgain, YourVideosIcon } from "./BarsSmall";

const StickyHeader = ({ type = "primary", authPage }) => {
  const { t } = useTranslation();
  const loggedIn = localStorage.getItem("token");
  const [isNavMenuVisible, setIsNavMenuVisible] = useState(false);
  const isSticky = useSticky();
  const outsideSearchClickWrapperRef = useRef(null);
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState("");
  useOutsideAlerter(outsideSearchClickWrapperRef, () => setSearching(false));
  const closeButtonRef = useRef(null)
  const youtubeEmbedUrlFromSearch =
    (search.includes('youtube.com/embed/') && search)
    || (search.includes('www.youtube.com/watch?v=') && `https://www.youtube.com/embed/${search.split('https://www.youtube.com/watch?v=')[1]}`)
    || (search.includes('https://youtu.be/') && `https://www.youtube.com/embed/${search.split('https://youtu.be/')[1]}`)

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
      <Link to="/" className="relative min-h-max min-w-max flex items-center">
        <button className="block">
          <img
            style={{ height: '62px', width: '68px', marginLeft: '-4px' }}
            // className="h-12 w-12"
            // src="logo12.png"
            src="logo14.png"
            alt="C Play logo placeholder"
          />
        </button>
      </Link>
      <div className="flex items-center">
        {!authPage && (
          <>
            <div
              className="searchInputContainer relative px-1"
            >
              <i className={`fas fa-search absolute px-2 ${!searching ? 'text-gray-200' : ''}`}></i>
              <input
                onKeyDown={(event) => event.code === 'Escape' && (setSearching(false), outsideSearchClickWrapperRef.current?.blur())}
                onClick={() => setSearching(true)}
                value={search}
                ref={outsideSearchClickWrapperRef}
                placeholder="Search & Add"
                onChange={(ev) => setSearch(ev.target.value)}
              />
              {!!searching &&
                <button
                  ref={closeButtonRef}
                  className="close-search-button text-gray-150 float-right pointer absolute"
                  onClick={() => {
                    setSearch("");
                    setSearching(!searching);
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              }
              <div className={`search-container ${searching ? "show" : ""}`}>
                {youtubeEmbedUrlFromSearch &&
                  <>
                    <div style={{ overflow: 'hidden', height: '400px', width: '100%', position: 'relative' }}>
                      <div style={{ height: '100%', width: '100%', position: 'absolute' }}>
                        <iframe
                          style={{ height: '100%', width: '100%' }}
                          src={youtubeEmbedUrlFromSearch}
                          // src={"https://www.youtube.com/embed/2Vv-BfVoq4g"}
                          // src={item.youtubeUrl}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin"
                        />
                      </div>
                    </div>
                  </>
                }
                {/* {!!filteredVideos?.length &&
                  <HorizontalScrollMenu items={filteredVideos} baseRoute={"movie"} />
                }
                <h3>Collections</h3>
                {!!filtered_wordCollections?.length &&
                  <HorizontalScrollMenu items={filtered_wordCollections} baseRoute={"quiz"} />

                } */}
              </div>
            </div>
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
                <div className="flex items-center select-none">
                  {/* <Link to="/quiz/repeating?listType=self_words" className="relative">
                    <i class="fa-regular pt-1 pr-1 fa-star text-xl hover:text-orangered" />
                    <button className="block">
                      <YourVideosIcon />
                    </button>
                  </Link> */}
                  <UserNav
                    setIsNavMenuVisible={setIsNavMenuVisible}
                    isNavMenuVisible={isNavMenuVisible}
                  />
                </div>
              ) : (
                <button>
                  <Link to="/auth/login" className="color-white-100">
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
const colors = {
  A: "#cc3333", // Light Red
  B: "#33cc33", // Light Green
  C: "#3333cc", // Light Blue
  D: "rgb(224 224 0)", // Light Yellow
  E: "#cc33cc", // Light Magenta
  F: "#33cccc", // Light Cyan
  // Add more mappings for other letters as needed
};

const defaultColor = colors.D;

const UserNav = ({ isNavMenuVisible, setIsNavMenuVisible }) => {
  const { t } = useTranslation();
  const { user: userIdAndEmail } = useAuthentication();
  const userEmail = userIdAndEmail?.email || "";
  const emailLetters = userEmail.match(/[A-Z]/gi) || [];
  const firstLetter =
    (!!emailLetters?.length && emailLetters[0]?.toUpperCase()) || "";
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

      window.location.href = response.telegramLink;
    } catch (error) {
      console.error("Error generating connection code:", error);
    }
  };

  return (
    <div ref={outsideNavClickWrapperRef}>
      <button className="block ml-2 h-8 w-8 text-sm rounded-full font-bold color-white-100" style={{ background: defaultColor }} onClick={() => setIsNavMenuVisible(!isNavMenuVisible)}>
        {firstLetter}
      </button>
      {isNavMenuVisible && (
        <ul className="nav-menu">
          <li>
            {" "}
            <Link to="/account">
              <i className="fa-solid fa-user text-gray-400 m-2" />
              <b>{t("account")}</b>
            </Link>
          </li>
          <li>
            <button onClick={handleLogout}>
              <i className="fa-solid fa-door-open text-gray-400  m-2" />
              <b>{t("sign out")}</b>
            </button>
          </li>
          {!isTelegramConnected && (
            <li className="list-none">
              <button className="flex items-center" onClick={() => generateConnectionCode()}>
                <img
                  className="mr-1"
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
