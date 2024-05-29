import React, { useState, useEffect, useRef } from "react";
import "./StickyHeader.css"; // Make sure to create the corresponding CSS file
import { Link } from "react-router-dom";
import { useOutsideAlerter } from "./useOutsideAlerter";
import useAuthentication from "../containers/Authentication.util";

const StickyHeader = ({ type = "primary", authPage }) => {
  const outsideSearchClickWrapperRef = useRef(null);
  const loggedIn = localStorage.getItem("token");
  const [isNavMenuVisible, setIsNavMenuVisible] = useState(false);
  const isSticky = useSticky();
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState("");
  useOutsideAlerter(outsideSearchClickWrapperRef, () => setSearching(false));
  const handleNavMenuToggle = () => setIsNavMenuVisible(!isNavMenuVisible);

  return (
    <header
      className={`sticky-header ${isSticky ? "nav-menu-visible" : ""} ${type}`}
    >
      <Link to="/">
        <img
          class="h-8"
          src="https://placehold.co/92x32.png?text=C%20PLAY&bg=0b0b0b"
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
                  className="text-gray-150 float-right mr-4 ml-6 pointer"
                  onClick={() => setSearching(!searching)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ) : (
              <button
                className="text-gray-150 mr-4 ml-6 pointer"
                onClick={() => setSearching(!searching)}
              >
                <i className="fas fa-search"></i>
              </button>
            )}
            <div className="user-menu" onClick={handleNavMenuToggle}>
              {loggedIn ? (
                <UserNav
                  setIsNavMenuVisible={setIsNavMenuVisible}
                  isNavMenuVisible={isNavMenuVisible}
                />
              ) : (
                <button>
                  <Link to="/auth/login">
                    <b>Login</b>
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

const UserNav = ({ isNavMenuVisible, setIsNavMenuVisible }) => {
  const { user: userIdAndEmail } = useAuthentication();
  const userEmail = userIdAndEmail?.email || "";
  const emailLetters = userEmail.match(/[A-Z]/gi) || [];
  const firstLetter =
    (!!emailLetters?.length && emailLetters[0]?.toUpperCase()) || "";
  // console.log('emailLetters', emailLetters)
  const outsideNavClickWrapperRef = useRef(null);
  useOutsideAlerter(outsideNavClickWrapperRef, () =>
    setIsNavMenuVisible(false)
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
  };

  return (
    <>
      <img
        class="h-8 ml-4"
        src={`https://placehold.co/32x32.png?text=${firstLetter}&bg=8b8b8b`}
        alt="User avatar placeholder"
      />
      {isNavMenuVisible && (
        <ul className="nav-menu" ref={outsideNavClickWrapperRef}>
          <li>
            {" "}
            <Link to="/account">
              <i class="fa-solid fa-user text-gray-400 m-2" />
              <b>Account</b>
            </Link>
          </li>
          <li>
            <Link to="/my_list">
              <i class="fa-solid fa-book text-gray-400  m-2" />
              <b>My List</b>
            </Link>
          </li>
          <li>
            <Link to="/favourites">
              <i class="fa-solid fa-heart text-gray-400  m-2" />
              <b>Favourites</b>
            </Link>
          </li>
          <li>
            <button onClick={handleLogout}>
              <i class="fa-solid fa-door-open text-gray-400  m-2" />
              <b>Sign Out</b>
            </button>
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
