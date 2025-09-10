import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongoConnect.js"; // <-- import your db connection
import authRoutes from "./routes/Authroutes.js";

dotenv.config();

// Connect MongoDB before starting server
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser()); // needed for JWT cookies
app.use(cors({
  origin: "http://localhost:5173", // your React app URL (adjust if different)
  credentials: true,              // allow cookies to be sent
}));

// Routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "✅ Server is working" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
