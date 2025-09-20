
import React from "react";

const FloatingButton = ({ children, onClick, className = "", variant = "primary" }) => {
  const baseStyles =
    "relative overflow-hidden rounded-xl px-6 py-3 font-medium text-base transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-teal-400 active:scale-95 group";
  const variants = {
    primary:
      "bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg hover:shadow-xl focus:ring-teal-400",
    secondary:
      "bg-white/90 text-teal-700 border border-teal-200 hover:bg-teal-50 shadow-md focus:ring-teal-400",
    ghost: "text-teal-600 hover:bg-teal-50/50 focus:ring-teal-400",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      aria-label={children}
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
    </button>
  );
};

export default FloatingButton;