import mongoose from "mongoose";

const snippetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    code: { type: String, required: true },
    intent: { type: String, enum: ["explain", "debug", "optimize"], required: true },
    provider: { type: String, default: "openrouter" },
    result: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Snippet", snippetSchema);