import express from "express";
import axios from "axios";
import { protect } from "../middleware/authMiddleware.js";

const  Runrouter= express.Router();

Runrouter.post("/", protect, async (req, res) => {
  const { language, version, code } = req.body;

  try {
    const result = await axios.post("https://emkc.org/api/v2/piston/execute", {
      language,
      version,
      files: [{ name: "main", content: code }],
    });

    res.json({
      output: result.data.run.output,
      stderr: result.data.run.stderr,
    });
  } catch (err) {
    res.status(500).json({ error: "Execution failed", details: err.message });
  }
});

export default Runrouter;
