import React, { useState } from "react";
import { PlusCircle, Reply } from "lucide-react";

const AskPage = () => {
  const role = "expert";

  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: "What are the symptoms of STIs?",
      answer:
        "Common symptoms include itching, discharge, and pain while urinating.",
    },
    {
      id: 2,
      question: "How do I know if my periods are regular?",
      answer: "",
    },
  ]);

  const [newQuestion, setNewQuestion] = useState("");
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState("");

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    const q = {
      id: Date.now(),
      question: newQuestion,
      answer: "",
    };
    setQuestions([...questions, q]);
    setNewQuestion("");
  };

  const handleReplySave = (id) => {
    if (!replyText.trim()) return;
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, answer: replyText } : q))
    );
    setReplyingId(null);
    setReplyText("");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-blue-600 mb-2">Ask & Answer</h1>

      {/* Show current role for testing */}
      <p className="text-gray-500 mb-6">
        <strong>Current role:</strong> {role || "Not logged in"}
      </p>

      {(role === "adult" || role === "adolescent") && (
        <div className="mb-6">
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Type your question..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
            rows={3}
          />
          <button
            onClick={handleAddQuestion}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Question
          </button>
        </div>
      )}

      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.id} className="p-4 border rounded-lg shadow-sm bg-white">
            <p className="font-medium text-blue-700">{q.question}</p>
            {q.answer ? (
              <p className="mt-2 text-gray-700">{q.answer}</p>
            ) : (
              <p className="mt-2 text-gray-400 italic">No answer yet.</p>
            )}

            {role === "expert" && !q.answer && (
              <>
                {replyingId === q.id ? (
                  <div className="mt-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
                      rows={2}
                    />
                    <button
                      onClick={() => handleReplySave(q.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => {
                        setReplyingId(null);
                        setReplyText("");
                      }}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyingId(q.id)}
                    className="mt-3 flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AskPage;
