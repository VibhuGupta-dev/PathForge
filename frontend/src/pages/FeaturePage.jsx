import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, Bot, LogOut, Video, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    {/* Rich Gradient Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-rose-950 animate-gradient-shift"></div>
    
    {/* Floating Orbs */}
    <motion.div
      className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-[120px]"
      animate={{
        scale: [1, 1.2, 1],
        x: [0, 50, 0],
        y: [0, 30, 0],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-violet-400/20 to-fuchsia-500/20 rounded-full blur-[120px]"
      animate={{
        scale: [1, 1.3, 1],
        x: [0, -50, 0],
        y: [0, -30, 0],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-amber-400/15 to-orange-500/15 rounded-full blur-[120px]"
      animate={{
        scale: [1, 1.1, 1],
        rotate: [0, 180, 360],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
    />
    
    {/* Mesh Grid */}
    <div className="absolute inset-0 bg-grid-pattern opacity-[0.08]"></div>
    
    {/* Light Beams */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent animate-pulse"></div>
  </div>
);

const FeatureCard = ({ icon: Icon, title, description, onClick, index, gradient }) => (
  <motion.div
    className="relative group cursor-pointer"
    initial={{ opacity: 0, y: 50, rotateX: -15 }}
    animate={{ opacity: 1, y: 0, rotateX: 0 }}
    transition={{
      duration: 0.8,
      delay: index * 0.15,
      ease: [0.25, 0.46, 0.45, 0.94],
    }}
    whileHover={{ y: -12, scale: 1.02 }}
    onClick={onClick}
  >
    {/* Card Container */}
    <div className="relative h-full bg-gradient-to-br from-white/[0.12] to-white/[0.05] backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-2xl transition-all duration-500 group-hover:border-white/40 group-hover:shadow-[0_0_40px_rgba(139,92,246,0.3)]">
      {/* Shine Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6 }}
      />
      
      {/* Gradient Glow */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}></div>
      
      {/* Content */}
      <div className="relative z-10 p-8 flex flex-col items-center text-center h-full">
        {/* Icon Container */}
        <motion.div
          className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 shadow-lg`}
          whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          <Icon className="w-10 h-10 text-white" strokeWidth={2} />
        </motion.div>
        
        {/* Title */}
        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-300 text-sm leading-relaxed mb-6 flex-grow">
          {description}
        </p>
        
        {/* Button */}
        <motion.button
          className={`w-full px-6 py-3 rounded-xl bg-gradient-to-r ${gradient} text-white font-semibold shadow-lg transition-all duration-300`}
          whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(139, 92, 246, 0.4)" }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started
        </motion.button>
      </div>
      
      {/* Sparkle Effect */}
      <motion.div
        className="absolute top-4 right-4 text-white/30"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Sparkles size={20} />
      </motion.div>
    </div>
  </motion.div>
);

export default function Features() {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const features = [
    {
      icon: Users,
      title: "Community Post",
      description: "Share your thoughts and connect with others in a supportive community.",
      onClick: () => navigate("/community"),
      gradient: "from-cyan-500 via-blue-500 to-indigo-600",
    },
    {
      icon: Bot,
      title: "Roadmap Generator",
      description: "Follow a personalized roadmap to achieve your career goals step-by-step.",
      onClick: () => navigate("/dashboard"),
      gradient: "from-violet-500 via-purple-500 to-fuchsia-600",
    },
    {
      icon: Bot,
      title: "AI Chatbot 24/7",
      description: "Get instant career assistance from our AI chatbot, anytime, anywhere.",
      onClick: () => navigate("/chatbot"),
      gradient: "from-amber-500 via-orange-500 to-rose-600",
    },
    {
      icon: Video,
      title: "30-Day Program",
      description: "Follow a daily schedule with motivational videos to combat depression.",
      onClick: () => navigate("/30days"),
      gradient: "from-emerald-500 via-teal-500 to-cyan-600",
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
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <AnimatedBackground />

      {/* Glass Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-white/[0.08] backdrop-blur-2xl border-b border-white/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-8 py-5 flex justify-between items-center">
          <motion.h1
            className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0%", "100%", "0%"],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% auto" }}
          >
            Feature Hub
          </motion.h1>
          <motion.button
            onClick={handleLogout}
            disabled={loggingOut}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold shadow-lg hover:shadow-rose-500/50 transition-all duration-300 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loggingOut ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                ⏳
              </motion.span>
            ) : (
              <span className="flex items-center gap-2">
                <LogOut size={18} />
                Logout
              </span>
            )}
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="container mx-auto px-8 pt-32 pb-20 relative z-10">
        {/* Title Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1
            className="text-6xl md:text-7xl font-extrabold mb-4 bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0%", "100%", "0%"],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% auto" }}
          >
            Explore Features
          </motion.h1>
          <motion.p
            className="text-xl text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Discover powerful tools designed to accelerate your growth journey
          </motion.p>
        </motion.div>

        {/* Features Grid - All in One Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-[1600px] mx-auto">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>

      {/* Floating Action Button (Mobile) */}
      <motion.button
        onClick={handleLogout}
        disabled={loggingOut}
        className="xl:hidden fixed bottom-8 right-8 p-5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full shadow-2xl hover:shadow-rose-500/50 transition-all duration-300 disabled:opacity-50 z-50"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, delay: 0.8, type: "spring" }}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
      >
        <LogOut size={24} />
      </motion.button>

      {/* Footer */}
      <motion.footer
        className="relative z-10 border-t border-white/10 py-8 mt-16 bg-white/[0.03] backdrop-blur-xl text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-gray-400 text-sm">
          Built with <span className="text-rose-400">❤️</span> for your growth journey{" "}
          <span className="text-cyan-400">🚀</span>
        </p>
      </motion.footer>

      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
}