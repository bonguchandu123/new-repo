import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { motion } from "framer-motion";
import API from "../api";

const intents = ["explain", "debug", "optimize", "review"];

export default function CodeAnalyzer() {
  const [code, setCode] = useState("// write your code here...");
  const [intent, setIntent] = useState("explain");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [speak, setSpeak] = useState(false);
  const [snippets, setSnippets] = useState([]);
  const [lastSavedId, setLastSavedId] = useState(null);
  const speechRef = useRef(null);

  const fetchSnippets = async () => {
    try {
      const res = await API.get("/analyze/snippets");
      setSnippets(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching snippets", err);
    }
  };

  useEffect(() => {
    fetchSnippets();
  }, []);

  const stopSpeech = () => {
    speechSynthesis.cancel();
    speechRef.current = null;
  };

  const handleAnalyze = async () => {
    stopSpeech();
    setLoading(true);
    setResult("");
    try {
      const res = await API.post("/analyze", {
        code,
        intent,
        provider: "openrouter",
      });

      setResult(res.data.result);
      setLastSavedId(res.data.snippetId);

      if (speak) {
        const utterance = new SpeechSynthesisUtterance(res.data.result);
        speechRef.current = utterance;
        speechSynthesis.speak(utterance);
      }

      fetchSnippets();
    } catch (err) {
      setResult("Error analyzing code.");
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text) => {
    stopSpeech();
    const utterance = new SpeechSynthesisUtterance(text);
    speechRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Menu */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <select
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-lg"
        >
          {intents.map((i) => (
            <option key={i} value={i}>
              {i.charAt(0).toUpperCase() + i.slice(1)}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={speak}
            onChange={() => setSpeak((prev) => !prev)}
          />
          <span className="text-sm">Voice Response</span>
        </label>

        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleAnalyze}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? "Analyzing..." : "Analyze Code"}
        </motion.button>
      </div>

      {/* Editor */}
      <Editor
        height="400px"
        theme="vs-dark"
        defaultLanguage="javascript"
        value={code}
        onChange={(value) => setCode(value)}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
        }}
      />

      {/* AI Result */}
      {result && (
        <div className="bg-white border rounded-lg shadow-sm p-4 space-y-4 mt-4">
          <h3 className="text-base font-semibold text-gray-800">🧠 AI Analysis</h3>

          <Editor
            height="200px"
            theme="vs-dark"
            language="javascript"
            value={code}
            options={{
              readOnly: true,
              fontSize: 14,
              minimap: { enabled: false },
            }}
          />

          <div className="text-sm whitespace-pre-wrap text-gray-700">
            <strong>Result:</strong>
            <p className="mt-2 leading-relaxed">{result}</p>
          </div>

          <button
            onClick={() => {
              setCode("// write your code here...");
              setResult("");
              window.location.href = "/snippets";
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            📥 Save & View Snippet
          </button>
        </div>
      )}

      {/* Snippet History */}
      {snippets.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">🧠 Your Past Snippets</h3>
          <div className="grid gap-6">
            {snippets
              .filter((s) => s._id !== lastSavedId) // skip just-saved one
              .map((s) => (
                <div
                  key={s._id}
                  className="bg-white border rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500 capitalize">
                      {s.intent} • {s.provider}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(s.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <Editor
                    height="200px"
                    theme="vs-dark"
                    language="javascript"
                    value={s.code}
                    options={{
                      readOnly: true,
                      fontSize: 13,
                      minimap: { enabled: false },
                    }}
                  />

                  <div className="mt-2 text-sm whitespace-pre-wrap text-gray-700">
                    <strong>Result:</strong>
                    <p className="mb-2">{s.result}</p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSpeak(s.result)}
                        className="bg-green-600 text-white px-3 py-1 rounded-md text-xs hover:bg-green-700"
                      >
                        ▶️ Play
                      </button>
                      <button
                        onClick={stopSpeech}
                        className="bg-red-600 text-white px-3 py-1 rounded-md text-xs hover:bg-red-700"
                      >
                        ⏹️ Stop
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
