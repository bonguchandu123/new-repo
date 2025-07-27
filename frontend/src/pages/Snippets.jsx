import { useEffect, useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import API from "../api";

export default function Snippets() {
  const [snippets, setSnippets] = useState([]);
  const speechRef = useRef(null);

  useEffect(() => {
    fetchSnippets();
  }, []);

  const fetchSnippets = async () => {
    try {
      const res = await API.get("/analyze/snippets");
      setSnippets(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching snippets", err);
    }
  };

  const handleSpeak = (text) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    speechRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    speechSynthesis.cancel();
    speechRef.current = null;
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/analyze/${id}`);
      setSnippets((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("❌ Failed to delete snippet:", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">📚 Your Saved Snippets</h1>

      {snippets.length === 0 ? (
        <p className="text-gray-500">No snippets found.</p>
      ) : (
        <div className="grid gap-6">
          {snippets.map((s) => (
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
                    onClick={handleStop}
                    className="bg-yellow-600 text-white px-3 py-1 rounded-md text-xs hover:bg-yellow-700"
                  >
                    ⏹️ Stop
                  </button>
                  <button
                    onClick={() => handleDelete(s._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded-md text-xs hover:bg-red-700"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
