import { useState, useEffect } from "react";

function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 1000);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, showAlert };
}

export default useNetworkStatus;
