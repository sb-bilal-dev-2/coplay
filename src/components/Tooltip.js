import React, { useRef, useState } from "react";
import "./Tooltip.css";
import classNames from "classnames";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { usePost } from "../containers/usePost";
import { updateGivenUserValues } from "../store";

function Tooltip(props) {
  const { text, selectionText, className } = props;
  const tooltipRef = useRef(null);
  const dispatch = useDispatch();
  const [isAdded, setIsAdded] = useState(false);

  const [postUserWords] = usePost((data) =>
    dispatch(updateGivenUserValues(data))
  );

  const handleMouseEnter = async () => {
    requestPhrase(text);
  };
  const requestPhrase = async () => {};

  const handleInfoClick = () => {
    const word = {
      the_text: text,
      repeatCount: 1,
      repeatTime: Date.now(),
    };
    postUserWords("/self_words", [word]);
    setIsAdded(true);

    if (isAdded) {
      const word = {
        the_text: text,
        repeatCount: 7,
        repeatTime: Date.now(),
      };
      postUserWords("/self_words", [word]);
      setIsAdded(false);
    }
  };

  return (
    <div className="tooltip">
      <span
        className={classNames([
          "tooltipTarget",
          "tooltipTarget-opacity-05",
          className,
        ])}
        onMouseEnter={handleMouseEnter}
      >
        {text}&#xa0;
      </span>
      <div className="tooltipContent" ref={tooltipRef}>
        <div className="tooltipContentButtons">
          <i
            className={
              isAdded
                ? "fa-solid fa-bookmark iconButton"
                : "fa-regular fa-bookmark iconButton"
            }
            onClick={handleInfoClick}
            style={{padding: "5px"}}
          ></i>
          <Link to={"/quiz/" + text.toLowerCase()}>
            <i
              className="fa-regular fa-circle-play iconButton"
              onClick={handleInfoClick}
            ></i>{" "}
          </Link>
          <a
            className="fa-regular fa-circle-question iconButton"
            href={`https://www.google.com/search?q=define+${
              selectionText || text
            }`}
            target="_blank"
            rel="noreferrer"
          ></a>
        </div>
      </div>
    </div>
  );
}

export default Tooltip;
