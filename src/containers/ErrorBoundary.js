import React from "react";
import { NetworkAlert } from "./NetworkStatus";
import NotFound from "./NotFound";
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
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <>
          <NetworkAlert />
          <NotFound />
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
