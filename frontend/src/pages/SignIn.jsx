import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FloatingButton from "../components/FloatingButton";

const heroText = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } },
};

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      console.log("Login success:", res.data);

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        if (res.data.user.hasCompletedAssessment) {
          navigate("/assessment");
        } else {
          navigate("/Features");
        }
      } else {
        setError(res.data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Login failed, try again");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpRedirect = () => {
    navigate("/signup");
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
 
      {/* Modern Gradient Background */}
      <div className="fixed inset-0 z-0">
        {/* Main gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
        
        {/* Animated overlay gradients */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: `
              radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(37, 99, 235, 0.25) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(29, 78, 216, 0.15) 0%, transparent 50%)
            `,
            animation: 'gradientShift 10s ease-in-out infinite'
          }}
        ></div>

        {/* Floating geometric elements */}
        {[...Array(12)].map((_, i) => {
          const size = Math.random() * 60 + 40;
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const delay = Math.random() * 5;
          const duration = Math.random() * 10 + 15;
          
          return (
            <motion.div
              key={`shape-${i}`}
              className="absolute rounded-full opacity-10"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                top: `${top}%`,
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(29, 78, 216, 0.05))',
                backdropFilter: 'blur(10px)',
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
                scale: [1, 1.1, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: duration,
                delay: delay,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          );
        })}

        {/* Subtle particle system */}
        {[...Array(30)].map((_, i) => {
          const size = Math.random() * 4 + 2;
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const delay = Math.random() * 3;
          
          return (
            <motion.div
              key={`particle-${i}`}
              className="absolute rounded-full bg-blue-300 opacity-30"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                top: `${top}%`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4,
                delay: delay,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          );
        })}

        {/* Modern mesh overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'meshFloat 20s linear infinite'
          }}
        ></div>

        {/* Bottom glow effect */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
      </div>

      <section className="relative z-10 flex-grow flex items-center justify-center px-6 md:px-16">
        <motion.div
          className="space-y-8 text-center w-full max-w-md"
          variants={heroText}
          initial="hidden"
          animate="show"
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-300 via-blue-200 to-slate-200 text-transparent bg-clip-text drop-shadow-2xl"
            style={{ 
              fontFamily: "Inter, sans-serif", 
              fontWeight: 700,
              filter: 'drop-shadow(0 4px 20px rgba(59, 130, 246, 0.3))'
            }}
            animate={{ 
              y: [0, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            Sign In to YourTutor
          </motion.h2>
          
          <motion.p
            className="text-lg md:text-xl text-blue-100 drop-shadow-lg"
            style={{ fontFamily: "Inter, sans-serif" }}
            variants={heroText}
          >
            Access your personalized mental wellness journey
          </motion.p>
          
          <motion.div
            className="bg-slate-800/30 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-blue-400/20 relative overflow-hidden"
            variants={heroText}
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 25px 50px rgba(59, 130, 246, 0.1)"
            }}
            transition={{ duration: 0.3 }}
          >
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-slate-700/5 rounded-2xl"></div>
            
            <form className="space-y-6 relative z-10" onSubmit={handleSignIn}>
              <motion.input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-6 py-4 bg-slate-700/40 text-blue-100 placeholder-blue-300/70 rounded-xl border border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 backdrop-blur-sm transition-all duration-300"
                required
                aria-label="Email"
                whileFocus={{ 
                  scale: 1.02,
                  boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)"
                }}
              />
              <motion.input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-6 py-4 bg-slate-700/40 text-blue-100 placeholder-blue-300/70 rounded-xl border border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 backdrop-blur-sm transition-all duration-300"
                required
                aria-label="Password"
                whileFocus={{ 
                  scale: 1.02,
                  boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)"
                }}
              />
              {error && (
                <motion.p 
                  className="text-red-300 text-sm bg-red-500/20 p-3 rounded-xl backdrop-blur-sm border border-red-400/30"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.p>
              )}
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                <FloatingButton type="submit" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"} <ArrowRight size={20} />
                </FloatingButton>
              </motion.div>
            </form>
            
            <motion.p
              className="text-sm text-blue-200 mt-6 relative z-10"
              style={{ fontFamily: "Inter, sans-serif" }}
              variants={heroText}
            >
              Don't have an account?{" "}
              <motion.button
                onClick={handleSignUpRedirect}
                className="text-blue-300 font-medium hover:text-blue-200 transition-all duration-300 focus:outline-none relative"
                aria-label="Sign Up"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 underline decoration-blue-400/50 underline-offset-2 hover:decoration-blue-300">
                  Sign Up
                </span>
              </motion.button>
            </motion.p>
          </motion.div>
        </motion.div>
      </section>
      
      <footer className="relative z-10 mt-auto py-6 bg-slate-900/40 backdrop-blur-sm text-center text-blue-200 text-sm">
        © {new Date().getFullYear()} YourTutor. All rights reserved.
      </footer>
      
      <style>{`
        @keyframes gradientShift {
          0%, 100% {
            filter: hue-rotate(0deg);
          }
          50% {
            filter: hue-rotate(45deg);
          }
        }

        @keyframes meshFloat {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }
      `}</style>
    </div>
  );
}