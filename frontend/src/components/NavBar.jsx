import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="absolute top-0 w-full bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4 flex justify-between items-center">
      
      {/* Website Name */}
      <h1 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 text-transparent bg-clip-text">
        YourTutor
      </h1>

      {/* Right Side Links */}
      <div className="flex gap-6">
        <Link
          to="/about"
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-medium transition"
        >
          About
        </Link>
        <Link
          to="/"
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-medium transition"
        >
          Sign In
        </Link>
      </div>
    </nav>
  );
}
