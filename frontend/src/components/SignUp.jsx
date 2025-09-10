import React, { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
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

    // fake submit flow — replace with real API call
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 900)); // simulate network
      // on success: navigate to login (or dashboard)
      navigate("/", { replace: true });
    } catch (err) {
      setErrors({ form: "Something went wrong. Try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="absolute left-1/3 top-1/4 w-full max-w-md bg-black/80 border border-gray-700 rounded-2xl p-6 shadow-lg">
         
        <h2 className="text-2xl font-bold text-center text-white mb-4">Create an account</h2>

        {errors.form && (
          <div className="bg-red-600/20 text-red-300 text-sm p-2 rounded mb-3">{errors.form}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FaUser className="absolute left-3 top-3 text-gray-400" />
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full name"
              className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                errors.name ? "border-red-500" : "border-gray-600"
              } bg-black text-white outline-none focus:ring-2 focus:ring-indigo-400`}
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                errors.email ? "border-red-500" : "border-gray-600"
              } bg-black text-white outline-none focus:ring-2 focus:ring-indigo-400`}
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-3 text-gray-400" />
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              type={showPwd ? "text" : "password"}
              className={`w-full pl-10 pr-10 py-2 rounded-lg border ${
                errors.password ? "border-red-500" : "border-gray-600"
              } bg-black text-white outline-none focus:ring-2 focus:ring-indigo-400`}
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="absolute right-2 top-2/4 -translate-y-2/4 p-2 text-gray-300"
            >
              {showPwd ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-3 text-gray-400" />
            <input
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              placeholder="Confirm password"
              type={showPwd ? "text" : "password"}
              className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                errors.confirm ? "border-red-500" : "border-gray-600"
              } bg-black text-white outline-none focus:ring-2 focus:ring-indigo-400`}
            />
            {errors.confirm && <p className="text-red-400 text-sm mt-1">{errors.confirm}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-2 rounded-lg text-white text-sm font-medium transition ${
              submitting ? "opacity-60 cursor-not-allowed" : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            }`}
          >
            {submitting ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-4 text-center">
          Already have an account?{" "}
          <Link to="/" className="text-indigo-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
