import express from "express";
import { analyzeCode, deleteSnippet, getAllSnippets } from "../controllers/snippetController.js";
import { protect } from "../middleware/authMiddleware.js";

const snippetRouter = express.Router();

snippetRouter.post("/", protect, analyzeCode);
snippetRouter.get("/snippets", protect, getAllSnippets);
snippetRouter.delete("/:id", protect, deleteSnippet);

export default snippetRouter;
