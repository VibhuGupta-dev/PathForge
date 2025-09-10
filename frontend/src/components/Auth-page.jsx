import { useState } from "react";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import {Link} from 'react-router-dom'

function AuthPage() {
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-2">
     <div className="absolute left-1/2 bottom-16 -translate-x-1/2 bg-black rounded-2xl shadow-xl border-2 w-full max-w-md p-5 transition duration-300">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          {"Welcome Back !!"}
        </h2>

        {/* Form */}
        <form className="space-y-4">
          
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-3 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
          >
           Sign In
          </button>
        </form>

        {/* Toggle link */}
        <p className="text-center text-gray-600 mt-6">
          {"Don't have an account?"}{" "}
          <Link className="text-blue-600 nav-link" to="/SignUp">Sign Up</Link>
          <span
            className="text-indigo-600 font-semibold cursor-pointer hover:underline"
          >
          </span>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
