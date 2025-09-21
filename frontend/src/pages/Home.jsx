import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/NavBar";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  const blocks = [
    "Need guidance to be a web developer",
    `Great! Start with HTML, CSS, and JavaScript.\nBuild small static pages to understand structure, styling, and interactivity.\nMaster responsive design with Flexbox and Grid.\nConsider Tailwind CSS for fast, utility-based styling...`,
    "Want to be a doctor",
    `NCERT First\nBiology: Learn NCERT line by line, every diagram, every example. 70% of NEET Bio is straight from NCERT.\nChemistry: Focus on NCERT for Inorganic & Physical basics.\nPhysics: NCERT + strong problem-solving practice...`
  ];

  const [startIndex, setStartIndex] = useState(0);
  const displayCount = 2;

  useEffect(() => {
    const interval = setInterval(() => {
      setStartIndex((prev) => (prev + displayCount) % blocks.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [displayCount, blocks.length]);

  const visibleBlocks = [];
  for (let i = 0; i < displayCount; i++) {
    visibleBlocks.push(blocks[(startIndex + i) % blocks.length]);
  }

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.4 } },
  };

  const item = {
    hidden: { opacity: 0, y: 50, rotateX: -30, rotateY: 30 },
    show: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      rotateY: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
    exit: { opacity: 0, y: -50, rotateX: 30, rotateY: -30 },
  };

  const heroText = {
    hidden: { opacity: 0, y: 50 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut" },
    },
  };

  const handleStarted = () => {
    navigate("/SignIn");
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-900">
      <Navbar />

      {/* Particle Background */}
      <div className="absolute inset-0 z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white opacity-20 rounded-full"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${15 + Math.random() * 10}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col md:flex-row items-center justify-center px-6 md:px-12 gap-12 py-12 flex-grow">
        {/* Hero Content */}
        <motion.div
          className="flex-1 flex flex-col items-center md:items-center text-center space-y-6"
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
            YourTutor
          </motion.h2>

          <motion.p
            className="text-3xl md:text-5xl text-white"
            style={{ fontFamily: "Inter, sans-serif" }}
            variants={heroText}
          >
            Have Interest
            <br />
            But Need Guidance?
          </motion.p>

          <motion.p
            className="text-lg md:text-xl text-gray-300 max-w-lg"
            variants={heroText}
          >
            YourTutor — your personalized learning companion! Tailored guidance,
            expert support, and smart resources to turn your interest into
            mastery.
          </motion.p>

          <motion.div
            className="flex justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-lg rounded-xl hover:bg-indigo-700 transition duration-300"
              onClick={handleStarted}
            >
              Get Started <ArrowRight size={20} />
            </button>
          </motion.div>
        </motion.div>

        {/* Animated Blocks */}
        <div className="flex-1 flex items-center justify-center w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={startIndex}
              variants={container}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="flex flex-col items-center gap-4 w-full max-w-md"
            >
              {visibleBlocks.map((block, idx) => (
                <motion.div
                  key={(startIndex + idx) % blocks.length}
                  variants={item}
                  className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl shadow-lg flex flex-col justify-start text-white font-semibold text-left px-6 py-4 relative max-w-md w-full border border-gray-600"
                  style={{ transformStyle: "preserve-3d" }}
                  whileHover={{
                    rotateY: 5,
                    rotateX: -5,
                    scale: 1.02,
                    zIndex: 10,
                  }}
                >
                  <div className="pl-10 whitespace-pre-line text-sm md:text-base">
                    {block}
                  </div>
                  {idx % 2 === 0 && (
                    <img
                      src="https://imgs.search.brave.com/SIy9CTnfHb3v7z8gsZIAvVYaTsLuubJu-AI28zsPodU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzL2MxLzgx/L2Y4L2MxODFmODYw/N2MxM2I1NGZmN2U2/NmQ0MDRiNjQ1YWMx/LmpwZw"
                      alt="icon"
                      className="absolute left-2 top-3 object-cover rounded-full h-8 w-8"
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-4 bg-gray-800 bg-opacity-50 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} YourTutor. All rights reserved.
      </footer>

      {/* Particle Animation */}
      <style>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotateX(0deg) rotateY(0deg);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-100vh) rotateX(360deg) rotateY(360deg);
            opacity: 0.2;
          }
          100% {
            transform: translateY(-200vh) rotateX(720deg) rotateY(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}