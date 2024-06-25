import React from "react";
import "./ErrorBoundary.scss";

export function NotFound() {
  return (
    <div className="error_page">
      <p className="text">
        Oops..
        <br />
        Not found
      </p>
      <div className="container">
        <div className="bg">
          <div className="light"></div>
        </div>
        <div className="ufo">
          <div className="ufo-bottom"></div>
          <div className="ufo-top"></div>
          <div className="ufo-glass">
            <div className="alien">
              <div className="alien-eye"></div>
            </div>
          </div>
        </div>
        <div className="bed">
          <div className="mattress"></div>
        </div>
        <div className="man">
          <div className="foot"></div>
          <div className="head">
            <div className="face"></div>
            <div className="hair"></div>
          </div>
          <div className="man-body"></div>
          <div className="arm"></div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
