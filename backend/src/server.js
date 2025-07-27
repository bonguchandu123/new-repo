import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import snippetRouter from "./routes/snippetRoutes.js";
import router from "./routes/authRoutes.js";
import Runrouter from "./routes/run.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/analyze",snippetRouter);
app.use("/api/auth",router);
app.use("/api/run",  Runrouter);

app.get("/", (req, res) => {
  res.send("API is running...");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));