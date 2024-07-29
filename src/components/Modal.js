import React from "react";
import "./Modal.css"; // Add CSS for styling

function Modal({ show, message, onClose }) {
  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal bg-white">
        <div className="modal-content">
          <p className="error-message">{message}</p>
          <button
            type="button"
            className="flex justify-center items-center rounded-sm bg-white text-black px-4 py-2 mr-4 w-full text-center"
            onClick={onClose}
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
