import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Menu, X } from "lucide-react";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Unauthorized");

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching profile:", error.message);
        setUser(null);
      }
    };

    fetchProfile();
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message handler
  const analyzeData = async () => {
    if (!input.trim() || !user) return;

    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/ai/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: input }),
        }
      );

      if (!response.ok) throw new Error("AI analysis failed");

      const data = await response.json();
      setMessages((prev) => [...prev, { sender: "ai", text: data.reply }]);
    } catch (err) {
      console.error("Error analyzing data:", err.message);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "❌ Failed to get response from AI" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="fixed inset-y-0 left-0 w-64 bg-gray-900/95 backdrop-blur-xl z-50 p-6 shadow-2xl border-r border-white/10"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold">Menu</h2>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={24} />
              </button>
            </div>

            {/* Sidebar - New Chat Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <button
                onClick={() => {
                  setMessages([]);
                  setSidebarOpen(false);
                }}
                className="w-full mb-4 px-4 py-2 rounded-lg text-white text-sm md:text-base 
                           bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 
                           transform hover:scale-105 transition-all duration-200"
              >
                ✨ New Chat
              </button>
            </motion.div>

            {/* Sidebar - Logout Button */}
            <div className="p-4 md:p-6 border-t border-white/20">
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/signin";
                }}
                className="w-full px-4 py-2 rounded-lg text-white text-sm md:text-base
                           bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600
                           transform hover:scale-105 transition-all duration-200"
              >
                🚪 Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-4 bg-gray-900/60 backdrop-blur-md border-b border-white/10">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={28} />
          </button>
          <h1 className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
            AI Career Counselor
          </h1>
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center">
            {user?.name?.[0]?.toUpperCase() || "?"}
          </div>
        </header>

        {/* Chat Messages */}
        <main className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-4 rounded-lg max-w-lg ${
                msg.sender === "user"
                  ? "ml-auto bg-gradient-to-r from-teal-600 to-blue-600 text-white"
                  : "mr-auto bg-gray-700 text-gray-100"
              }`}
            >
              {msg.text}
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </main>

        {/* Input Section */}
        <footer className="p-4 bg-gray-900/60 backdrop-blur-md border-t border-white/10">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask me about your career..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={analyzeData}
                disabled={loading || !input.trim() || !user}
                className="p-3 rounded-lg text-white bg-gradient-to-r from-teal-500 to-blue-500 
                           hover:from-teal-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500"
              >
                {loading ? (
                  <motion.div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </motion.div>
          </div>
        </footer>
      </div>
    </div>
  );
}
