import React from "react";
import useNetworkStatus from "../helper/useNetworkStatus";

export function NetworkAlert() {
  const { isOnline, showAlert } = useNetworkStatus();

  if (!showAlert) return null;

  return (
    <div
      className={`transition-opacity duration-1000 ${
        showAlert ? " opacity-100 bg-red-400 z-50 " : "opacity-0"
      } fixed top-14 left-1/2 transform -translate-x-1/2 flex items-center text-white px-4 py-2 rounded shadow-lg`}
    >
      <i className="fas fa-exclamation-triangle mr-2"></i>
      <span className="text-white">
        {isOnline
          ? "You are back online!"
          : "You have lost internet connection."}
      </span>
    </div>
  );
}
