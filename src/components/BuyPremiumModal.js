import React from "react";
import "./BuyPremiumModal.css";
import { Link } from "react-router-dom";

const BuyPremiumModal = ({ show, handleClose }) => {
  return (
    <div className={`modal ${show ? "show" : ""}`}>
      <div className="modal-content">
        <span className="close" onClick={handleClose}>
          &times;
        </span>
        <h2>Buy Premium Access</h2>
        <p>
          Unlock unlimited movies and premium features by purchasing our premium
          access!
        </p>
        <Link to="/price_page" className="font-bold p-2 w-full bg-orange-500">
          Buy Preminum <i class="fa-solid fa-crown text-yellow-400"></i>
        </Link>
      </div>
    </div>
  );
};

export default BuyPremiumModal;
