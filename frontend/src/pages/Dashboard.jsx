import React, { useState, useEffect } from "react";
import { Menu, X, ArrowLeft, Sparkles, User, Mail, RefreshCw, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FloatingButton from "../components/FloatingButton";
import RoadmapTracker from "../components/RoadmapTracker";

const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    {/* Rich Gradient Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-rose-950 animate-gradient-shift"></div>
    
    {/* Floating Orbs */}
    <motion.div
      className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-cyan-400/15 to-blue-500/15 rounded-full blur-[140px]"
      animate={{
        scale: [1, 1.2, 1],
        x: [0, 60, 0],
        y: [0, 40, 0],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-violet-400/15 to-fuchsia-500/15 rounded-full blur-[140px]"
      animate={{
        scale: [1, 1.3, 1],
        x: [0, -60, 0],
        y: [0, -40, 0],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-to-br from-amber-400/10 to-orange-500/10 rounded-full blur-[140px]"
      animate={{
        scale: [1, 1.15, 1],
        rotate: [0, 180, 360],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    />
    
    {/* Mesh Grid */}
    <div className="absolute inset-0 bg-grid-pattern opacity-[0.06]"></div>
    
    {/* Animated Particles */}
    {[...Array(25)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-white/20 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -40, 0],
          opacity: [0.2, 0.7, 0.2],
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
      />
    ))}
  </div>
);

const StatusIndicator = ({ status }) => (
  <motion.div 
    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg" 
    initial={{ opacity: 0, scale: 0.8 }} 
    animate={{ opacity: 1, scale: 1 }} 
    transition={{ duration: 0.5 }}
  >
    <motion.span
      className={`w-2.5 h-2.5 rounded-full ${
        status === "online" ? "bg-emerald-400" : 
        status === "offline" ? "bg-rose-400" : 
        "bg-amber-400"
      } shadow-lg`}
      animate={{ 
        scale: status === "online" ? [1, 1.4, 1] : 
               status === "checking" ? [1, 1.3, 1] : 1,
        boxShadow: status === "online" ? [
          "0 0 0 0 rgba(52, 211, 153, 0.7)",
          "0 0 0 10px rgba(52, 211, 153, 0)",
          "0 0 0 0 rgba(52, 211, 153, 0)"
        ] : []
      }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    />
    <span className="text-xs font-semibold text-white">
      {status === "online" ? "Online" : status === "offline" ? "Offline" : "Checking..."}
    </span>
  </motion.div>
);

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      await checkBackendStatus();
      await fetchUserData();
    };
    init();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/health`, { timeout: 5000 });
      setBackendStatus(response.status === 200 ? "online" : "offline");
    } catch (err) {
      console.error("Backend check failed:", err.message);
      setBackendStatus("offline");
    }
  };

  const fetchUserData = async () => {
    setIsRefreshing(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, { withCredentials: true });
      setUser(response.data.user);
    } catch (err) {
      console.error("User fetch error:", err.response?.data || err.message);
      navigate("/signin");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    window.location.href = "/signin";
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className="fixed top-0 left-0 z-50 w-80 md:w-80 h-screen bg-gradient-to-br from-white/[0.12] to-white/[0.05] backdrop-blur-2xl border-r border-white/20 shadow-2xl flex flex-col"
        initial={{ x: "-100%" }}
        animate={{ 
          x: sidebarOpen || window.innerWidth >= 768 ? 0 : "-100%"
        }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      >
        {/* Sidebar Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <motion.h2
            className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0%", "100%", "0%"],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% auto" }}
          >
            PathForge
          </motion.h2>
          <motion.button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
          >
            <X size={24} className="text-white" />
          </motion.button>
        </div>

        {/* User Profile Section */}
        <div className="flex-1 p-6 overflow-y-auto">
          {user && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Avatar */}
              <div className="flex flex-col items-center gap-4 mb-6">
                <motion.div
                  className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500 via-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-3xl font-bold shadow-2xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {user.Fullname?.[0]?.toUpperCase() || "U"}
                  {/* Sparkle Effect */}
                  <motion.div
                    className="absolute -top-1 -right-1 text-amber-300"
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.3, 1],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Sparkles size={20} />
                  </motion.div>
                </motion.div>

                {/* User Info */}
                <div className="text-center w-full">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {user.Fullname || "User"}
                  </h3>
                  <div className="flex items-center justify-center gap-2 text-gray-300 text-sm">
                    <Mail className="w-3.5 h-3.5" />
                    <p className="truncate max-w-[200px]">{user.email || "user@example.com"}</p>
                  </div>
                </div>
              </div>

              {/* Status Card */}
              <div className="p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-300">Backend Status</span>
                  <StatusIndicator status={backendStatus} />
                </div>
                <motion.button
                  onClick={checkBackendStatus}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-all duration-300 border border-white/10"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCw className="w-4 h-4" />
                  Check Status
                </motion.button>
              </div>

              {/* Refresh Profile Button */}
              <motion.button
                onClick={fetchUserData}
                disabled={isRefreshing}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {isRefreshing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </motion.div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Refresh Profile
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-white/10 space-y-3">
          <motion.button
            onClick={() => navigate("/features")}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-xl text-sm text-white font-semibold shadow-lg transition-all duration-300 border border-white/20"
            whileHover={{ scale: 1.02, x: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Features
          </motion.button>
          
          <motion.button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 ml-0 md:ml-80 relative z-10">
        {/* Mobile Header */}
        <motion.header
          className="md:hidden flex items-center justify-between p-4 bg-white/[0.08] backdrop-blur-2xl border-b border-white/10 shadow-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => navigate("/features")}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              whileHover={{ scale: 1.1, x: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={24} className="text-white" />
            </motion.button>
            <motion.button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu size={24} className="text-white" />
            </motion.button>
          </div>
          
          <motion.h1
            className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0%", "100%", "0%"],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% auto" }}
          >
            PathForge
          </motion.h1>
          
          <StatusIndicator status={backendStatus} />
        </motion.header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8">
          <AnimatePresence mode="wait">
            {!user && (
              <motion.div
                className="flex flex-col items-center justify-center mt-12 md:mt-24 px-4 text-center max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6 }}
              >
                <div className="relative bg-gradient-to-br from-white/[0.12] to-white/[0.05] backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20">
                  {/* Shine Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-3xl"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <motion.div
                      className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center shadow-2xl"
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <User className="w-10 h-10 text-white" />
                    </motion.div>
                    
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                      Welcome to PathForge
                    </h2>
                    <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
                      Sign in to unlock your personalized career roadmap and start your journey to success!
                    </p>
                    <motion.button
                      onClick={() => navigate("/signin")}
                      className="px-8 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 text-white rounded-xl font-bold text-lg shadow-2xl hover:shadow-violet-500/50 transition-all duration-300"
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Sign In Now
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
            
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <RoadmapTracker user={user} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        ::-webkit-scrollbar {
          width: 10px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 5px;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #06b6d4, #8b5cf6);
          border-radius: 5px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0891b2, #7c3aed);
        }
      `}</style>
    </div>
  );
}