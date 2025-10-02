import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Sparkles, Zap, Target, Users } from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Navbar from "../components/NavBar";
import { useNavigate } from "react-router-dom";

const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-rose-950 animate-gradient-shift"></div>
    
    <motion.div
      className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-[150px]"
      animate={{
        scale: [1, 1.2, 1],
        x: [0, 80, 0],
        y: [0, 50, 0],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-violet-400/20 to-fuchsia-500/20 rounded-full blur-[150px]"
      animate={{
        scale: [1, 1.3, 1],
        x: [0, -80, 0],
        y: [0, -50, 0],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-gradient-to-br from-amber-400/15 to-orange-500/15 rounded-full blur-[150px]"
      animate={{
        scale: [1, 1.15, 1],
        rotate: [0, 180, 360],
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
    />
    
    <div className="absolute inset-0 bg-grid-pattern opacity-[0.08]"></div>
    
    {[...Array(30)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1.5 h-1.5 bg-white/30 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -50, 0],
          opacity: [0.3, 0.8, 0.3],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 4 + Math.random() * 3,
          repeat: Infinity,
          delay: Math.random() * 3,
        }}
      />
    ))}
  </div>
);

export default function Landing() {
  const navigate = useNavigate();
  const featuresRef = useRef(null);
  const isInView = useInView(featuresRef, { once: true, amount: 0.3 });

  const blocks = [
    {
      query: "Need guidance to be a web developer",
      response: "Start with HTML, CSS, and JavaScript. Build small static pages to understand structure, styling, and interactivity. Master responsive design with Flexbox and Grid. Consider Tailwind CSS for fast, utility-based styling...",
      icon: "💻",
      gradient: "from-cyan-500 to-blue-600"
    },
    {
      query: "Want to be a doctor",
      response: "NCERT First! Biology: Learn NCERT line by line, every diagram, every example. 70% of NEET Bio is straight from NCERT. Chemistry: Focus on NCERT for Inorganic & Physical basics. Physics: NCERT + strong problem-solving practice...",
      icon: "🏥",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      query: "How to become a data scientist",
      response: "Master Python and libraries like NumPy, Pandas, Scikit-learn. Learn statistics and probability fundamentals. Practice on real datasets from Kaggle. Build projects showcasing ML models and data visualization...",
      icon: "📊",
      gradient: "from-violet-500 to-purple-600"
    },
    {
      query: "Career path in graphic design",
      response: "Learn Adobe Creative Suite (Photoshop, Illustrator, InDesign). Study design principles, color theory, and typography. Build a strong portfolio. Practice with real client projects and freelance work...",
      icon: "🎨",
      gradient: "from-pink-500 to-rose-600"
    }
  ];

  const features = [
    { icon: Target, text: "Personalized Roadmaps", gradient: "from-cyan-500 to-blue-600" },
    { icon: Zap, text: "AI-Powered Insights", gradient: "from-violet-500 to-purple-600" },
    { icon: Sparkles, text: "24/7 Support", gradient: "from-amber-500 to-orange-600" },
    { icon: Users, text: "Community Support", gradient: "from-emerald-500 to-teal-600" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % blocks.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [blocks.length]);

  const currentBlock = blocks[currentIndex];
  const nextBlock = blocks[(currentIndex + 1) % blocks.length];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-950">
      <AnimatedBackground />
      <Navbar />

      <section className="relative z-10 flex flex-col items-center justify-center px-6 md:px-12 py-20 flex-grow max-w-7xl mx-auto w-full">
        {/* Hero Content */}
        <motion.div
          className="flex flex-col items-center text-center space-y-8 mb-20"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-sm text-white shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI-Powered Career Guidance</span>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.h1
              className="text-5xl md:text-7xl font-extrabold mb-4"
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
              PathForge
            </motion.h1>
          </motion.div>

          <motion.h2
            className="text-3xl md:text-5xl text-white font-bold leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Have Interest
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              But Need Guidance?
            </span>
          </motion.h2>

          <motion.p
            className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            PathForge — your personalized learning companion! Tailored guidance,
            expert support, and smart resources to turn your interest into
            mastery.
          </motion.p>

          {/* CTA Button */}
          <motion.button
            onClick={() => navigate("/signin")}
            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 text-white text-lg font-bold rounded-xl shadow-2xl hover:shadow-violet-500/50 transition-all duration-300"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Free
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </motion.button>

          <motion.p
            className="text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            No credit card required • Start learning today
          </motion.p>
        </motion.div>

        {/* Animated Chat Blocks */}
        <div className="w-full max-w-4xl mb-24">
          <div className="relative w-full h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                className="absolute inset-0 flex flex-col gap-6"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.6 }}
              >
                {/* User Query Card */}
                <motion.div
                  className="ml-auto max-w-md"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl p-4 shadow-2xl">
                    <p className="text-white font-medium">{currentBlock.query}</p>
                  </div>
                </motion.div>

                {/* AI Response Card */}
                <motion.div
                  className="mr-auto max-w-lg"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="relative bg-gradient-to-br from-white/[0.15] to-white/[0.05] backdrop-blur-2xl rounded-2xl p-6 shadow-2xl border border-white/20">
                    <motion.div
                      className={`absolute -inset-1 bg-gradient-to-r ${currentBlock.gradient} opacity-20 blur-xl rounded-2xl`}
                      animate={{ opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <motion.div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentBlock.gradient} flex items-center justify-center shadow-lg text-xl`}
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {currentBlock.icon}
                        </motion.div>
                        <div>
                          <h4 className="text-white font-bold text-sm">PathForge AI</h4>
                          <p className="text-gray-400 text-xs">Career Assistant</p>
                        </div>
                      </div>

                      <p className="text-gray-200 text-sm leading-relaxed">
                        {currentBlock.response}
                      </p>

                      <motion.div
                        className="flex items-center gap-1 mt-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-violet-400 rounded-full"
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                          />
                        ))}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="ml-auto max-w-xs opacity-30"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 0.3, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="bg-gradient-to-br from-violet-500/50 to-fuchsia-600/50 rounded-2xl p-3 backdrop-blur-sm">
                    <p className="text-white text-sm">{nextBlock.query}</p>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex gap-2">
              {blocks.map((_, idx) => (
                <motion.div
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? "bg-violet-500 w-8" : "bg-white/30 w-2"
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Features Section - In a Row with Scroll Animation */}
        <motion.div
          ref={featuresRef}
          className="w-full max-w-6xl"
          initial={{ opacity: 0, y: 100 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h3
            className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ delay: 0.2 }}
          >
            Why Choose PathForge?
          </motion.h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                className="group relative"
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ delay: 0.3 + idx * 0.1, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.03 }}
              >
                <div className="relative h-full bg-gradient-to-br from-white/[0.12] to-white/[0.05] backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl transition-all duration-300 group-hover:border-white/40 group-hover:shadow-2xl">
                  <motion.div
                    className={`absolute -inset-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl rounded-2xl transition-opacity duration-500`}
                  />
                  
                  <div className="relative z-10 flex flex-col items-center text-center gap-4">
                    <motion.div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h4 className="text-lg font-bold text-white">{feature.text}</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {idx === 0 && "Get custom learning paths tailored to your career goals"}
                      {idx === 1 && "Leverage AI to discover the best opportunities for you"}
                      {idx === 2 && "Access guidance anytime, anywhere with our AI assistant"}
                      {idx === 3 && "Connect with learners and mentors in your field"}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-6 bg-white/[0.03] backdrop-blur-xl border-t border-white/10 text-center">
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} PathForge. All rights reserved.{" "}
          <span className="text-violet-400">Built with passion for learners</span>
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