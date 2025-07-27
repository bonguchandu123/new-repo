import axios from "axios";
import Snippet from "../models/Snippet.js";

export const analyzeCode = async (req, res) => {
  const { code, intent, provider = "openrouter" } = req.body;

  if (!code || !intent) {
    return res.status(400).json({ error: "Code and intent are required." });
  }

  const prompt = `As a senior developer, please ${intent} the following code and explain the result clearly:\n\n${code}`;
  let aiReply = "";

  try {
    if (provider === "huggingface") {
      // Hugging Face inference
      const hfResponse = await axios.post(
        "https://api-inference.huggingface.co/models/bigcode/starcoder2-15b",
        { inputs: prompt },
        {
          headers: {
            Authorization: `Bearer ${process.env.HF_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      aiReply =
        hfResponse.data.generated_text ||
        hfResponse.data[0]?.generated_text ||
        "No response from HuggingFace.";
    } else {
      // OpenRouter inference
      const orResponse = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "mistralai/mistral-7b-instruct", // ✅ Valid model
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      aiReply =
        orResponse?.data?.choices?.[0]?.message?.content ||
        "No response from OpenRouter.";
    }

    const saved = await Snippet.create({
      user: req.user._id,
      code,
      intent,
      provider,
      result: aiReply,
    });

    res.json({ result: aiReply, snippetId: saved._id });
  } catch (error) {
    console.error("❌ AI Error:", error.response?.data || error.message);

    res.status(500).json({
      error:
        error.response?.data?.error ||
        error.response?.data?.message ||
        "AI processing failed. Please try again.",
    });
  }
};

export const getAllSnippets = async (req, res) => {
  try {
    const snippets = await Snippet.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(snippets);
  } catch (err) {
    console.error("❌ Fetching snippets failed:", err.message);
    res.status(500).json({ error: "Failed to fetch snippets." });
  }
};


// Delete a snippet by ID
export const deleteSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ message: "Snippet not found" });
    }

    // Make sure the user is authorized
    if (snippet.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized to delete this snippet" });
    }

    await snippet.deleteOne();
    res.json({ message: "Snippet deleted successfully" });
  } catch (err) {
    console.error("❌ Deletion failed:", err.message);
    res.status(500).json({ message: "Failed to delete snippet" });
  }
};
