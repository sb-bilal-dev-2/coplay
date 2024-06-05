import React from "react";
import { NetworkAlert } from "./NetworkStatus";
import "./ErrorBoundary.scss";
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <>
          <NetworkAlert />
          <p class="text">
            Oops..
            <br />
            Something went wrong
          </p>
          <div class="container">
            <div class="bg">
              <div class="light"></div>
            </div>
            <div class="ufo">
              <div class="ufo-bottom"></div>
              <div class="ufo-top"></div>
              <div class="ufo-glass">
                <div class="alien">
                  <div class="alien-eye"></div>
                </div>
              </div>
            </div>
            <div class="bed">
              <div class="mattress"></div>
            </div>
            <div class="man">
              <div class="foot"></div>
              <div class="head">
                <div class="face"></div>
                <div class="hair"></div>
              </div>
              <div class="man-body"></div>
              <div class="arm"></div>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <NetworkAlert />
        {this.props.children}
      </>
    );
  }
}

export default ErrorBoundary;
