import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/NavBar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        email,
        password,
      });

      console.log("Login success:", res.data);

      // Agar backend token bhejta hai
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      navigate("/dashboard"); // Assessment page pe le jao
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Login failed, try again");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpRedirect = () => {
    navigate("/SignUp");
  };

  // Animation variants
  const heroText = {
    hidden: { opacity: 0, y: 50 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-900">
      <Navbar />

      {/* Background Animations */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-cyan-600 to-gray-900 opacity-70 gradientShift" />
        {[...Array(20)].map((_, i) => {
          const size = Math.random() * 5 + 3;
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const dur = (1 + Math.random() * 1).toFixed(2) + "s";
          const dx = `${(Math.random() * 20 - 10).toFixed(2)}px`;
          return (
            <div
              key={`dot-${i}`}
              className="absolute bg-cyan-300 rounded-full opacity-40"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                top: `${top}%`,
                animation: `floatDot ${dur} linear infinite`,
                ["--dx"]: dx,
              }}
            />
          );
        })}
      </div>

      {/* Sign-In Section */}
      <section className="relative z-10 flex-grow flex items-center justify-center px-6 md:px-16">
        <motion.div
          className="space-y-8 text-center w-full max-w-md"
          variants={heroText}
          initial="hidden"
          animate="show"
        >
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 text-transparent bg-clip-text"
            style={{ fontFamily: "Fira Sans, sans-serif", fontWeight: 600 }}
            animate={{ rotateY: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          >
            Sign In to YourTutor
          </motion.h2>

          <motion.p
            className="text-lg md:text-xl text-gray-300"
            variants={heroText}
          >
            Access your personalized learning journey!
          </motion.p>

          <motion.div
            className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-600"
            variants={heroText}
          >
            <form className="space-y-4" onSubmit={handleSignIn}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white text-lg rounded-xl hover:bg-indigo-700 transition duration-300 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? "Signing In..." : "Sign In"} <ArrowRight size={20} />
              </motion.button>
            </form>

            <motion.p
              className="text-sm text-gray-400 mt-4"
              variants={heroText}
            >
              Don't have an account?{" "}
              <button
                onClick={handleSignUpRedirect}
                className="text-indigo-400 hover:underline"
              >
                Sign Up
              </button>
            </motion.p>
          </motion.div>
        </motion.div>
      </section>

      <footer className="mt-auto py-5 bg-gray-800 bg-opacity-50 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} YourTutor. All rights reserved.
      </footer>

      <style>{`
        .gradientShift {
          background-size: 200% 200%;
          animation: colorShift 8s ease-in-out infinite;
        }
        @keyframes colorShift {
          0% { background-position: 0% 50%; opacity: 0.7; }
          50% { background-position: 100% 50%; opacity: 0.9; }
          100% { background-position: 0% 50%; opacity: 0.7; }
        }
        @keyframes floatDot {
          0% { transform: translate(0, 0); opacity: 0.4; }
          50% { transform: translate(var(--dx, 0px), -50px); opacity: 0.6; }
          100% { transform: translate(calc(var(--dx, 0px) * 2), -100px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
