import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CareerQuiz() {
  const navigate=useNavigate()
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Fetch questions from backend
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    
    try {
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/career/questions`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      
      const data = await response.json();
      console.log('Questions fetched:', data);
      
      if (data.success && data.questions) {
        setQuestions(data.questions);
      } else {
        // Fallback to sample data if API fails
        setQuestions(getSampleQuestions());
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions. Using sample data.');
      // Use sample data as fallback
      setQuestions(getSampleQuestions());
    } finally {
      setLoading(false);
    }
  };

  // Sample questions (fallback) - All 10 questions
  const getSampleQuestions = () => [
    {
      id: 1,
      question: "Which subject do you enjoy the most?",
      options: [
        { value: "a", text: "Computers & Technology" },
        { value: "b", text: "Business & Finance" },
        { value: "c", text: "Sports & Fitness" },
        { value: "d", text: "Art & Design" },
        { value: "e", text: "Science & Research" },
        { value: "f", text: "Helping People" },
        { value: "g", text: "Media & Entertainment" },
      ],
    },
    {
      id: 2,
      question: "What kind of work environment do you prefer?",
      options: [
        { value: "a", text: "Quiet and focused (working alone)" },
        { value: "b", text: "Leading and managing a team" },
        { value: "c", text: "Active and energetic (outdoors/field)" },
        { value: "d", text: "Creative and free-flowing" },
        { value: "e", text: "Research-oriented (labs, data)" },
        { value: "f", text: "People-focused (helping, teaching)" },
        { value: "g", text: "Collaborative and expressive" },
      ],
    },
    {
      id: 3,
      question: "What motivates you the most in your career?",
      options: [
        { value: "a", text: "Solving technical problems" },
        { value: "b", text: "Building successful businesses" },
        { value: "c", text: "Winning and achieving high performance" },
        { value: "d", text: "Creating something artistic" },
        { value: "e", text: "Discovering new knowledge" },
        { value: "f", text: "Making people's lives better" },
        { value: "g", text: "Entertaining and inspiring others" },
      ],
    },
    {
      id: 4,
      question: "How do you prefer to learn new things?",
      options: [
        { value: "a", text: "Hands-on experiments and projects" },
        { value: "b", text: "Real-world business experiences" },
        { value: "c", text: "Practice and training with mentors" },
        { value: "d", text: "Creative exploration and trial-and-error" },
        { value: "e", text: "Structured study and research" },
        { value: "f", text: "Workshops and real-life interactions" },
        { value: "g", text: "Feedback and collaboration" },
      ],
    },
    {
      id: 5,
      question: "What kind of problems do you enjoy solving the most?",
      options: [
        { value: "a", text: "Technical glitches and coding challenges" },
        { value: "b", text: "Strategic and financial planning" },
        { value: "c", text: "Team coordination and performance" },
        { value: "d", text: "Design and creative challenges" },
        { value: "e", text: "Research and analysis problems" },
        { value: "f", text: "Social or community-related issues" },
        { value: "g", text: "Communication and media challenges" },
      ],
    },
    {
      id: 6,
      question: "Which activity do you find most rewarding?",
      options: [
        { value: "a", text: "Building software or apps" },
        { value: "b", text: "Managing budgets or investments" },
        { value: "c", text: "Coaching or training others" },
        { value: "d", text: "Creating visual or performing arts" },
        { value: "e", text: "Conducting experiments or studies" },
        { value: "f", text: "Supporting community welfare" },
        { value: "g", text: "Producing media content" },
      ],
    },
    {
      id: 7,
      question: "What role do you naturally take in a team?",
      options: [
        { value: "a", text: "The tech problem-solver" },
        { value: "b", text: "The strategic leader" },
        { value: "c", text: "The motivator or team energizer" },
        { value: "d", text: "The creative idea generator" },
        { value: "e", text: "The data-driven analyst" },
        { value: "f", text: "The empathetic supporter" },
        { value: "g", text: "The communicator or storyteller" },
      ],
    },
    {
      id: 8,
      question: "What type of project excites you the most?",
      options: [
        { value: "a", text: "Developing new technology" },
        { value: "b", text: "Launching a business venture" },
        { value: "c", text: "Organizing a sports event" },
        { value: "d", text: "Designing a creative campaign" },
        { value: "e", text: "Conducting scientific research" },
        { value: "f", text: "Improving community services" },
        { value: "g", text: "Producing a film or show" },
      ],
    },
    {
      id: 9,
      question: "What skill do you most want to develop?",
      options: [
        { value: "a", text: "Coding or software development" },
        { value: "b", text: "Financial analysis or management" },
        { value: "c", text: "Physical training or coaching" },
        { value: "d", text: "Artistic or design skills" },
        { value: "e", text: "Research or data analysis" },
        { value: "f", text: "Counseling or social work" },
        { value: "g", text: "Media production or journalism" },
      ],
    },
    {
      id: 10,
      question: "What impact do you want your career to have?",
      options: [
        { value: "a", text: "Advancing technology" },
        { value: "b", text: "Growing economic opportunities" },
        { value: "c", text: "Promoting health and fitness" },
        { value: "d", text: "Enriching cultural experiences" },
        { value: "e", text: "Expanding scientific knowledge" },
        { value: "f", text: "Improving social welfare" },
        { value: "g", text: "Inspiring through media" },
      ],
    },
  ];

  // Handle answer selection
  const handleAnswerSelect = (value) => {
    setAnswers({
      ...answers,
      [currentQuestion]: value
    });
  };

  // Navigate to next question
 const handleNextOrSubmit = () => {
  if (currentQuestion < questions.length - 1) {
    setCurrentQuestion(currentQuestion + 1);
  } else {
    handleSubmit();
  }
};


  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Submit quiz
 // Submit quiz
const handleSubmit = async () => {
  try {
    // Map over questions to build correct payload
    const formattedAnswers = questions.map((question, index) => {
      const selectedValue = answers[index]; // the value the user selected, e.g., 'a', 'b', etc.

      if (!selectedValue) {
        // If user didn't select, you can either skip or send null
        return { questionText: question.question, selectedOption: null };
      }

      return {
        questionText: question.question,        // backend requires this field
        selectedOption: selectedValue           // backend requires the option value, NOT text
      };
    });

    const payload = {
      userId: "68cc5ccde13f08ffeeeadcc8", // replace with actual logged-in user id
      starterAnswers: formattedAnswers      // array of objects with questionText and selectedOption
    };

    console.log("Submitting payload:", payload); // check payload before sending

    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/userinterest/submit`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("Server response:", response.data);
    setShowResults(true); // show results on successful submit
  } catch (err) {
    console.error("Error submitting quiz:", err.response?.data || err.message);
    setError("Failed to submit quiz");
  }
};


  // Calculate progress
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Career Quiz...</p>
        </div>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-red-400 text-xl font-bold text-center mb-2">Error Loading Quiz</h2>
          <p className="text-red-400 text-center mb-4">{error}</p>
          <button 
            onClick={fetchQuestions}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 max-w-md w-full border border-gray-600">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white text-center mb-4">Quiz Completed!</h2>
          <p className="text-gray-300 text-center mb-6">
            Thank you for completing the career assessment. Your results are being processed.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            Take Quiz Again
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Enhanced Background Animation */}
      <div className="absolute inset-0 z-0">
        {/* Main gradient background with animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-800 to-gray-900 opacity-90 gradientShift"></div>
        
        {/* Secondary animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tl from-cyan-500/10 via-blue-600/20 to-purple-700/30 animate-pulse"></div>
        
        {/* Floating geometric shapes */}
        {[...Array(12)].map((_, i) => {
          const size = Math.random() * 30 + 20;
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const duration = Math.random() * 20 + 15;
          const delay = Math.random() * 10;
          return (
            <div
              key={`shape-${i}`}
              className="absolute opacity-20 floatingShape"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                top: `${top}%`,
                animation: `floatComplex ${duration}s ease-in-out infinite ${delay}s`,
                background: i % 4 === 0 
                  ? 'linear-gradient(45deg, #3B82F6, #8B5CF6)' 
                  : i % 4 === 1 
                  ? 'linear-gradient(135deg, #06B6D4, #3B82F6)'
                  : i % 4 === 2
                  ? 'linear-gradient(225deg, #8B5CF6, #EC4899)'
                  : 'linear-gradient(315deg, #10B981, #06B6D4)',
                borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '20%' : '0%',
                clipPath: i % 4 === 3 ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
              }}
            />
          );
        })}
        
        {/* Small animated particles */}
        {[...Array(40)].map((_, i) => {
          const size = Math.random() * 8 + 3;
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const animationDelay = Math.random() * 5;
          const duration = Math.random() * 8 + 4;
          return (
            <div
              key={`particle-${i}`}
              className={`absolute rounded-full sparkle ${
                i % 5 === 0 ? 'bg-cyan-400' :
                i % 5 === 1 ? 'bg-blue-400' :
                i % 5 === 2 ? 'bg-purple-400' : 
                i % 5 === 3 ? 'bg-pink-400' : 'bg-green-400'
              }`}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                top: `${top}%`,
                animation: `sparkle ${duration}s ease-in-out infinite ${animationDelay}s`,
                filter: 'blur(0.5px)',
              }}
            />
          );
        })}
        
        {/* Animated wave effects */}
        {[...Array(3)].map((_, i) => (
          <div
            key={`wave-${i}`}
            className="absolute inset-0 opacity-10 waveAnimation"
            style={{
              background: `radial-gradient(ellipse at ${30 + i * 20}% ${20 + i * 30}%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)`,
              animation: `wave ${8 + i * 2}s ease-in-out infinite ${i * 2}s`,
            }}
          />
        ))}
        
        {/* Moving light streaks */}
        {[...Array(5)].map((_, i) => (
          <div
            key={`streak-${i}`}
            className="absolute lightStreak"
            style={{
              width: '2px',
              height: '100px',
              background: 'linear-gradient(to bottom, transparent, rgba(139, 92, 246, 0.6), transparent)',
              left: `${Math.random() * 100}%`,
              top: '-100px',
              animation: `streak ${3 + Math.random() * 4}s linear infinite ${Math.random() * 5}s`,
            }}
          />
        ))}
        
        {/* Pulsing orbs */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`orb-${i}`}
            className="absolute pulsingOrb"
            style={{
              width: `${40 + Math.random() * 60}px`,
              height: `${40 + Math.random() * 60}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${
                i % 3 === 0 ? 'rgba(59, 130, 246, 0.3)' :
                i % 3 === 1 ? 'rgba(139, 92, 246, 0.3)' : 'rgba(6, 182, 212, 0.3)'
              }, transparent 70%)`,
              borderRadius: '50%',
              animation: `pulse ${2 + Math.random() * 3}s ease-in-out infinite ${Math.random() * 2}s`,
            }}
          />
        ))}
        
        {/* Rotating rings */}
        {[...Array(4)].map((_, i) => (
          <div
            key={`ring-${i}`}
            className="absolute rotatingRing"
            style={{
              width: `${80 + i * 40}px`,
              height: `${80 + i * 40}px`,
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: '50%',
              animation: `rotate ${10 + i * 5}s linear infinite`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Career Assessment</h1>
            <div className="text-sm text-gray-300">
              Question {currentQuestion + 1} of {questions.length}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-8">
            <div 
              className="progress-bar h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Section */}
      <div className="relative z-10 flex-grow flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-gray-600 quiz-card">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              {currentQ?.question}
            </h2>

            <div className="space-y-4 mb-8">
              {currentQ?.options?.map((option, index) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswerSelect(option.value)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-300 quiz-option ${
                    answers[currentQuestion] === option.value
                      ? 'border-indigo-500 bg-indigo-500/20 text-white quiz-option-selected'
                      : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-indigo-400 hover:bg-indigo-500/10'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 transition-all duration-200 ${
                      answers[currentQuestion] === option.value
                        ? 'border-indigo-400 bg-indigo-400 scale-110'
                        : 'border-gray-400'
                    }`}></div>
                    <span className="font-medium">{option.text}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors nav-button ${
                  currentQuestion === 0
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="text-sm text-gray-400">
                {answeredCount} of {questions.length} answered
              </div>

              <button
               onClick={handleNextOrSubmit}
               disabled={currentQuestion < questions.length - 1 && !answers[currentQuestion]}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors nav-button ${
                  !answers[currentQuestion]
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : currentQuestion === questions.length - 1
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {currentQuestion === questions.length - 1 ? 'Submit Quiz' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center p-6">
        <p className="text-gray-400 text-sm">
          Take your time and answer honestly for the best career recommendations.
        </p>
      </div>

      {/* Custom CSS for advanced animations */}
      <style>{`
        .gradientShift {
          background-size: 400% 400%;
          animation: gradientShift 15s ease-in-out infinite;
        }
        
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
            transform: scale(1);
          }
          25% {
            background-position: 100% 50%;
            transform: scale(1.02);
          }
          50% {
            background-position: 100% 100%;
            transform: scale(1);
          }
          75% {
            background-position: 0% 100%;
            transform: scale(1.01);
          }
          100% {
            background-position: 0% 50%;
            transform: scale(1);
          }
        }

        @keyframes floatComplex {
          0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(0deg) scale(1);
            opacity: 0.2;
          }
          25% {
            transform: translateY(-30px) translateX(20px) rotate(90deg) scale(1.2);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-60px) translateX(-10px) rotate(180deg) scale(0.8);
            opacity: 0.6;
          }
          75% {
            transform: translateY(-30px) translateX(-30px) rotate(270deg) scale(1.1);
            opacity: 0.3;
          }
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.5) rotate(0deg);
            filter: blur(0px) brightness(1);
          }
          25% {
            opacity: 0.8;
            transform: scale(1.5) rotate(90deg);
            filter: blur(1px) brightness(1.5);
          }
          50% {
            opacity: 1;
            transform: scale(0.3) rotate(180deg);
            filter: blur(0.5px) brightness(2);
          }
          75% {
            opacity: 0.6;
            transform: scale(1.2) rotate(270deg);
            filter: blur(0.8px) brightness(1.2);
          }
        }

        @keyframes wave {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.1;
          }
          50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 0.3;
          }
        }

        @keyframes streak {
          0% {
            top: -100px;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 100vh;
            opacity: 0;
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.6;
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Enhanced quiz option animations */
        .quiz-option {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .quiz-option::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.2), transparent);
          transition: left 0.6s;
        }

        .quiz-option:hover::before {
          left: 100%;
        }

        .quiz-option:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 12px 30px -8px rgba(139, 92, 246, 0.4);
          border-color: rgba(139, 92, 246, 0.8);
        }

        .quiz-option-selected {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.5);
          animation: selectedPulse 2s ease-in-out infinite;
        }

        @keyframes selectedPulse {
          0%, 100% {
            box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 15px 35px -5px rgba(59, 130, 246, 0.7);
          }
        }

        /* Progress bar animation */
        .progress-bar {
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          background: linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899);
          background-size: 200% 100%;
          animation: progressShine 3s ease-in-out infinite;
        }

        @keyframes progressShine {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        /* Navigation button animations */
        .nav-button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .nav-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px -4px rgba(139, 92, 246, 0.3);
        }

        .nav-button:active {
          transform: translateY(0);
        }

        /* Card entrance animation */
        .quiz-card {
          animation: cardEntrance 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes cardEntrance {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}