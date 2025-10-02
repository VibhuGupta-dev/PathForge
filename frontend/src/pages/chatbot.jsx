import React, { useState, useEffect, useRef } from "react";
import { Send, Menu, X, ArrowLeft, Sparkles, Mail, RefreshCw, LogOut, MessageSquare, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FloatingButton from "../components/FloatingButton";
import Skeleton from "react-loading-skeleton";
import ReactMarkdown from 'react-markdown';

const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-rose-950 animate-gradient-shift"></div>
    <motion.div
      className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-cyan-400/15 to-blue-500/15 rounded-full blur-[140px]"
      animate={{ scale: [1, 1.2, 1], x: [0, 60, 0], y: [0, 40, 0] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-violet-400/15 to-fuchsia-500/15 rounded-full blur-[140px]"
      animate={{ scale: [1, 1.3, 1], x: [0, -60, 0], y: [0, -40, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-to-br from-amber-400/10 to-orange-500/10 rounded-full blur-[140px]"
      animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    />
    <div className="absolute inset-0 bg-grid-pattern opacity-[0.06]"></div>
    {[...Array(25)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-white/20 rounded-full"
        style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
        animate={{ y: [0, -40, 0], opacity: [0.2, 0.7, 0.2] }}
        transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
      />
    ))}
  </div>
);

const StatusIndicator = ({ status }) => (
  <motion.div 
    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg" 
    initial={{ opacity: 0, scale: 0.8 }} 
    animate={{ opacity: 1, scale: 1 }} 
    transition={{ duration: 0.5 }}
  >
    <motion.span
      className={`w-2.5 h-2.5 rounded-full ${
        status === "online" ? "bg-emerald-400" : 
        status === "offline" ? "bg-rose-400" : 
        "bg-amber-400"
      } shadow-lg`}
      animate={{ 
        scale: status === "online" ? [1, 1.4, 1] : status === "checking" ? [1, 1.3, 1] : 1,
        boxShadow: status === "online" ? [
          "0 0 0 0 rgba(52, 211, 153, 0.7)",
          "0 0 0 10px rgba(52, 211, 153, 0)",
          "0 0 0 0 rgba(52, 211, 153, 0)"
        ] : []
      }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    />
    <span className="text-xs font-semibold text-white">
      {status === "online" ? "Online" : status === "offline" ? "Offline" : "Checking..."}
    </span>
  </motion.div>
);

export default function ChatbotPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [showHistory, setShowHistory] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const init = async () => {
      setInitialLoading(true);
      await checkBackendStatus();
      await fetchUserData();
      setInitialLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (user && backendStatus === "online") {
      fetchHistory();
      fetchReport();
    }
  }, [user, backendStatus]);

  const checkBackendStatus = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_AI_BACKEND_URL}/health`, { timeout: 5000 });
      setBackendStatus(response.status === 200 ? "online" : "offline");
      return response.status === 200;
    } catch (err) {
      console.error("Backend check failed:", err.message);
      setBackendStatus("offline");
      return false;
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, { withCredentials: true });
      setUser(response.data.user);
    } catch (err) {
      console.error("User fetch error:", err.response?.data || err.message);
      navigate("/signin");
    }
  };

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${import.meta.env.VITE_AI_BACKEND_URL}/api/analyses?userId=${user.id}`, { withCredentials: true });
      if (response.data.success) {
        setHistory(response.data.data);
      }
    } catch (err) {
      console.error("History fetch error:", err.response?.data || err.message);
    }
  };

  const fetchReport = async () => {
    if (!user || backendStatus !== "online") return;
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_AI_BACKEND_URL}/api/ai-report?userId=${user.id}`, { withCredentials: true });
      const result = response.data;
      const botMessage = {
        sender: "AI",
        text: result.analysis || result.error || "No career advice available",
        meta: {
          type: result.type || "unknown",
          confidence: result.confidence || "N/A",
          source: result.source || "AI",
          timestamp: result.timestamp || new Date().toISOString(),
        },
      };
      setMessages([botMessage]);
    } catch (err) {
      console.error("Report fetch error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeData = async () => {
    if (!input.trim() || !user) return;
    setLoading(true);
    const userMessage = { sender: "User", text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const online = await checkBackendStatus();
      if (!online) throw new Error("Server is offline. Please try again later.");

      const response = await axios.post(
        `${import.meta.env.VITE_AI_BACKEND_URL}/api/ai-chat`,
        { message: input, userId: user.id },
        { withCredentials: true }
      );
      const result = response.data;
      const botMessage = {
        sender: "AI",
        text: result.response || result.error || "No response available",
        meta: {
          type: result.type || "unknown",
          confidence: result.confidence || "N/A",
          source: result.source || "AI",
          timestamp: result.timestamp || new Date().toISOString(),
        },
      };
      setMessages((prev) => [...prev, botMessage]);
      fetchHistory();
    } catch (err) {
      console.error("Chat error:", err.response?.data || err.message);
    } finally {
      setInput("");
      setLoading(false);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      analyzeData();
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <AnimatedBackground />
      
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className="fixed top-0 left-0 z-50 w-80 md:w-80 h-screen bg-gradient-to-br from-white/[0.12] to-white/[0.05] backdrop-blur-2xl border-r border-white/20 shadow-2xl flex flex-col"
        initial={{ x: "-100%" }}
        animate={{ x: sidebarOpen || window.innerWidth >= 768 ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      >
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <motion.h2
            className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent"
            animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% auto" }}
          >
            CareerMentor
          </motion.h2>
          <motion.button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
          >
            <X size={24} />
          </motion.button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {user && (
            <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex flex-col items-center gap-4 mb-6">
                <motion.div
                  className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500 via-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-3xl font-bold shadow-2xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {user.Fullname?.[0]?.toUpperCase() || "U"}
                  <motion.div
                    className="absolute -top-1 -right-1 text-amber-300"
                    animate={{ rotate: [0, 360], scale: [1, 1.3, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Sparkles size={20} />
                  </motion.div>
                </motion.div>
                <div className="text-center w-full">
                  <h3 className="text-xl font-bold text-white mb-1">{user.Fullname || "User"}</h3>
                  <div className="flex items-center justify-center gap-2 text-gray-300 text-sm">
                    <Mail className="w-3.5 h-3.5" />
                    <p className="truncate max-w-[200px]">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-300">AI Status</span>
                  <StatusIndicator status={backendStatus} />
                </div>
                <motion.button
                  onClick={checkBackendStatus}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white border border-white/10"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCw className="w-4 h-4" />
                  Check Status
                </motion.button>
              </div>

              <div className="space-y-3">
                <motion.button
                  onClick={() => { setMessages([]); setSidebarOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageSquare className="w-4 h-4" />
                  New Chat
                </motion.button>
                <motion.button
                  onClick={() => setShowHistory(!showHistory)}
                  disabled={history.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold shadow-lg border border-white/20 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Clock className="w-4 h-4" />
                  {showHistory ? "Hide History" : "Show History"}
                </motion.button>
              </div>

              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    className="mt-4 space-y-2 max-h-80 overflow-y-auto"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {history.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">No history available</p>
                    ) : (
                      history.map((item, i) => (
                        <motion.div
                          key={i}
                          className="p-3 bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-xl cursor-pointer border border-white/10"
                          onClick={() => {
                            setMessages([
                              { sender: "User", text: item.userInput.text },
                              { sender: "AI", text: item.aiResponse.response, meta: item.aiResponse },
                            ]);
                            setSidebarOpen(false);
                          }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                        >
                          <p className="text-white text-sm font-semibold truncate mb-1">
                            {item.userInput.text.slice(0, 40)}...
                          </p>
                          <p className="text-gray-400 text-xs truncate mb-2">
                            {item.aiResponse.response.slice(0, 50)}...
                          </p>
                          <p className="text-gray-500 text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.timestamp).toLocaleDateString()}
                          </p>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        <div className="p-6 border-t border-white/10 space-y-3">
          <motion.button
            onClick={() => navigate("/features")}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm text-white font-semibold shadow-lg border border-white/20"
            whileHover={{ scale: 1.02, x: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Features
          </motion.button>
          <motion.button
            onClick={() => window.location.href = "/signin"}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </motion.button>
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col min-w-0 ml-0 md:ml-80 relative z-10">
        <motion.header
          className="md:hidden flex items-center justify-between p-4 bg-white/[0.08] backdrop-blur-2xl border-b border-white/10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2">
            <motion.button onClick={() => navigate("/features")} className="p-2 hover:bg-white/10 rounded-xl" whileHover={{ scale: 1.1, x: -3 }} whileTap={{ scale: 0.95 }}>
              <ArrowLeft size={24} />
            </motion.button>
            <motion.button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-white/10 rounded-xl" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Menu size={24} />
            </motion.button>
          </div>
          <motion.h1
            className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent"
            animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% auto" }}
          >
            CareerMentor
          </motion.h1>
          <StatusIndicator status={backendStatus} />
        </motion.header>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 pb-32">
          <AnimatePresence mode="wait">
            {messages.length === 0 && !initialLoading && (
              <motion.div
                className="flex flex-col items-center justify-center mt-12 md:mt-24 px-4 text-center max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
              >
                <div className="relative bg-gradient-to-br from-white/[0.12] to-white/[0.05] backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-3xl"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                  <div className="relative z-10">
                    <motion.div
                      className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center shadow-2xl"
                      animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <MessageSquare className="w-10 h-10 text-white" />
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                      Welcome to CareerMentor
                    </h2>
                    <p className="text-lg md:text-xl text-gray-300 mb-4 leading-relaxed">
                      Ask about career paths, skills, or certifications to get personalized advice!
                    </p>
                    <div className="mt-6">
                      <StatusIndicator status={backendStatus} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6 max-w-4xl mx-auto">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`flex ${msg.sender === "User" ? "justify-end" : "justify-start"}`}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                >
                  {msg.sender === "AI" ? (
                    <div className="w-full max-w-3xl bg-gradient-to-br from-white/[0.12] to-white/[0.05] backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20">
                      <div className="flex items-center gap-3 mb-4">
                        <motion.div
                          className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg"
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          <MessageSquare className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                            CareerMentor AI
                          </h3>
                          <p className="text-xs text-gray-400">AI Assistant</p>
                        </div>
                      </div>
                      <div className="text-sm md:text-base leading-relaxed text-gray-200 mb-4 markdown-content">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                      {msg.meta && (
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs space-y-1 mb-3">
                          <div className="grid grid-cols-3 gap-2 text-gray-300">
                            <div><strong>Type:</strong> {msg.meta.type}</div>
                            <div><strong>Confidence:</strong> {msg.meta.confidence}</div>
                            <div><strong>Source:</strong> {msg.meta.source}</div>
                          </div>
                        </div>
                      )}
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                        <strong>Disclaimer:</strong> This is AI-generated advice. Always consult a career counselor for personalized guidance.
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-md p-4 rounded-2xl shadow-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white">
                      <p className="text-sm md:text-base whitespace-pre-line">{msg.text}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="w-full max-w-3xl bg-gradient-to-br from-white/[0.12] to-white/[0.05] backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20">
                  <Skeleton count={3} height={20} baseColor="rgba(255,255,255,0.1)" highlightColor="rgba(255,255,255,0.2)" />
                </div>
              </motion.div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        <motion.div
          className="fixed bottom-0 left-0 right-0 md:left-80 border-t border-white/10 bg-white/[0.08] backdrop-blur-2xl p-4 md:p-6 z-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about career paths, skills, or certifications..."
                rows="1"
                className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 border border-white/20 resize-none text-sm md:text-base"
                style={{ minHeight: "48px", maxHeight: "120px" }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                disabled={backendStatus === "offline" || !user}
              />
              <motion.button
                onClick={analyzeData}
                disabled={loading || !input.trim() || !user}
                className="px-5 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </motion.button>
            </div>
            <p className="mt-2 text-xs text-gray-400 text-center md:hidden">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </motion.div>
      </main>

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
        textarea::-webkit-scrollbar { display: none; }
        textarea { -ms-overflow-style: none; scrollbar-width: none; }
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 5px; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #06b6d4, #8b5cf6); border-radius: 5px; }
        ::-webkit-scrollbar-thumb:hover { background: linear-gradient(to bottom, #0891b2, #7c3aed); }
        .react-render-markup h1, .react-render-markup h2, .react-render-markup h3 {
          font-weight: 600;
          color: #f3f4f6;
          margin: 0.5rem 0;
        }
        .react-render-markup p {
          margin: 0.5rem 0;
          color: #e5e7eb;
        }
        .react-render-markup ul, .react-render-markup ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
          color: #e5e7eb;
        }
        .react-render-markup li {
          margin-bottom: 0.25rem;
        }
        .react-render-markup strong {
          color: #ffffff;
          font-weight: 600;
        }
        .react-render-markup code {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.9em;
        }
        .markdown-content h1, .markdown-content h2, .markdown-content h3,
        .markdown-content h4, .markdown-content h5, .markdown-content h6 {
          font-weight: 600;
          color: #f3f4f6;
          margin: 0.75rem 0 0.5rem 0;
        }
        .markdown-content h1 { font-size: 1.5em; }
        .markdown-content h2 { font-size: 1.3em; }
        .markdown-content h3 { font-size: 1.1em; }
        .markdown-content p {
          margin: 0.5rem 0;
          color: #e5e7eb;
          line-height: 1.6;
        }
        .markdown-content ul, .markdown-content ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
          color: #e5e7eb;
        }
        .markdown-content li {
          margin-bottom: 0.375rem;
          line-height: 1.6;
        }
        .markdown-content strong, .markdown-content b {
          color: #ffffff;
          font-weight: 600;
        }
        .markdown-content em, .markdown-content i {
          color: #d1d5db;
          font-style: italic;
        }
        .markdown-content code {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.9em;
          color: #fbbf24;
          font-family: 'Courier New', monospace;
        }
        .markdown-content pre {
          background: rgba(0, 0, 0, 0.3);
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 0.75rem 0;
        }
        .markdown-content pre code {
          background: transparent;
          padding: 0;
          color: #e5e7eb;
        }
        .markdown-content a {
          color: #60a5fa;
          text-decoration: underline;
        }
        .markdown-content a:hover {
          color: #93c5fd;
        }
        .markdown-content blockquote {
          border-left: 4px solid rgba(139, 92, 246, 0.5);
          padding-left: 1rem;
          margin: 0.75rem 0;
          color: #d1d5db;
          font-style: italic;
        }
        .markdown-content hr {
          border: none;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          margin: 1rem 0;
        }
        .markdown-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 0.75rem 0;
        }
        .markdown-content th, .markdown-content td {
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 0.5rem;
          text-align: left;
        }
        .markdown-content th {
          background: rgba(255, 255, 255, 0.1);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}