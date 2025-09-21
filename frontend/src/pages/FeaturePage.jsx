import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, Bot, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
      type: "spring",
      stiffness: 120,
    },
  },
};

const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    {/* Smooth Gradient Background Animation */}
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 animate-gradient-flow"></div>

    {/* Soft Gradient Orbs */}
    <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-400/30 to-blue-400/30 rounded-full blur-[120px] animate-pulse"></div>
    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-[120px] animate-pulse delay-1000"></div>

    {/* Subtle Grid Overlay */}
    <div className="absolute inset-0 bg-grid-pattern opacity-[0.05]"></div>
  </div>
);

const FeatureButton = ({ icon: Icon, title, description, onClick }) => (
  <motion.div
    className="relative flex flex-col items-center p-8 bg-white/10 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 hover:border-slate-300/50 transition-all duration-300 w-full max-w-md group"
    variants={itemVariants}
    whileHover={{ scale: 1.06, y: -10 }}
    whileTap={{ scale: 0.98 }}
  >
    {/* Glow Ring */}
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 blur-2xl transition"></div>

    <motion.div
      className="z-10 w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center text-white shadow-md mb-6"
      whileHover={{ rotate: 360 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <Icon size={36} />
    </motion.div>

    <h3 className="z-10 text-xl md:text-2xl font-extrabold text-white mb-3">
      {title}
    </h3>
    <p className="z-10 text-sm md:text-base text-gray-300 text-center">
      {description}
    </p>

    <button
      onClick={onClick}
      className="z-10 mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
    >
      Explore
    </button>
  </motion.div>
);

export default function Features() {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const features = [
    {
      icon: Users,
      title: "Community Post",
      description:
        "Share your thoughts and connect with others in a supportive community.",
      onClick: () => navigate("/community"),
    },
    {
      icon: Bot,
      title: "AI Chatbot 24/7",
      description:
        "Get instant mental health support from our AI chatbot, anytime, anywhere.",
      onClick: () => navigate("/dashboard"),
    },
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await axios.post(
        "http://localhost:3000/api/auth/logout",
        {},
        { withCredentials: true }
      );
      window.location.href = "/signin";
    } catch (err) {
      console.error("Logout error:", err.response?.data || err.message);
      window.location.href = "/signin";
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-inter">
      <AnimatedBackground />
      <motion.div
        className="container mx-auto px-6 py-16 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-lg mb-14"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Features
        </motion.h1>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature, index) => (
            <FeatureButton key={index} {...feature} />
          ))}
        </motion.div>
      </motion.div>

      {/* Logout Button */}
      <motion.button
        onClick={handleLogout}
        disabled={loggingOut}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 p-4 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-full shadow-2xl hover:from-red-600 hover:to-red-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        title="Logout"
      >
        {loggingOut ? (
          <motion.div
            className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <LogOut size={28} />
        )}

        {/* Glow Ring */}
        <span className="absolute inset-0 rounded-full bg-red-500/30 blur-xl opacity-0 group-hover:opacity-100 transition"></span>
      </motion.button>

      <style jsx>{`
        @keyframes gradient-flow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient-flow {
          background-size: 200% 200%;
          animation: gradient-flow 12s ease infinite;
        }
        .bg-grid-pattern {
          background-image: linear-gradient(
              rgba(255, 255, 255, 0.05) 1px,
              transparent 1px
            ),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 60px 60px;
        }
      `}</style>
    </div>
  );
}