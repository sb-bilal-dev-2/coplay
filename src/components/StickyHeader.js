import React, { useState, useEffect, useRef } from 'react';
import './StickyHeader.css'; // Make sure to create the corresponding CSS file
import { Link } from 'react-router-dom';

/**
 * Hook that alerts clicks outside of the passed ref
 */
function useOutsideAlerter(ref, callback) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback()
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

const StickyHeader = ({ type = 'primary', authPage }) => {
  const outsideNavClickWrapperRef = useRef(null);
  const outsideSearchClickWrapperRef = useRef(null);
  const loggedIn = localStorage.getItem('token')
  const [isNavMenuVisible, setIsNavMenuVisible] = useState(false);
  const isSticky = useSticky()
  const [searching, setSearching] = useState(false)
  const [search, setSearch] = useState('')
  useOutsideAlerter(outsideSearchClickWrapperRef, () => setSearching(false));
  useOutsideAlerter(outsideNavClickWrapperRef, () => setIsNavMenuVisible(false));
  const handleNavMenuToggle = () => {
    setIsNavMenuVisible(!isNavMenuVisible);
  };
  const handleLogout = () => {
    localStorage.removeItem('token')
  }

  return (
    <header className={`sticky-header ${isSticky ? 'nav-menu-visible' : ''} ${type}`}>
      <Link to="/"><img class="h-8" src="https://placehold.co/92x32.png?text=C%20PLAY&bg=0b0b0b" alt="C Play logo placeholder" /></Link>
      <div class="flex items-center">
        {!authPage &&
        <>
          {searching ?
          <div className='searchInputContainer'>
            <input value={search} autoFocus ref={outsideSearchClickWrapperRef} onChange={(ev) => setSearch(ev.target.value)} />
            <button className="text-gray-150 float-right mr-4 ml-6 pointer" onClick={() => setSearching(!searching)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          :
          <button className="text-gray-150 mr-4 ml-6 pointer" onClick={() => setSearching(!searching)}>
            <i className="fas fa-search"></i>
          </button>
          }
          <div className="user-menu" onClick={handleNavMenuToggle}>
            {loggedIn ?
              <>
                <img class="h-8 ml-4" src="https://placehold.co/32x32.png?text=K&bg=8b8b8b" alt="User avatar placeholder" />
                {isNavMenuVisible && (
                  <ul className="nav-menu" ref={outsideNavClickWrapperRef}>
                    <li><Link to="/account"><b>Account</b></Link></li>
                    <li><Link to="/my_list"><b>My List</b></Link></li>
                    <li><Link to="/favourites"><b>Favourites</b></Link></li>
                    <li><button onClick={handleLogout}><b>Sign Out</b></button></li>
                  </ul>
                )}
              </>
              : <button><Link to="/auth/login"><b>Login</b></Link></button>
            }
          </div>
        </>
        }
      </div>
    </header>
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
    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return isSticky;
};

export default StickyHeader;
