import React, { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaPhone,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import Navbar from "../components/NavBar";
import FloatingButton from "../components/FloatingButton";

const heroText = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } },
};

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    contact: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate(values) {
    const e = {};
    if (!values.name.trim()) e.name = "Name is required";
    if (!values.email.trim()) e.email = "Email is required";
    else if (!emailRegex.test(values.email)) e.email = "Enter a valid email";
    if (!values.password) e.password = "Password is required";
    else if (values.password.length < 6)
      e.password = "Password must be ≥ 6 chars";
    if (!values.confirm) e.confirm = "Confirm your password";
    else if (values.confirm !== values.password)
      e.confirm = "Passwords do not match";
    if (!values.contact) e.contact = "Contact number is required";
    return e;
  }

  function handleChange(e) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validation = validate(form);
    setErrors(validation);
    if (Object.keys(validation).length) return;

    setSubmitting(true);

    const payload = {
      Fullname: form.name,
      email: form.email,
      password: form.password,
      contact: form.contact,
    };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/send-registration-otp`,
        payload,
        { withCredentials: true }
      );

      if (res.data.success) {
        navigate("/verify-otp", { state: { email: form.email } });
      } else {
        setErrors({ form: res.data.message || "Signup failed" });
      }
    } catch (err) {
      setErrors({
        form: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
      <Navbar />

      {/* Floating dots background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-indigo-800/30 to-slate-900/30 opacity-70" />
        {[...Array(20)].map((_, i) => {
          const size = Math.random() * 5 + 3;
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const dur = (1 + Math.random() * 1).toFixed(2) + "s";
          return (
            <div
              key={`dot-${i}`}
              className="absolute bg-blue-400 rounded-full opacity-30"
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

      {/* Main Section */}
      <section className="relative z-10 flex-grow flex items-center justify-center px-6 md:px-16 pt-24 md:pt-28">
        <motion.div
          className="space-y-8 text-center w-full max-w-md"
          variants={heroText}
          initial="hidden"
          animate="show"
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 700 }}
            animate={{ rotateY: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          >
            Create Your Account
          </motion.h2>

          <motion.div
            className="bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-8 border border-blue-500/30 hover:shadow-2xl transition-shadow"
            variants={heroText}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full name */}
              <div className="relative">
                <FaUser className="absolute left-3 top-3 text-gray-400" />
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="w-full pl-10 pr-3 py-2 rounded-lg border bg-slate-800/60 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Full name"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full pl-10 pr-3 py-2 rounded-lg border bg-slate-800/60 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Email"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Contact number */}
              <div className="relative">
                <FaPhone className="absolute left-3 top-3 text-gray-400" />
                <input
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  placeholder="Contact number"
                  className="w-full pl-10 pr-3 py-2 rounded-lg border bg-slate-800/60 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Contact number"
                />
                {errors.contact && (
                  <p className="text-red-400 text-sm mt-1">{errors.contact}</p>
                )}
              </div>

              {/* Password */}
              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-gray-400" />
                <input
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  type={showPwd ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-2 rounded-lg border bg-slate-800/60 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <FaEyeSlash /> : <FaEye />}
                </button>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm password */}
              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-gray-400" />
                <input
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  type={showPwd ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-2 rounded-lg border bg-slate-800/60 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Confirm password"
                />
                {errors.confirm && (
                  <p className="text-red-400 text-sm mt-1">{errors.confirm}</p>
                )}
              </div>

              {/* General error */}
              {errors.form && (
                <p className="text-red-400 text-sm">{errors.form}</p>
              )}

              {/* Submit */}
              <FloatingButton type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Sign Up"}
              </FloatingButton>
            </form>

            {/* Switch to Sign In */}
            <motion.p
              className="text-sm text-gray-400 mt-5 text-center"
              style={{ fontFamily: "Inter, sans-serif" }}
              variants={heroText}
            >
              Already have an account?{" "}
              <Link
                to="/signin"
                className="text-blue-400 hover:underline"
                aria-label="Sign In"
              >
                Sign In
              </Link>
            </motion.p>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-5 bg-slate-900/50 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} HelloMind. All rights reserved.
      </footer>

      {/* Floating animation */}
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
