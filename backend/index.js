
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongoConnect.js";
import authRoutes from "./routes/Authroutes.js";
import userinterestRoutes from "./routes/carrierAssesmentroutes.js";
import communityRoute from "./routes/communityRoute.js";
import progressTrackerRoutes from "./routes/progressTrackerRoutes.js"; // New
import aiChatRoutes from "./routes/chatRoutes.js";
import days from "./routes/30days.js"
dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // only one allowed
    credentials: true,
    optionsSuccessStatus: 200,
  })
);


app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/userinterest", userinterestRoutes);
app.use("/api/community", communityRoute);
app.use("/api/progress", progressTrackerRoutes); // New
app.use("/api", aiChatRoutes); // New AI chat routes
app.use('/api/motivational-program', days);


app.get("/", (req, res) => {
  res.json({
    message: "✅ Auth Server is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error("Global error handler:", err.stack);
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: "Validation Error", errors });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ success: false, message: `${field} already exists` });
  }
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Token expired" });
  }
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Something went wrong!" : err.message,
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated");
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📧 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 CORS enabled for frontend`);
});
