import { useState, useEffect } from "react";

export const usePremiumStatus = (premiumExpireDate) => {
  const [isExpired, setIsExpired] = useState(false);

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
