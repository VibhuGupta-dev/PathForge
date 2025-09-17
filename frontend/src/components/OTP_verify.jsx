import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const OtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef([]);

  // Redirect if email is missing
  useEffect(() => {
    if (!email) navigate('/');
    inputRefs.current[0]?.focus();
  }, [email, navigate]);

  // Timer for Resend OTP
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // Handle input changes
  const handleChange = (e, index) => {
    const value = e.target.value;
    if (value.length > 1 || isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    
    // Auto-verify when all 6 digits are entered
    if (value && index === 5) {
      const completeOtp = [...newOtp];
      completeOtp[5] = value;
      if (completeOtp.every(digit => digit !== '')) {
        setTimeout(() => handleVerify(completeOtp.join('')), 300);
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').trim();
    if (paste.length === 6 && !isNaN(paste)) {
      const otpArray = paste.split('');
      setOtp(otpArray);
      setError('');
      inputRefs.current[5]?.focus();
      // Auto-verify pasted OTP
      setTimeout(() => handleVerify(paste), 300);
    }
  };

  // Verify OTP
  const handleVerify = async (otpString = null) => {
    const otpToVerify = otpString || otp.join('');
    if (otpToVerify.length < 6) {
      setError('Please enter complete OTP');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-registration-otp`,
        { email, otp: otpToVerify }
      );

      if (res.data.success) {
        // Success - redirect to dashboard or signin
        navigate('/dashboard');
      } else {
        setError(res.data.message || 'Invalid OTP');
        setOtp(Array(6).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error('OTP verify error:', err);
      setError(err.response?.data?.message || 'Something went wrong');
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/resend-otp`,
        { email }
      );

      if (res.data.success) {
        setResendTimer(30);
        setOtp(Array(6).fill(''));
        inputRefs.current[0]?.focus();
      } else {
        setError(res.data.message || 'Unable to resend OTP');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-900">
      {/* Background Animations - Same as SignUp */}
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

      {/* Navigation Bar */}
      <nav className="relative z-20 p-4 bg-gray-800 bg-opacity-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">YourTutor</h1>
          <button
            onClick={() => navigate('/SignUp')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Sign Up
          </button>
        </div>
      </nav>

      {/* OTP Verification Section */}
      <section className="relative z-10 flex-grow flex items-center justify-center px-6 md:px-16">
        <div className="space-y-8 text-center w-full max-w-md">
          {/* Title */}
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 text-transparent bg-clip-text mb-4">
              Verify Your Email
            </h2>
            <p className="text-gray-300 text-lg">
              We've sent a 6-digit verification code to
            </p>
            <p className="text-indigo-400 font-semibold text-lg">
              {email}
            </p>
          </div>

          {/* OTP Card */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-gray-600">
            {/* OTP Input Fields */}
            <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  ref={(el) => (inputRefs.current[index] = el)}
                  disabled={loading}
                  className={`w-14 h-14 text-center text-2xl font-bold border-2 rounded-xl 
                    bg-gray-800 text-white transition-all duration-200 
                    ${digit ? 'border-indigo-400 bg-indigo-900 bg-opacity-30' : 'border-gray-600'} 
                    ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-500'}
                    focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-600 
                    focus:bg-indigo-900 focus:bg-opacity-30 transform focus:scale-105`}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
                <p className="text-red-400 text-sm text-center font-medium">
                  {error}
                </p>
              </div>
            )}

            {/* Verify Button */}
            <button
              onClick={() => handleVerify()}
              disabled={loading || otp.some(digit => !digit)}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 text-white text-lg rounded-xl font-semibold transition duration-300 mb-4 ${
                loading || otp.some(digit => !digit)
                  ? "opacity-60 cursor-not-allowed bg-gray-600" 
                  : "bg-indigo-600 hover:bg-indigo-700 transform hover:scale-105 active:scale-95"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </button>

            {/* Resend Section */}
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResend}
                disabled={resendTimer > 0 || loading}
                className={`font-medium text-sm transition-colors duration-200 ${
                  resendTimer > 0 || loading
                    ? 'text-gray-500 cursor-not-allowed' 
                    : 'text-indigo-400 hover:text-indigo-300 hover:underline'
                }`}
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-6 pt-4 border-t border-gray-600">
              <p className="text-xs text-gray-400 text-center">
                Check your spam folder if you don't see the email. 
                <br />
                The code will expire in 10 minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-5 bg-gray-800 bg-opacity-50 text-center text-gray-400 text-sm relative z-10">
        © {new Date().getFullYear()} YourTutor. All rights reserved.
      </footer>

      {/* CSS Styles - Same as SignUp */}
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
};

export default OtpVerification;