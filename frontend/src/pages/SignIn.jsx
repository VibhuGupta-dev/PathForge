import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/NavBar";
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

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        if (res.data.user.hasCompletedAssessment) {
          navigate("/assessment");
        } else {
          navigate("/Features");
        }
      } else {
        setError(res.data.message || "Login failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed, try again");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpRedirect = () => {
    navigate("/signup");
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-950 text-white">
      <Navbar />

      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 animate-gradient-flow" />

        {/* Glowing Orbs */}
        <div className="absolute -top-40 -left-32 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-40 -right-32 w-96 h-96 bg-gradient-to-br from-teal-400/30 to-cyan-400/30 rounded-full blur-[120px] animate-pulse delay-700" />

        {/* Particles */}
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-white/70 rounded-full shadow-md"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -60, 0],
              opacity: [0.2, 1, 0.2],
              scale: [0.6, 1.2, 0.6],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <section className="relative z-10 flex-grow flex items-center justify-center px-6 md:px-16">
        <motion.div
          className="space-y-8 text-center w-full max-w-md"
          variants={heroText}
          initial="hidden"
          animate="show"
        >
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text drop-shadow-lg"
            animate={{ rotateY: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          >
            Sign In to HelloMind
          </motion.h2>

          <motion.p
            className="text-lg md:text-xl text-gray-300"
            variants={heroText}
          >
            Access your personalized mental wellness journey
          </motion.p>

          {/* Glassmorphism Card */}
          <motion.div
            className="relative bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-white/20 hover:border-blue-400/40 transition"
            variants={heroText}
          >
            <form className="space-y-5" onSubmit={handleSignIn}>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="peer w-full px-4 pt-5 pb-2 bg-white/5 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder=" "
                />
                <label className="absolute left-4 top-2 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-300">
                  Email
                </label>
              </div>

              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="peer w-full px-4 pt-5 pb-2 bg-white/5 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder=" "
                />
                <label className="absolute left-4 top-2 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-300">
                  Password
                </label>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <FloatingButton type="submit" disabled={loading}>
                {loading ? (
                  <motion.span
                    className="flex items-center gap-2"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    Signing In...
                  </motion.span>
                ) : (
                  <>
                    Sign In <ArrowRight size={20} />
                  </>
                )}
              </FloatingButton>
            </form>

            <motion.p
              className="text-sm text-gray-400 mt-5"
              variants={heroText}
            >
              Don’t have an account?{" "}
              <button
                onClick={handleSignUpRedirect}
                className="text-blue-400 hover:underline"
              >
                Sign Up
              </button>
            </motion.p>
          </motion.div>
        </motion.div>
      </section>

      <footer className="mt-auto py-5 bg-slate-900/30 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} HelloMind. All rights reserved.
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-flow {
          background-size: 200% 200%;
          animation: gradient-flow 12s ease infinite;
        }
      `}</style>
    </div>
  );
}
