import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/Authroutes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(cors());

app.use("/api/auth", router);

app.get("/", (req, res) => {
  res.json({ message: "✅ Server is working" });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
