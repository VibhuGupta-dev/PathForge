import React, { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, Phone, Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Navbar from "../components/NavBar";

const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-rose-950 animate-gradient-shift"></div>
    
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
    
    <div className="absolute inset-0 bg-grid-pattern opacity-[0.06]"></div>
    
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
    else if (values.password.length < 6) e.password = "Password must be at least 6 characters";
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
        { withCredentials: true }
      );

      if (res.data.success) {
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

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { strength: 0, label: "", color: "" };
    if (pwd.length < 6) return { strength: 33, label: "Weak", color: "bg-rose-500" };
    if (pwd.length < 10) return { strength: 66, label: "Medium", color: "bg-amber-500" };
    return { strength: 100, label: "Strong", color: "bg-emerald-500" };
  };

  const passwordStrength = getPasswordStrength(form.password);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-950">
      <AnimatedBackground />
      <Navbar />

      <section className="relative z-10 flex-grow flex items-center justify-center px-6 py-20">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-sm text-white shadow-lg mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Join PathForge Today</span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl font-extrabold mb-3"
              animate={{
                backgroundPosition: ["0%", "100%", "0%"],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{
                background: "linear-gradient(90deg, #06b6d4, #8b5cf6, #ec4899, #06b6d4)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Create Account
            </motion.h1>
            <p className="text-gray-300 text-lg">
              Start your personalized learning journey
            </p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            className="relative bg-gradient-to-br from-white/[0.12] to-white/[0.05] backdrop-blur-2xl rounded-2xl p-8 shadow-2xl border border-white/20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            {/* Shine Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-2xl"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            />

            <div className="relative z-10">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full pl-12 pr-4 py-3 bg-white/10 text-white placeholder-gray-400 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <AnimatePresence>
                    {errors.name && (
                      <motion.p
                        className="flex items-center gap-1 text-rose-400 text-xs mt-1"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <AlertCircle className="w-3 h-3" /> {errors.name}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className="w-full pl-12 pr-4 py-3 bg-white/10 text-white placeholder-gray-400 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        className="flex items-center gap-1 text-rose-400 text-xs mt-1"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <AlertCircle className="w-3 h-3" /> {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Contact Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Contact Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="contact"
                      value={form.contact}
                      onChange={handleChange}
                      placeholder="+91 1234567890"
                      className="w-full pl-12 pr-4 py-3 bg-white/10 text-white placeholder-gray-400 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <AnimatePresence>
                    {errors.contact && (
                      <motion.p
                        className="flex items-center gap-1 text-rose-400 text-xs mt-1"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <AlertCircle className="w-3 h-3" /> {errors.contact}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      type={showPwd ? "text" : "password"}
                      className="w-full pl-12 pr-12 py-3 bg-white/10 text-white placeholder-gray-400 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((s) => !s)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Password Strength</span>
                        <span className={`text-xs font-semibold ${
                          passwordStrength.strength === 100 ? "text-emerald-400" :
                          passwordStrength.strength === 66 ? "text-amber-400" :
                          "text-rose-400"
                        }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${passwordStrength.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${passwordStrength.strength}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  )}
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        className="flex items-center gap-1 text-rose-400 text-xs mt-1"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <AlertCircle className="w-3 h-3" /> {errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="confirm"
                      value={form.confirm}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      type={showPwd ? "text" : "password"}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 text-white placeholder-gray-400 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                    />
                    {form.confirm && form.confirm === form.password && (
                      <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <AnimatePresence>
                    {errors.confirm && (
                      <motion.p
                        className="flex items-center gap-1 text-rose-400 text-xs mt-1"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <AlertCircle className="w-3 h-3" /> {errors.confirm}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Form Error */}
                <AnimatePresence>
                  {errors.form && (
                    <motion.div
                      className="flex items-center gap-2 p-4 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-200"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm">{errors.form}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 text-white font-bold rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {submitting ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-gray-400">
                    Already have an account?
                  </span>
                </div>
              </div>

              {/* Sign In Link */}
              <Link to="/signin">
                <motion.button
                  className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign In Instead
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Additional Info */}
          <motion.p
            className="text-center text-sm text-gray-400 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            By signing up, you agree to our Terms of Service and Privacy Policy
          </motion.p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-6 bg-white/[0.03] backdrop-blur-xl border-t border-white/10 text-center">
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} PathForge. All rights reserved.
        </p>
      </footer>

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
      `}</style>
    </div>
  );
}