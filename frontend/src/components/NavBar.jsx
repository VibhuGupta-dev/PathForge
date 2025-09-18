import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Navbar() {
  // Animation variants for logo
  const logoVariants = {
    hidden: { opacity: 0, y: -20, rotateX: -30 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
    hover: {
      rotateY: [0, 10, -10, 0],
      transition: { duration: 2, repeat: Infinity, repeatType: "reverse" },
    },
  };

  // Animation variants for links
  const linkVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    },
    hover: { 
      scale: 1.05, 
      rotateX: 5, 
      rotateY: -5, 
      transition: { type: "spring", stiffness: 200, damping: 10 } 
    },
  };

  return (
    <motion.nav 
      className="fixed top-0 w-full bg-gray-900/30 backdrop-blur-lg border-b border-gray-700 px-6 py-4 flex mb-10 justify-between items-center z-20"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Particle Background for Navbar */}
      <div className="absolute inset-0 z-[-1] overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white opacity-20 rounded-full"
            style={{
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${10 + Math.random() * 8}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Website Name */}
      <motion.h1
        className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 text-transparent bg-clip-text"
        style={{ fontFamily: "Fira Sans, sans-serif", fontWeight: 600 }}
        variants={logoVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
      >
        YourTutor
      </motion.h1>

      {/* Right Side Links */}
      <div className="flex gap-6">
        <motion.div variants={linkVariants} initial="hidden" animate="visible" whileHover="hover">
          <Link
            to="/home"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-medium transition duration-300"
          >
            Home
          </Link>
        </motion.div>
        <motion.div variants={linkVariants} initial="hidden" animate="visible" whileHover="hover">
          <Link
            to="/"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-medium transition duration-300"
          >
            Sign In
          </Link>
        </motion.div>
      </div>

      {/* Inline CSS for Particle Animation */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotateX(0deg) rotateY(0deg);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-50vh) rotateX(180deg) rotateY(180deg);
            opacity: 0.2;
          }
          100% {
            transform: translateY(-100vh) rotateX(360deg) rotateY(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </motion.nav>
  );
}