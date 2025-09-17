import React, { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import Navbar from "../components/NavBar";

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
    else if (values.password.length < 6) e.password = "Password must be ≥ 6 chars";
    if (!values.confirm) e.confirm = "Confirm your password";
    else if (values.confirm !== values.password) e.confirm = "Passwords do not match";
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
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Signup response:", res.data);

      if (res.data.success === true) {
        navigate("/verify-otp", { state: { email: form.email } });
      } else {
        setErrors({ form: res.data.message || "Signup failed" });
      }
    } catch (err) {
      console.error("Signup error:", err.response || err);
      setErrors({ form: err.response?.data?.message || "Something went wrong" });
    } finally {
      setSubmitting(false);
    }
  }

  const heroText = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } },
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

      {/* Sign-Up Section */}
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
            Sign Up for YourTutor
          </motion.h2>

          <motion.div
            className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-600"
            variants={heroText}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="relative">
                <FaUser className="absolute left-3 top-3 text-gray-400" />
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="w-full pl-10 pr-3 py-2 rounded-lg border bg-gray-800 text-white outline-none focus:ring-2 focus:ring-indigo-600"
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full pl-10 pr-3 py-2 rounded-lg border bg-gray-800 text-white outline-none focus:ring-2 focus:ring-indigo-600"
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Contact */}
              <div className="relative">
                <FaUser className="absolute left-3 top-3 text-gray-400" />
                <input
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  placeholder="Contact number"
                  className="w-full pl-10 pr-3 py-2 rounded-lg border bg-gray-800 text-white outline-none focus:ring-2 focus:ring-indigo-600"
                />
                {errors.contact && <p className="text-red-400 text-sm mt-1">{errors.contact}</p>}
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
                  className="w-full pl-10 pr-10 py-2 rounded-lg border bg-gray-800 text-white outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-300"
                >
                  {showPwd ? <FaEyeSlash /> : <FaEye />}
                </button>
                {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-gray-400" />
                <input
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  type={showPwd ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-2 rounded-lg border bg-gray-800 text-white outline-none focus:ring-2 focus:ring-indigo-600"
                />
                {errors.confirm && <p className="text-red-400 text-sm mt-1">{errors.confirm}</p>}
              </div>

              {/* Error message */}
              {errors.form && <p className="text-red-400 text-sm">{errors.form}</p>}

              <motion.button
                type="submit"
                disabled={submitting}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 text-white text-lg rounded-xl ${
                  submitting ? "opacity-60 cursor-not-allowed bg-indigo-600" : "bg-indigo-600 hover:bg-indigo-700"
                } transition duration-300`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {submitting ? "Creating..." : "Sign Up"}
              </motion.button>
            </form>

            <motion.p className="text-sm text-gray-400 mt-4 text-center" variants={heroText}>
              Already have an account?{" "}
              <Link to="/" className="text-indigo-400 hover:underline">
                Sign In
              </Link>
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
