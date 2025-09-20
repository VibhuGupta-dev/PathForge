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

      console.log("Login success:", res.data);

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
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-teal-50 via-blue-50 to-gray-100">
      <Navbar />
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-200/30 via-blue-200/30 to-gray-100/30 opacity-70" />
        {[...Array(20)].map((_, i) => {
          const size = Math.random() * 5 + 3;
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const dur = (1 + Math.random() * 1).toFixed(2) + "s";
          return (
            <div
              key={`dot-${i}`}
              className="absolute bg-teal-300 rounded-full opacity-30"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                top: `${top}%`,
                animation: `floatDot ${dur} linear infinite`,
              }}
            />
          );
        })}
      </div>

      <section className="relative z-10 flex-grow flex items-center justify-center px-6 md:px-16">
        <motion.div
          className="space-y-8 text-center w-full max-w-md"
          variants={heroText}
          initial="hidden"
          animate="show"
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 text-transparent bg-clip-text"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 700 }}
            animate={{ rotateY: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          >
            Sign In to HelloMind
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-gray-600"
            style={{ fontFamily: "Inter, sans-serif" }}
            variants={heroText}
          >
            Access your personalized mental wellness journey
          </motion.p>
          <motion.div
            className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 border border-teal-200/50"
            variants={heroText}
          >
            <form className="space-y-4" onSubmit={handleSignIn}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-2 bg-white/50 text-gray-800 rounded-lg border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
                aria-label="Email"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-2 bg-white/50 text-gray-800 rounded-lg border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
                aria-label="Password"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <FloatingButton type="submit" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"} <ArrowRight size={20} />
              </FloatingButton>
            </form>
            <motion.p
              className="text-sm text-gray-500 mt-4"
              style={{ fontFamily: "Inter, sans-serif" }}
              variants={heroText}
            >
              Don't have an account?{" "}
              <button
                onClick={handleSignUpRedirect}
                className="text-teal-500 hover:underline focus:outline-none"
                aria-label="Sign Up"
              >
                Sign Up
              </button>
            </motion.p>
          </motion.div>
        </motion.div>
      </section>
      <footer className="mt-auto py-5 bg-teal-900/20 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} HelloMind. All rights reserved.
      </footer>
      <style>{`
        @keyframes floatDot {
          0% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-30px); opacity: 0.5; }
          100% { transform: translateY(-60px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}