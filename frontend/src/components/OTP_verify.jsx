import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import Navbar from "../components/NavBar";
import FloatingButton from "../components/FloatingButton";

const heroText = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } },
};

export default function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const email = location.state?.email || "";

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-registration-otp`,
        { email, otp },
        { withCredentials: true }
      );

      console.log("OTP verification response:", res.data);

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        navigate("/form");
      } else {
        setError(res.data.message || "OTP verification failed");
      }
    } catch (err) {
      console.error("OTP verification error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
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
          >
            Verify OTP
          </motion.h2>
          <motion.div
            className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 border border-teal-200/50"
            variants={heroText}
          >
            <form className="space-y-4" onSubmit={handleVerifyOtp}>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full px-4 py-2 bg-white/50 text-gray-800 rounded-lg border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
                aria-label="OTP"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <FloatingButton type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </FloatingButton>
            </form>
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