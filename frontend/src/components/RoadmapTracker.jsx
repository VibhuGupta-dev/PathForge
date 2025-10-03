import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Loader, Book, Clock, Award, ExternalLink } from "lucide-react";
import FloatingButton from "./FloatingButton";

const RoadmapTracker = ({ user }) => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

  const VITE_AI_BACKEND_URL = import.meta.env.VITE_AI_BACKEND_URL || "http://localhost:5002";
  const token = localStorage.getItem('token');  // Get token for auth

  useEffect(() => {
    console.log("RoadmapTracker: User ID:", user?.id, "Token:", token ? token.slice(0, 20) + "..." : "Missing");
    if (user?.id && token) {
      fetchRoadmap();
    } else if (!token) {
      setError("Authentication required. Please log in.");
      setLoading(false);
    } else if (!user?.id) {
      setError("User ID not found. Please log in again.");
      setLoading(false);
    }
  }, [user, token]);

  const fetchRoadmap = async () => {
    if (!token) {
      setError("Authentication required. Please log in.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching roadmap for user ${user.id} from ${VITE_AI_BACKEND_URL}/api/progress/api/roadmap/${user.id}`);
      const response = await axios.get(
        `${VITE_AI_BACKEND_URL}/api/progress/api/roadmap/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000,
        }
      );
      
      console.log("Roadmap fetch response:", response.data);
      
      if (response.data.success) {
        setRoadmap(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch roadmap");
      }
    } catch (error) {
      console.error("Error fetching roadmap:", error);
      if (error.response?.status === 404) {
        setError(null); // No roadmap exists yet, this is normal
        setRoadmap(null);
      } else if (error.code === "ECONNREFUSED") {
        setError("AI service is unavailable. Please contact support.");
      } else {
        setError(
          error.response?.data?.message ||
          "Failed to fetch roadmap. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const generateRoadmap = async () => {
    if (!token) {
      setError("Authentication required. Please log in.");
      return;
    }
    setGeneratingRoadmap(true);
    setError(null);
    try {
      console.log(`Generating roadmap for user: ${user.id} at ${VITE_AI_BACKEND_URL}/api/progress/api/roadmap/generate`);
      console.log("Request body:", { user_id: user.id });
      console.log("Request headers:", { Authorization: `Bearer ${token.slice(0, 20)}...` });
      
      const response = await axios.post(
        `${VITE_AI_BACKEND_URL}/api/progress/api/roadmap/generate`,
        { user_id: user.id },
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          timeout: 120000,
        }
      );
      
      console.log("Roadmap generation response:", response.data);
      
      if (response.data.success) {
        setRoadmap(response.data.data);
        setError(null);
      } else {
        if (response.data.redirect === "/assessment") {
          setError("Please complete the career assessment first before generating a roadmap.");
        } else {
          setError(response.data.message || "Failed to generate roadmap");
        }
      }
    } catch (error) {
      console.error("Error generating roadmap:", error);
      console.log("Error response:", error.response?.data);
      
      if (error.code === "ECONNREFUSED") {
        setError("AI service is unavailable. Please contact support.");
      } else if (error.response?.status === 404) {
        setError("Please complete the career assessment first.");
      } else {
        setError(
          error.response?.data?.message ||
          "Failed to generate roadmap. Please try again."
        );
      }
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  const toggleStepComplete = async (stepId, currentStatus) => {
    if (!token) {
      setError("Authentication required. Please log in.");
      return;
    }
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Updating progress for step ${stepId}, user ${user.id}`);
      const response = await axios.post(
        `${VITE_AI_BACKEND_URL}/api/progress/update`,
        {
          user_id: user.id,
          step_id: stepId,
          completed: !currentStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          timeout: 10000,
        }
      );
      
      console.log("Progress update response:", response.data);
      
      if (response.data.success) {
        setRoadmap((prev) => ({
          ...prev,
          steps: prev.steps.map((step) =>
            step.step_id === stepId
              ? { ...step, completed: !currentStatus }
              : step
          ),
        }));
      } else {
        setError(response.data.message || "Failed to update progress");
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      setError(
        error.response?.data?.message ||
        "Failed to update progress. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!roadmap?.steps) return 0;
    const completed = roadmap.steps.filter((s) => s.completed).length;
    return Math.round((completed / roadmap.steps.length) * 100);
  };

  return (
    <motion.div
      className="max-w-5xl mx-auto space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            Your Career Roadmap
          </h3>
          {roadmap && (
            <div className="text-right">
              <div className="text-3xl font-bold text-teal-600">
                {calculateProgress()}%
              </div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          )}
        </div>

        {roadmap && (
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-teal-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${calculateProgress()}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        )}
      </div>

      {/* Loading State */}
      {(loading || generatingRoadmap) && (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <Loader className="w-12 h-12 text-teal-500 animate-spin" />
          <span className="text-lg text-gray-600">
            {generatingRoadmap ? "Generating your personalized roadmap..." : "Loading..."}
          </span>
        </div>
      )}

      {/* Error State */}
      <AnimatePresence>
        {error && !loading && (
          <motion.div
            className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AlertCircle size={24} className="flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Roadmap State */}
      {!loading && !error && !roadmap && !generatingRoadmap && (
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Book className="w-10 h-10 text-white" />
            </div>
            <h4 className="text-xl font-bold mb-3 text-gray-800">
              Ready to Start Your Journey?
            </h4>
            <p className="text-gray-600 mb-6">
              Generate a personalized career roadmap based on your assessment and career goals.
            </p>
            <FloatingButton
              onClick={generateRoadmap}
              disabled={generatingRoadmap || !token}
              className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 px-8 py-3 text-lg"
            >
              {generatingRoadmap ? "Generating..." : "Generate My Roadmap"}
            </FloatingButton>
          </div>
        </motion.div>
      )}

      {/* Roadmap Steps */}
      {!loading && roadmap && (
        <div className="space-y-4">
          {roadmap.steps.map((step, index) => (
            <motion.div
              key={step.step_id}
              className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border transition-all duration-300 overflow-hidden ${
                step.completed
                  ? "border-teal-300 bg-teal-50/50"
                  : "border-white/20 hover:border-teal-200"
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Step Number */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      step.completed
                        ? "bg-teal-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step.completed ? "✓" : index + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h4 className="text-lg font-bold text-gray-800 mb-1">
                          {step.name}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Award size={14} />
                            NSQF Level {step.nsqf_level}
                          </span>
                          {step.duration && (
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {step.duration}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <FloatingButton
                        onClick={() => toggleStepComplete(step.step_id, step.completed)}
                        disabled={loading || !token}
                        className={`flex-shrink-0 ${
                          step.completed
                            ? "bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600"
                            : "bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
                        }`}
                      >
                        <CheckCircle size={20} />
                      </FloatingButton>
                    </div>

                    <p className="text-gray-700 mb-4">{step.description}</p>

                    {/* Skills */}
                    {step.skills && step.skills.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-600 mb-2">
                          Skills You'll Gain:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {step.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resources */}
                    {step.resources && step.resources.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-2">
                          Recommended Resources:
                        </p>
                        <ul className="space-y-1">
                          {step.resources.map((resource, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700"
                            >
                              <ExternalLink size={14} />
                              {resource}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Regenerate Button */}
          <div className="text-center pt-6">
            <FloatingButton
              onClick={generateRoadmap}
              disabled={generatingRoadmap || !token}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {generatingRoadmap ? "Regenerating..." : "🔄 Regenerate Roadmap"}
            </FloatingButton>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default RoadmapTracker;