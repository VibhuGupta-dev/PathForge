import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Lock, PlayCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, type: 'spring', stiffness: 100 } }
};

const dayVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, type: 'spring' } }
};

const progressBarVariants = {
  initial: { width: 0 },
  animate: (progress) => ({
    width: `${progress}%`,
    transition: { duration: 1.5, ease: 'easeInOut' }
  })
};

const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <motion.div 
      className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-teal-400/20 via-blue-400/20 to-purple-400/20 rounded-full blur-4xl"
      animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
    />
    <motion.div 
      className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/15 via-pink-400/15 to-orange-400/15 rounded-full blur-4xl"
      animate={{ scale: [1, 1.15, 1], rotate: [0, -180, -360] }}
      transition={{ duration: 25, repeat: Infinity, ease: 'linear', delay: 5 }}
    />
    {[...Array(25)].map((_, i) => (
      <motion.div
        key={i}
        className={`absolute rounded-full ${
          i % 3 === 0 ? 'bg-teal-400/40' : i % 3 === 1 ? 'bg-blue-400/40' : 'bg-purple-400/40'
        }`}
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: `${1.5 + Math.random() * 2}px`,
          height: `${1.5 + Math.random() * 2}px`,
        }}
        animate={{
          y: [-30, -120, -30],
          x: [0, Math.random() * 40 - 20, 0],
          opacity: [0.3, 0.8, 0.3],
          scale: [0.6, 1.3, 0.6],
        }}
        transition={{
          duration: 4 + Math.random() * 3,
          repeat: Infinity,
          delay: Math.random() * 3,
          ease: 'easeInOut'
        }}
      />
    ))}
    <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
  </div>
);

export default function Days() {
  const [day, setDay] = useState(1);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const getDayTitle = (day) => {
    const titles = [
      'Understanding Mental Health',
      'Managing Stress',
      'Building Resilience',
      'Mindfulness Meditation',
      'Gratitude Practice',
      'Self-Compassion',
      'Positive Affirmations',
      'Healthy Sleep Habits',
      'Emotional Awareness',
      'Coping with Anxiety',
      'Setting Boundaries',
      'Finding Purpose',
      'Mindful Breathing',
      'Overcoming Negative Thoughts',
      'Building Confidence',
      'Stress Reduction Techniques',
      'Emotional Regulation',
      'Self-Care Routines',
      'Healthy Relationships',
      'Mindful Eating',
      'Dealing with Depression',
      'Boosting Self-Esteem',
      'Managing Overthinking',
      'Cultivating Joy',
      'Resilience in Adversity',
      'Inner Peace Practices',
      'Goal Setting',
      'Forgiveness and Healing',
      'Creative Expression',
      'Mindful Movement',
      'Celebrating Progress',
    ];
    return titles[day - 1] || `Mental Health Journey`;
  };

  const getVideoUrl = (day) => {
    const videoIds = [
      '7n2-QUushsY', // Day 1
      '4JCH9pCdmRs', // Day 2
      'MHWYDV02onU', // Day 3
      'fNvKgL9grR0', // Day 4
      '3_8bD0_nAZU', // Day 5
      '10xWg4AybMM', // Day 6
      'jczbnCvJHu4', // Day 7
      'HeZfB4q_kT0', // Day 8
      'ibpzqE6ozT4', // Day 9
      'l7ub_qine3s', // Day 10
      'ziRU0ZgzOEQ', // Day 11
      'VfT8Ae7vAKs', // Day 12
      'V9wnpQ0nbo4', // Day 13
      'eqOQ6kPWtQQ', // Day 14
      'BRBGpDc-c9c', // Day 15
      '7n_7Asg1Byw', // Day 16
      'HjfQ_0eN3Zc', // Day 17
      'm_DtHgq1Xyk', // Day 18
      'LPVTMvixsMM', // Day 19
      'Ctil-Xbo5Cg', // Day 20
      'xvzwGOed6Zg', // Day 21
      'sRR1wGQPDK8', // Day 22
      'r7spPSYXvmE', // Day 23
      'lB07A05rl1c', // Day 24
      '2S4lzRxMPeQ', // Day 25
      '8S4y1nbQHpc', // Day 26
      'pGthZVxR9-M', // Day 27
      'teyy2QY_Fnk', // Day 28
      'dQw4w9WgXcQ', // Day 29 (Placeholder)
      'dQw4w9WgXcQ', // Day 30 (Placeholder)
      'dQw4w9WgXcQ', // Day 31 (Placeholder)
    ];
    const embedUrl = `https://www.youtube.com/embed/${videoIds[day - 1]}?rel=0&modestbranding=1&enablejsapi=1`;
    console.log(`Loading video for Day ${day}: ${embedUrl}`);
    return embedUrl;
  };

  const getYouTubeLink = (day) => {
    const videoIds = [
      '7n2-QUushsY', '4JCH9pCdmRs', 'MHWYDV02onU', 'fNvKgL9grR0', '3_8bD0_nAZU',
      '10xWg4AybMM', 'jczbnCvJHu4', 'HeZfB4q_kT0', 'ibpzqE6ozT4', 'l7ub_qine3s',
      'ziRU0ZgzOEQ', 'VfT8Ae7vAKs', 'V9wnpQ0nbo4', 'eqOQ6kPWtQQ', 'BRBGpDc-c9c',
      '7n_7Asg1Byw', 'HjfQ_0eN3Zc', 'm_DtHgq1Xyk', 'LPVTMvixsMM', 'Ctil-Xbo5Cg',
      'xvzwGOed6Zg', 'sRR1wGQPDK8', 'r7spPSYXvmE', 'lB07A05rl1c', '2S4lzRxMPeQ',
      '8S4y1nbQHpc', 'pGthZVxR9-M', 'teyy2QY_Fnk', 'dQw4w9WgXcQ', 'dQw4w9WgXcQ',
      'dQw4w9WgXcQ',
    ];
    return `https://www.youtube.com/watch?v=${videoIds[day - 1]}`;
  };

  const videos = Array.from({ length: 31 }, (_, i) => ({
    id: i + 1,
    title: `Day ${i + 1}: ${getDayTitle(i + 1)}`,
    videoUrl: getVideoUrl(i + 1),
  }));

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/motivational-program/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgress(response.data.progress || []);
      setDay(response.data.currentDay || 1);
    } catch (err) {
      console.error('Progress fetch error:', err);
      setError('Failed to load progress. Starting fresh.');
      setProgress([]);
    } finally {
      setLoading(false);
    }
  };

  const markDayComplete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/motivational-program/complete-day`, { day }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgress(prev => [...new Set([...prev, day])]);
      setDay(prev => Math.min(prev + 1, 31));
    } catch (err) {
      console.error('Complete day error:', err);
      setError('Failed to mark day as complete. Please try again.');
    }
  };

  const isDayUnlocked = (d) => {
    if (d === 1) return true;
    return progress.includes(d - 1);
  };

  const handleDaySelect = (newDay) => {
    if (isDayUnlocked(newDay)) {
      setDay(newDay);
      setVideoLoading(true);
    }
  };

  const currentVideo = videos[day - 1];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <PlayCircle size={48} className="text-teal-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden font-sans">
      <AnimatedBackground />
      <motion.div
        className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 max-w-7xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left Side: Calendar Tracker */}
        <motion.div
          className="lg:w-1/3 bg-white/10 backdrop-blur-2xl rounded-2xl p-6 shadow-2xl border border-white/10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Mental Health Journey</h2>
            <CheckCircle className="text-teal-400" size={24} />
          </div>
          <div className="grid grid-cols-7 gap-2 mb-6">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
              <div key={day} className="text-center text-gray-400 text-xs font-medium uppercase tracking-wider">
                {day}
              </div>
            ))}
            {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
              <motion.button
                key={d}
                onClick={() => handleDaySelect(d)}
                disabled={!isDayUnlocked(d)}
                className={`relative p-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  d === day
                    ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg'
                    : isDayUnlocked(d)
                    ? 'bg-teal-700/50 text-teal-200 hover:bg-teal-700/70'
                    : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                } ${progress.includes(d) ? 'ring-2 ring-green-400' : ''}`}
                variants={dayVariants}
                whileHover={{ scale: isDayUnlocked(d) ? 1.1 : 1 }}
                whileTap={{ scale: isDayUnlocked(d) ? 0.95 : 1 }}
                title={isDayUnlocked(d) ? `Go to Day ${d}` : `Complete Day ${d - 1} to unlock`}
              >
                {d}
                {progress.includes(d) && (
                  <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-green-400" />
                )}
              </motion.button>
            ))}
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-3 mb-4">
            <motion.div
              className="bg-gradient-to-r from-teal-500 to-blue-600 h-3 rounded-full shadow-inner"
              variants={progressBarVariants}
              initial="initial"
              animate="animate"
              custom={(progress.length / 31) * 100}
            />
          </div>
          <motion.p
            className="text-center text-sm text-gray-300 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {progress.length} / 31 days completed ({Math.round((progress.length / 31) * 100)}%)
          </motion.p>
        </motion.div>

        {/* Right Side: Video Player */}
        <motion.div
          className="lg:w-2/3 bg-white/10 backdrop-blur-2xl rounded-2xl p-8 shadow-2xl border border-white/10"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">{currentVideo.title}</h2>
            <div className="text-sm text-gray-400">
              Day {day} of 31
            </div>
          </div>
          <div className="relative bg-gray-800 rounded-xl overflow-hidden mb-6">
            {videoLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <PlayCircle size={48} className="text-teal-400" />
                </motion.div>
              </div>
            )}
            <iframe
              className="w-full h-48 sm:h-64 md:h-72 lg:h-80"
              src={currentVideo.videoUrl}
              title={currentVideo.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              onLoad={() => setVideoLoading(false)}
              onError={() => {
                setVideoLoading(false);
                setError('Failed to load video. Try opening it on YouTube.');
              }}
            ></iframe>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              onClick={markDayComplete}
              disabled={progress.includes(day)}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 ${
                progress.includes(day)
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:from-teal-600 hover:to-blue-700 shadow-md hover:shadow-xl'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <CheckCircle className="w-5 h-5 mr-2 inline" />
              {progress.includes(day) ? 'Day Completed ✓' : 'Mark as Complete'}
            </motion.button>
            <motion.button
              onClick={() => setDay(prev => Math.max(prev - 1, 1))}
              disabled={day === 1}
              className="px-4 py-3 bg-gray-700/50 text-gray-200 rounded-xl hover:bg-gray-600 disabled:opacity-50 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Previous
            </motion.button>
            <motion.button
              onClick={() => setDay(prev => Math.min(prev + 1, 31))}
              disabled={!isDayUnlocked(day + 1)}
              className="px-4 py-3 bg-gray-700/50 text-gray-200 rounded-xl hover:bg-gray-600 disabled:opacity-50 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Next
            </motion.button>
            <motion.a
              href={getYouTubeLink(day)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 bg-gray-700/50 text-gray-200 rounded-xl hover:bg-gray-600 flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Play on YouTube
            </motion.a>
          </div>
          {error && (
            <motion.p
              className="text-red-400 text-sm mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {error}
            </motion.p>
          )}
        </motion.div>
      </motion.div>
      <motion.button
        onClick={() => navigate('/features')}
        className="fixed top-4 left-4 bg-white/10 backdrop-blur-xl rounded-full p-3 shadow-lg hover:shadow-xl"
        whileHover={{ scale: 1.1, rotate: 360 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft size={24} className="text-teal-400" />
      </motion.button>
      <style jsx>{`
        .bg-grid-pattern {
          background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .backdrop-blur-2xl {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
      `}</style>
    </div>
  );
}