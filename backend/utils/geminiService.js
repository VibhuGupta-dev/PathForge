import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

class GeminiService {
  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-pro",
      apiKey: process.env.GEMINI_API_KEY,
      temperature: 0.7,
    });
  }

  async generateAdaptiveQuestions(previousAnswers, totalQuestions = 0) {
    const prompt = `
      You are a career assessment AI. Based on the user's previous answers, generate the next 3 career-related multiple-choice questions.
      
      Previous answers: ${JSON.stringify(previousAnswers)}
      Total questions asked so far: ${totalQuestions}
      
      Generate questions that dig deeper into their career preferences.
      Each question should have 4 options (a, b, c, d).
      
      Return ONLY valid JSON format:
      [
        {
          "question": "Your question text here",
          "options": [
            {"value": "a", "text": "Option A", "clusterTag": "Technology_IT"},
            {"value": "b", "text": "Option B", "clusterTag": "Business_Finance"},
            {"value": "c", "text": "Option C", "clusterTag": "Creative_Arts"},
            {"value": "d", "text": "Option D", "clusterTag": "Science_Research"}
          ],
          "difficulty": "medium",
          "focus": "work_environment"
        }
      ]
      
      Use these cluster tags: ${CAREER_CLUSTERS.join(", ")}
    `;

    try {
      const result = await this.model.invoke([
        { role: "system", content: "You are an expert career counselor creating personalized assessment questions." },
        { role: "user", content: prompt },
      ]);
      const cleanText = result.content.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanText);
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to generate questions");
    }
  }

  async generateCareerSuggestions(userAnswers, clusterScores) {
    const prompt = `
      Based on the user's career assessment answers and cluster scores, suggest the top 3 most suitable careers.
      
      User Answers: ${JSON.stringify(userAnswers)}
      Cluster Scores: ${JSON.stringify(clusterScores)}
      
      Return ONLY a JSON array of career suggestions:
      ["Career 1", "Career 2", "Career 3"]
    `;

    try {
      const result = await this.model.invoke([
        { role: "system", content: "You are a professional career counselor providing personalized career recommendations." },
        { role: "user", content: prompt },
      ]);
      const cleanText = result.content.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanText);
    } catch (error) {
      console.error("Career suggestion error:", error);
      throw new Error("Failed to generate career suggestions");
    }
  }
}

export default new GeminiService();