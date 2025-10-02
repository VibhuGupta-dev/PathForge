import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CareerQuiz() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    checkAssessmentStatus();
    fetchQuestions();
  }, []);

  const checkAssessmentStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/userinterest/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to check assessment status');

      if (data.hasCompletedAssessment) {
        navigate('/Dashboard');
      }
    } catch (err) {
      console.error('Error checking assessment status:', err.message);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      setQuestions(getSampleQuestions());
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions.');
      setQuestions(getSampleQuestions());
    } finally {
      setLoading(false);
    }
  };

  const getSampleQuestions = () => [
    {
      id: 1,
      question: "What is your current educational qualification?",
      options: [
        { value: "a", text: "8th grade or below" },
        { value: "b", text: "10th grade (Secondary)" },
        { value: "c", text: "12th grade (Senior Secondary)" },
        { value: "d", text: "Diploma/ITI" },
        { value: "e", text: "Graduate (Bachelor's degree)" },
        { value: "f", text: "Postgraduate or higher" },
      ],
    },
    {
      id: 2,
      question: "Do you have any prior vocational training or work experience?",
      options: [
        { value: "a", text: "No experience at all" },
        { value: "b", text: "Informal training (family trade, apprenticeship)" },
        { value: "c", text: "Completed ITI/Diploma course" },
        { value: "d", text: "1-2 years work experience" },
        { value: "e", text: "3-5 years work experience" },
        { value: "f", text: "More than 5 years experience" },
      ],
    },
    {
      id: 3,
      question: "Which industry sector interests you the most?",
      options: [
        { value: "a", text: "Information Technology (IT/Software)" },
        { value: "b", text: "Manufacturing & Engineering" },
        { value: "c", text: "Healthcare & Life Sciences" },
        { value: "d", text: "Retail & E-commerce" },
        { value: "e", text: "Agriculture & Allied" },
        { value: "f", text: "Construction & Infrastructure" },
        { value: "g", text: "Tourism & Hospitality" },
        { value: "h", text: "Financial Services & Banking" },
      ],
    },
    {
      id: 4,
      question: "What is your preferred mode of learning?",
      options: [
        { value: "a", text: "Classroom-based traditional training" },
        { value: "b", text: "Online/digital learning (self-paced)" },
        { value: "c", text: "Blended (mix of online and offline)" },
        { value: "d", text: "On-the-job training with mentorship" },
        { value: "e", text: "Short-term workshops and boot camps" },
      ],
    },
    {
      id: 5,
      question: "How much time can you dedicate to skill training?",
      options: [
        { value: "a", text: "3-6 months full-time" },
        { value: "b", text: "6-12 months full-time" },
        { value: "c", text: "Part-time (weekends/evenings) for 6-12 months" },
        { value: "d", text: "Short-term (1-3 months) intensive" },
        { value: "e", text: "Long-term (1-2 years) with certification" },
      ],
    },
    {
      id: 6,
      question: "What is your primary career goal?",
      options: [
        { value: "a", text: "Get my first job quickly" },
        { value: "b", text: "Switch to a better-paying career" },
        { value: "c", text: "Start my own business/self-employment" },
        { value: "d", text: "Upgrade skills in current job" },
        { value: "e", text: "Prepare for future technologies/Industry 4.0" },
        { value: "f", text: "Gain internationally recognized certification" },
      ],
    },
    {
      id: 7,
      question: "Which NSQF skill level aligns with your current abilities?",
      options: [
        { value: "a", text: "Level 1-2: Basic/foundational skills" },
        { value: "b", text: "Level 3-4: Intermediate technical skills" },
        { value: "c", text: "Level 5-6: Advanced/specialized skills" },
        { value: "d", text: "Level 7-8: Supervisory/management skills" },
        { value: "e", text: "Not sure - need guidance" },
      ],
    },
    {
      id: 8,
      question: "What type of job role do you aspire for?",
      options: [
        { value: "a", text: "Technical/hands-on operational role" },
        { value: "b", text: "Supervisory/team leadership role" },
        { value: "c", text: "Project management/strategic role" },
        { value: "d", text: "Freelancing/consulting role" },
        { value: "e", text: "Entrepreneurship/business owner" },
      ],
    },
    {
      id: 9,
      question: "Are you comfortable with emerging technologies (AI, IoT, Automation)?",
      options: [
        { value: "a", text: "Not at all - prefer traditional skills" },
        { value: "b", text: "Basic awareness, willing to learn" },
        { value: "c", text: "Moderate understanding, need formal training" },
        { value: "d", text: "Good understanding, want advanced training" },
        { value: "e", text: "Expert level, looking for specialization" },
      ],
    },
    {
      id: 10,
      question: "What is your preferred work location/mobility?",
      options: [
        { value: "a", text: "Local area only (within 50km)" },
        { value: "b", text: "Within my state" },
        { value: "c", text: "Anywhere in India" },
        { value: "d", text: "International opportunities" },
        { value: "e", text: "Remote/work-from-home only" },
      ],
    },
  ];

  const handleAnswerSelect = (value) => {
    setAnswers({ ...answers, [currentQuestion]: value });
    setError('');
  };

  const handleNextOrSubmit = () => {
    if (!answers[currentQuestion]) {
      setError('Please select an answer before proceeding.');
      return;
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setError('');
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setError('');
    }
  };

  const handleSubmit = async () => {
    try {
      if (Object.keys(answers).length !== questions.length) {
        setError('Please answer all questions before submitting.');
        return;
      }

      const profileResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const profileData = await profileResponse.json();
      if (!profileResponse.ok) throw new Error(profileData.message || 'Failed to fetch user profile');

      const userId = profileData.user.id;

      const formattedAnswers = questions.map((question, index) => {
        const selectedValue = answers[index];
        const selectedOption = question.options.find((opt) => opt.value === selectedValue)?.text;
        if (!selectedOption) return null;
        return { questionText: question.question, selectedOption };
      });

      if (formattedAnswers.some((answer) => !answer)) {
        setError('Some answers are invalid. Please ensure all questions are answered.');
        return;
      }

      const payload = { userId, starterAnswers: formattedAnswers };

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/userinterest/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setShowResults(true);
      } else {
        throw new Error(data.message || 'Failed to submit assessment');
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit assessment: ' + err.message);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Career Assessment...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 max-w-md w-full border border-gray-600">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white text-center mb-4">Assessment Completed!</h2>
          <p className="text-gray-300 text-center mb-6">
            Your responses have been saved. We will now generate a personalized NSQF-aligned training roadmap for you.
          </p>
          <button 
            onClick={() => navigate('/Dashboard')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gray-900 relative overflow-hidden flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-800 to-gray-900 opacity-90"></div>
        <div className="relative z-10 max-w-3xl w-full">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-gray-600">
            <div className="flex items-center justify-center mb-6">
              <Info className="w-12 h-12 text-indigo-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 text-center">NCVET Career Assessment</h2>
            <p className="text-gray-300 mb-6 text-center">
              This assessment is designed to understand your educational background, skills, career aspirations, 
              and learning preferences to recommend personalized vocational training pathways.
            </p>
            <div className="bg-indigo-900/30 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-3">This assessment aligns with:</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>National Skills Qualifications Framework (NSQF)</li>
                <li>Current industry demands and future skill requirements</li>
                <li>Your socio-economic context and learning pace</li>
                <li>Stackable credentials and lifelong learning opportunities</li>
              </ul>
            </div>
            <p className="text-gray-400 text-sm italic text-center mb-6">
              Answer honestly for the most accurate personalized training recommendations. This assessment takes approximately 5-10 minutes.
            </p>
            <button
              onClick={() => setShowIntro(false)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              Start Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-800 to-gray-900 opacity-90"></div>

      <div className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">NCVET Career Assessment</h1>
            <div className="text-sm text-gray-300">
              Question {currentQuestion + 1} of {questions.length}
            </div>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2 mb-8">
            <div 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-grow flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-gray-600">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              {currentQ?.question}
            </h2>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-500 rounded-lg p-3 mb-6 text-red-400">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4 mb-8">
              {currentQ?.options?.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswerSelect(option.value)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-300 ${
                    answers[currentQuestion] === option.value
                      ? 'border-indigo-500 bg-indigo-500/20 text-white'
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

            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
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
                disabled={!answers[currentQuestion]}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  !answers[currentQuestion]
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : currentQuestion === questions.length - 1
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {currentQuestion === questions.length - 1 ? 'Submit Assessment' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 text-center p-6">
        <p className="text-gray-400 text-sm">
          Your responses help us create personalized NSQF-aligned training pathways.
        </p>
      </div>
    </div>
  );
}