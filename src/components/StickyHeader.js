import React, { useState, useEffect, useRef } from "react";
import "./StickyHeader.css"; // Make sure to create the corresponding CSS file
import { Link, useLocation } from "react-router-dom";
import { useOutsideAlerter } from "./useOutsideAlerter";
import useAuthentication from "../containers/Authentication.util";
import { BASE_SERVER_URL } from "../api";
import { useTranslation } from "react-i18next";
import LanguageDropdown from "./LanguageDropdown";
import { useDynamicReducer } from "../dynamicReducer";

const StickyHeader = ({ type = "primary", authPage }) => {
  const { t } = useTranslation();
  const outsideSearchClickWrapperRef = useRef(null);
  const loggedIn = localStorage.getItem("token");
  const [isNavMenuVisible, setIsNavMenuVisible] = useState(false);
  const isSticky = useSticky();
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState("");
  // useOutsideAlerter(outsideSearchClickWrapperRef, () => setSearching(false));
  const handleNavMenuToggle = () => setIsNavMenuVisible(!isNavMenuVisible);

  const { items: videoItems, getItems: getVideos } =
    useDynamicReducer("movies");
  const { getItems: getWordCollections } = useDynamicReducer("wordCollections");
  const movies = videoItems?.filter((item) => item.category !== "Music");
  const clips = videoItems?.filter((item) => item.category === "Music");

  const filterByLabel = (items) => {
    return items?.filter((movie) =>
      movie?.label.toLowerCase().startsWith(search.toLowerCase())
    );
  };

  const location = useLocation();
  const isPricePage = location.pathname.includes("price_page");
  const learningLanguage = localStorage.getItem("learningLanguage");

  return (
    <header
      className={`sticky-header ${
        isSticky || searching ? "nav-menu-visible" : ""
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
              <div className="searchInputContainer">
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
                  <div className="search-box">
                    {filterByLabel(clips)?.length > 0 ? (
                      <h1>{t("movies")}</h1>
                    ) : null}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4">
                      {filterByLabel(movies)?.length > 0
                        ? filterByLabel(movies)?.map(
                            ({ _id, label, title }) => (
                              <Link
                                className="list-card"
                                to={["movie", title].join("/")}
                                style={{
                                  backgroundImage: `url('${BASE_SERVER_URL}/${"movie"}Files/${title}.jpg')`,
                                }}
                              >
                                <li className="list-none	" key={_id}>
                                  {label}
                                </li>
                              </Link>
                            )
                          )
                        : null}
                    </div>
                    {filterByLabel(clips)?.length > 0 ? (
                      <h1>{t("music")}</h1>
                    ) : null}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4">
                      {filterByLabel(clips)?.length > 0
                        ? filterByLabel(clips)?.map(({ _id, label, title }) => (
                            <Link
                              className="list-card"
                              to={["clip", title].join("/")}
                              style={{
                                backgroundImage: `url('${BASE_SERVER_URL}/${"movie"}Files/${title}.jpg')`,
                              }}
                            >
                              <li key={_id} className="list-none	">
                                {label}
                              </li>
                            </Link>
                          ))
                        : null}
                    </div>
                    <div>
                      {filterByLabel(movies)?.length +
                        filterByLabel(clips)?.length ===
                      0 ? (
                        <h1>{t("nothing found")}</h1>
                      ) : null}
                    </div>
                  </div>
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
            {!isPricePage ? (
              <Link
                to="/price_page"
                className="font-bold p-2 min-h-max min-w-max mr-2 hide_in_mobile"
              >
                Buy premium <i class="fa-solid fa-crown text-yellow-400"></i>
              </Link>
            ) : null}

            <LanguageDropdown
              selectedLanguage={learningLanguage ? learningLanguage : "en"}
              afterLangChange={() => (getVideos(), getWordCollections())}
            />

            <div className="user-menu" onClick={handleNavMenuToggle}>
              {loggedIn ? (
                <div className="flex">
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
  // console.log('emailLetters', emailLetters)
  const avatarPath = getPlaceholderUrl(firstLetter);
  const outsideNavClickWrapperRef = useRef(null);

  useOutsideAlerter(outsideNavClickWrapperRef, () =>
    setIsNavMenuVisible(false)
  );

  const handleLogout = () => {
    console.log("REMOVING TOKEN 3");

    localStorage.removeItem("token");
  };

  const location = useLocation();
  const isPricePage = location.pathname.includes("price_page");

  return (
    <>
      <img class="h-8 ml-4" src={avatarPath} alt="User avatar placeholder" />
      {isNavMenuVisible && (
        <ul className="nav-menu" ref={outsideNavClickWrapperRef}>
          <li>
            {" "}
            <Link to="/account">
              <i class="fa-solid fa-user text-gray-400 m-2" />
              <b>{t("account")}</b>
            </Link>
          </li>
          <li>
            <Link to="/my_list">
              <i class="fa-solid fa-book text-gray-400  m-2" />
              <b>{t("my list")}</b>
            </Link>
          </li>
          <li>
            <button onClick={handleLogout}>
              <i class="fa-solid fa-door-open text-gray-400  m-2" />
              <b>{t("sign out")}</b>
            </button>
          </li>
          <li className="hide_link show_in_mobile">
            <Link
              to="/price_page"
              className="font-bold p-2 min-h-max min-w-max mr-2"
            >
              Buy premium <i class="fa-solid fa-crown text-yellow-400"></i>
            </Link>
          </li>
        </ul>
      )}
    </>
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
