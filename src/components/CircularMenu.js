import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import "./CircularMenu.css"; // Import styles

export const StarRating = ({ scale = 1, handleClick = () => {} }) => {
    const [rating, setRating] = useState(0); // Stores the selected rating

    return (
        <div className="star-rating" style={{ transform: `scale(${scale})` }}>
            {[...Array(5)].map((_, index) => (
                <span
                    key={index}
                    className={`star ${index < rating ? "selected" : ""}`}
                    onClick={() => {setRating(index + 1); handleClick(index + 1)}}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

const CircularMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef([]);

    useEffect(() => {
        if (isOpen) {
            gsap.to(menuRef.current, {
                duration: 0.05,
                opacity: 1,
                scale: 1,
                stagger: 0.03,
                x: (i) => 16 * Math.cos((i * 60) * (Math.PI / 180)),
                y: (i) => 16 * Math.sin((i * 60) * (Math.PI / 180))
            });
        } else {
            gsap.to(menuRef.current, {
                duration: 0.1,
                opacity: 0,
                scale: 0,
                x: 0,
                y: 0
            });
        }
    }, [isOpen]);

    return (
        <div className="circle-menu">
            <div className="central-button" onClick={() => setIsOpen(!isOpen)}>★</div>
            {[...Array(6)].map((_, index) => (
                <div
                    key={index}
                    ref={(el) => (menuRef.current[index] = el)}
                    className="menu-item"
                    onClick={() => alert(`Clicked star ${index + 1}`)}
                >
                    ⭐
                </div>
            ))}
        </div>
    );
};

export default CircularMenu;
