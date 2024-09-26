import React from "react";
import useNetworkStatus from "../helper/useNetworkStatus";

export function NetworkAlert() {
  const { isOnline, showAlert } = useNetworkStatus();

  if ((isOnline && showAlert) || !isOnline) {
    return (
      <div
        className={`transition-opacity duration-1000 ${
          (isOnline && showAlert) || !isOnline
            ? ` ${isOnline ? "bg-green-400" : "bg-red-400"}  z-50 opacity-100`
            : "opacity-0"
        } fixed top-14 left-1/2 transform -translate-x-1/2 flex items-center text-white px-4 py-2 rounded shadow-lg`}
      >
        <i className="fas fa-exclamation-triangle mr-2"></i>
        <span className="text-white">
          {!isOnline ? <div>No Internet Connection <i onClick={() => window.location.reload()} className="fa fa-refresh cursor-pointer p-1"></i></div> : "Back Online"}
        </span>
      </div>
    );
  } else {
    return;
  }
}
