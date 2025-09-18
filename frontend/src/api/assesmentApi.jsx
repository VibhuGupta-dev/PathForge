// src/api/assesmentApi.jsx
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api/userinterest",
  withCredentials: true,
});

// Get starter questions
export const getStarterQuestions = () => API.get("/starter-questions");

// Start assessment
export const startAssessment = (starterAnswers) =>
  API.post("/start", { starterAnswers });

// Save adaptive answer
export const saveAdaptiveAnswer = (data) => API.post("/answer", data);

// Get career suggestions
export const getSuggestions = (assessmentId) => API.get(`/${assessmentId}/suggest`);

// Finalize career
export const finalizeCareer = (assessmentId, chosenCareer) =>
  API.post("/finalize", { assessmentId, chosenCareer });
