import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle, AlertTriangle, Menu, X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import  FloatingButton  from '../components/FloatingButton';
import Skeleton from 'react-loading-skeleton';


const messageVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.46, 0.45, 0.94],
      type: "spring",
      stiffness: 100
    } 
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    scale: 0.95,
    transition: { duration: 0.3 }
  }
};

const sidebarVariants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      duration: 0.5
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Orbs */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-teal-400/20 via-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/15 via-teal-400/15 to-green-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-teal-400/10 rounded-full blur-2xl animate-spin-slow"></div>
      
      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-teal-400/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-20, -100, -20],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
    </div>
  );
};

const StatusIndicator = ({ status }) => (
  <motion.div 
    className="flex items-center gap-2"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <motion.span
      className={`w-2 h-2 rounded-full ${
        status === 'online' ? 'bg-green-400' : 'bg-red-400'
      }`}
      animate={{
        scale: status === 'online' ? [1, 1.2, 1] : 1,
        opacity: status === 'checking' ? [1, 0.5, 1] : 1
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    <span className="text-xs md:text-sm">
      {status === 'online' ? 'Online' : status === 'offline' ? 'Offline' : 'Checking...'}
    </span>
  </motion.div>
);

export default function Dashboard() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [backendStatus, setBackendStatus] = useState("checking");
  const [showHistory, setShowHistory] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await checkBackendStatus();
      await fetchUserData();
      setLoading(false);
    };
    init();
  }, []);

  // Fetch history and report when user and backendStatus are ready
  useEffect(() => {
    if (user && backendStatus === 'online') {
      fetchHistory();
      fetchReport();
    }
  }, [user, backendStatus]);

  // Check if backend is online
  const checkBackendStatus = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_AI_BACKEND_URL}/health`, { timeout: 5000 });
      setBackendStatus(response.status === 200 ? 'online' : 'offline');
      return response.status === 200;
    } catch (err) {
      console.error('Backend check failed:', err.message);
      setBackendStatus('offline');
      return false;
    }
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, { withCredentials: true });
      setUser(response.data.user);
    } catch (err) {
      console.error('User fetch error:', err.response?.data || err.message);
    }
  };

  // Fetch user history
  const fetchHistory = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${import.meta.env.VITE_AI_BACKEND_URL}/api/analyses?userId=${user.id}`, { withCredentials: true });
      if (response.data.success) {
        setHistory(response.data.data);
      }
    } catch (err) {
      console.error('History fetch error:', err.response?.data || err.message);
    }
  };

  // Fetch initial report
  const fetchReport = async () => {
    if (!user || backendStatus !== 'online') return;
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_AI_BACKEND_URL}/api/ai-report?userId=${user.id}`, { withCredentials: true });
      const result = response.data;

      const botMessage = {
        sender: 'AI',
        text: result.analysis || result.error || 'No analysis available',
        meta: {
          type: result.type || 'unknown',
          confidence: result.confidence || 'N/A',
          source: result.source || 'AI',
          timestamp: result.timestamp || new Date().toISOString(),
        },
      };

      setMessages([botMessage]);
    } catch (err) {
      console.error('Report fetch error:', err.response?.data || err.message);
      setMessages([
        {
          sender: 'AI',
          text: `❌ Failed to load mental health report: ${err.response?.data?.error || err.message}`,
          meta: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Send user input to backend
  const analyzeData = async () => {
    if (!input.trim() || !user) return;

    setLoading(true);
    const userMessage = { sender: 'User', text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const online = await checkBackendStatus();
      if (!online) {
        throw new Error('Server is offline. Please try again later.');
      }

      const response = await axios.post(
        `${import.meta.env.VITE_AI_BACKEND_URL}/api/ai-chat`,
        { message: input, userId: user.id },
        { withCredentials: true }
      );
      const result = response.data;

      const botMessage = {
        sender: 'AI',
        text: result.response || result.error || 'No response available',
        meta: {
          type: result.type || 'unknown',
          confidence: result.confidence || 'N/A',
          source: result.source || 'AI',
          timestamp: result.timestamp || new Date().toISOString(),
        },
      };

      setMessages((prev) => [...prev, botMessage]);
      fetchHistory(); // Refresh history
    } catch (err) {
      console.error('Chat error:', err.response?.data || err.message);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'AI',
          text: `❌ Failed to get response from AI: ${err.response?.data?.error || err.message}`,
          meta: null,
        },
      ]);
    } finally {
      setInput('');
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      analyzeData();
    }
  };

  // Close sidebar on mobile overlay click
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-teal-50/50 text-gray-800 relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={handleOverlayClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`
        fixed md:fixed z-50 md:z-auto
        w-80 md:w-64 h-full md:h-screen
        top-0 left-0
        bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-2xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col transition-transform duration-300 ease-in-out
      `}
        variants={sidebarVariants}
        initial="hidden"
        animate={sidebarOpen || window.innerWidth >= 768 ? "visible" : "hidden"}
      >
        <motion.div 
          className="flex justify-between items-center p-4 md:hidden"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.h2 
            className="text-lg font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent"
            style={{ fontFamily: 'Inter, sans-serif' }}
            whileHover={{ scale: 1.05 }}
          >
            YourTutor
          </motion.h2>
          <motion.button 
            onClick={() => setSidebarOpen(false)} 
            className="p-2 hover:bg-teal-100/50 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <X size={20} />
          </motion.button>
        </motion.div>

        <div className="flex-1 p-4 md:p-6">
          {user && (
            <motion.div 
              className="flex flex-col items-center gap-3 mb-6 md:mb-10"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg"
                variants={staggerItem}
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {user.Fullname?.[0] || 'U'}
              </motion.div>
              <motion.div className="text-center" variants={staggerItem}>
                <p className="font-bold text-sm md:text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {user.Fullname || 'User'}
                </p>
                <p className="text-xs md:text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {user.email || 'user@example.com'}
                </p>
              </motion.div>
            </motion.div>
          )}

          <motion.div 
            className="text-xs md:text-sm mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <StatusIndicator status={backendStatus} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <FloatingButton
              onClick={() => {
                setMessages([]);
                setSidebarOpen(false);
              }}
              className="w-full mb-4 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200"
            >
              ✨ New Chat
            </FloatingButton>
          </motion.div>

          <motion.button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full px-4 py-2 bg-white/50 hover:bg-white/70 backdrop-blur-sm rounded-lg text-sm text-gray-800 disabled:opacity-50 transition-all duration-200 border border-white/20 hover:border-white/30"
            disabled={history.length === 0}
            style={{ fontFamily: 'Inter, sans-serif' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {showHistory ? '📋 Hide History' : '📋 Show History'}
          </motion.button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                className="max-h-60 md:max-h-96 overflow-y-auto space-y-2 mt-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {history.length === 0 && (
                  <motion.p 
                    className="text-gray-500 text-xs md:text-sm" 
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    No history available.
                  </motion.p>
                )}
                {history.map((item, i) => (
                  <motion.div
                    key={i}
                    className="p-3 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-lg text-xs md:text-sm cursor-pointer transition-all duration-200 border border-white/20"
                    onClick={() => {
                      setMessages([
                        { sender: 'User', text: item.userInput.text },
                        { sender: 'AI', text: item.aiResponse.response, meta: item.aiResponse },
                      ]);
                      setSidebarOpen(false);
                    }}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                  >
                    <p className="truncate">
                      <strong>Input:</strong> {item.userInput.text.slice(0, 50)}...
                    </p>
                    <p className="truncate">
                      <strong>Response:</strong> {item.aiResponse.response.slice(0, 50)}...
                    </p>
                    <p className="text-gray-500">
                      <strong>Date:</strong> {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div 
          className="p-4 md:p-6 border-t border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div className="mb-3 hidden md:block">
            <motion.button 
              onClick={() => navigate('/Features')} 
              className="flex items-center gap-2 w-full px-4 py-2 bg-white/50 hover:bg-white/70 backdrop-blur-sm rounded-lg text-sm text-gray-800 transition-all duration-200 border border-white/20 hover:border-white/30"
              whileHover={{ scale: 1.02, x: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <ArrowLeft size={16} />
              Back to Features
            </motion.button>
          </motion.div>
          <FloatingButton
            onClick={() => (window.location.href = '/signin')}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200"
          >
            🚪 Logout
          </FloatingButton>
        </motion.div>
      </motion.aside>

      <main className="flex-1 flex flex-col min-w-0 relative z-10 md:ml-64">
        <motion.header 
          className="md:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-xl border-b border-white/20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <motion.button 
              onClick={() => navigate('/feature')} 
              className="p-2 hover:bg-teal-100/50 rounded-lg transition-colors"
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.95 }}
              title="Back to Features"
            >
              <ArrowLeft size={20} />
            </motion.button>
            <motion.button 
              onClick={() => setSidebarOpen(true)} 
              className="p-2 hover:bg-teal-100/50 rounded-lg transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu size={24} />
            </motion.button>
          </div>
          <motion.h1 
            className="text-lg font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent"
            style={{ fontFamily: 'Inter, sans-serif' }}
            whileHover={{ scale: 1.05 }}
          >
     yourTutor
          </motion.h1>
          <StatusIndicator status={backendStatus} />
        </motion.header>

        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 pb-20 md:pb-24">
          <AnimatePresence mode="wait">
            {messages.length === 0 && (
              <motion.div 
                className="text-center text-gray-600 mt-8 md:mt-20 px-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6 }}
              >
                <div className="max-w-md mx-auto">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 200, 
                      damping: 20,
                      delay: 0.2 
                    }}
                  >
                    <h2 className="text-xl md:text-2xl font-bold mb-4 bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent" style={{ fontFamily: 'Inter, sans-serif' }}>
                      👋 Welcome to yourTutor AI
                    </h2>
                  </motion.div>
                  <motion.p 
                    className="text-sm md:text-base mb-4" 
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Share how you're feeling to get personalized mental health support.
                  </motion.p>
                  <motion.div 
                    className="text-xs md:text-sm" 
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <StatusIndicator status={backendStatus} />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`flex ${msg.sender === 'User' ? 'justify-end' : 'justify-start'}`}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                >
                  {msg.sender === 'AI' ? (
                    <motion.div 
                      className="w-full max-w-none md:max-w-3xl bg-white/80 backdrop-blur-xl p-4 md:p-5 rounded-2xl shadow-lg border border-white/20"
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <motion.div 
                        className="flex items-center gap-2 mb-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <motion.div 
                          className="w-6 h-6 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs"
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          🧠
                        </motion.div>
                        <h3 className="text-sm md:text-lg font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent" style={{ fontFamily: 'Inter, sans-serif' }}>
                       yourTutor AI
                        </h3>
                      </motion.div>
                      <motion.div 
                        className="text-sm md:text-base leading-relaxed whitespace-pre-line" 
                        style={{ fontFamily: 'Inter, sans-serif' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        {msg.text}
                      </motion.div>
                      {msg.meta && (
                        <motion.div 
                          className="mt-3 p-3 bg-gradient-to-r from-teal-50/50 to-blue-50/50 backdrop-blur-sm rounded-lg text-xs border border-white/20"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div>🧠 <strong>Type:</strong> {msg.meta.type}</div>
                            <div>🌟 <strong>Confidence:</strong> {msg.meta.confidence}</div>
                            <div>📂 <strong>Source:</strong> {msg.meta.source}</div>
                          </div>
                        </motion.div>
                      )}
                      <motion.div 
                        className="mt-4 p-3 rounded-xl bg-gradient-to-r from-yellow-50/50 to-orange-50/50 backdrop-blur-sm text-xs border border-yellow-200/50"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                      >
                        ⚠️ <strong>Disclaimer:</strong> This is AI-generated advice. Always consult a mental health professional for personalized care.
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="max-w-xs md:max-w-lg p-3 md:p-4 rounded-2xl shadow-md bg-gradient-to-br from-blue-500 to-teal-500 text-white rounded-br-none"
                      whileHover={{ scale: 1.02 }}
                    >
                      <p className="text-sm md:text-base whitespace-pre-line" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {msg.text}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {loading && (
              <motion.div 
                className="flex justify-start max-w-4xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-full max-w-3xl bg-white/80 backdrop-blur-xl p-4 md:p-5 rounded-2xl shadow-lg border border-white/20">
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Skeleton count={3} height={20} className="rounded-lg mb-2" />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        <motion.div 
          className="fixed bottom-0 left-0 right-0 md:left-64 border-t border-white/20 bg-white/80 backdrop-blur-xl p-4 md:p-6 z-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-2 md:gap-3">
              <motion.textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="How are you feeling today?"
                rows="1"
                className="flex-1 px-4 py-3 bg-white/50 backdrop-blur-sm rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-white/30 transition-all resize-none text-sm md:text-base hover:bg-white/70 focus:bg-white/80 overflow-hidden"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  minHeight: '48px',
                  maxHeight: '120px',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                disabled={backendStatus === 'offline' || !user}
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FloatingButton 
                  onClick={analyzeData} 
                  disabled={loading || !input.trim() || !user}
                  className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500"
                >
                  {loading ? (
                    <motion.div 
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <motion.div
                      whileHover={{ x: 2 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Send size={20} />
                    </motion.div>
                  )}
                </FloatingButton>
              </motion.div>
            </div>
            <motion.div 
              className="mt-2 text-xs text-gray-500 text-center md:hidden" 
              style={{ fontFamily: 'Inter, sans-serif' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Press Enter to send
            </motion.div>
          </div>
        </motion.div>
      </main>
      
      <style>{`
        @keyframes floatDot {
          0% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-30px); opacity: 0.5; }
          100% { transform: translateY(-60px); opacity: 0; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        
        /* Hide scrollbars for textarea */
        textarea::-webkit-scrollbar {
          display: none;
        }
        
        textarea {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Enhanced scrollbar styling for main content */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #14b8a6, #3b82f6);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0d9488, #2563eb);
        }
        
        /* Glassmorphism effects */
        .backdrop-blur-xl {
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        
        /* Smooth transitions for all interactive elements */
        * {
          transition-property: color, background-color, border-color, transform, filter, backdrop-filter;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }
      `}</style>
    </div>
  );
}