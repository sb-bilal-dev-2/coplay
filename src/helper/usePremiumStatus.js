import { useState, useEffect } from "react";
import useAuthentication from "../containers/Authentication.util";

export const usePremiumStatus = () => {
  const [isExpired, setIsExpired] = useState(false);
  const { user: premiumExpireDate } = useAuthentication();

  const checkPremiumExpired = () => {
    const currentDate = Date.now();
    setIsExpired(currentDate > premiumExpireDate);
  };

  // Call checkPremiumExpired initially when premiumExpireDate changes
  useEffect(() => {
    checkPremiumExpired();
  }, [premiumExpireDate]);

  return isExpired;
};
