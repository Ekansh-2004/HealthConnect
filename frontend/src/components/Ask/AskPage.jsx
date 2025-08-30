import { PlusCircle, Reply, Search, ShieldAlert, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuestionStore } from "../../store/useQuestionStore.jsx";
import { useUserStore } from "../../store/useUserStore.jsx";

// --- New Validation Function using Gemini API ---
const validateQuestionWithLLM = async (question) => {
	// IMPORTANT: Replace with your actual Gemini API key in production (from backend, not client!)
	const apiKey = "AIzaSyBkAvcrmXcBocHuF3-ShkHKnq4uexJyQBQ";
	const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

	const prompt = `
		Analyze the following user question. Determine if it meets ALL of the following criteria:
		1. It is related to health.
		2. It is ethically sound and appropriate.
		3. It is not violent, hateful, or rude.

		If the question meets ALL criteria, respond with only the word "YES".
		If the question fails ANY of the criteria, respond with only the word "NO".

		User Question: "${question}"
	`;

	const payload = {
		contents: [{ parts: [{ text: prompt }] }],
	};

	try {
		const response = await fetch(apiUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			console.error("API Error:", response.status, response.statusText);
			return false;
		}

		const result = await response.json();
		const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim()?.toUpperCase();

		return textResponse === "YES";
	} catch (error) {
		console.error("Failed to fetch from Gemini API:", error);
		return false;
	}
};

const AskPage = () => {
	const { user } = useUserStore();
	const role = user?.userType;

	const { questions, fetchQuestions, addQuestion, answerQuestion, deleteQuestion, loading, error } = useQuestionStore();

	const [newQuestion, setNewQuestion] = useState("");
	const [validationError, setValidationError] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);
	const [replyingId, setReplyingId] = useState(null);
	const [replyText, setReplyText] = useState("");
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		fetchQuestions();
	}, [fetchQuestions]);

	const handleAddQuestion = async () => {
		if (!newQuestion.trim()) {
			setValidationError("Question cannot be empty.");
			return;
		}

		setValidationError("");
		setIsVerifying(true);

		try {
			const isValid = await validateQuestionWithLLM(newQuestion);

			if (isValid) {
				addQuestion(newQuestion);
				setNewQuestion("");
			} else {
				setValidationError("This question is not appropriate or not health-related. Please try again.");
			}
		} catch (e) {
			setValidationError("Could not verify the question. Please try again later.");
		} finally {
			setIsVerifying(false);
		}
	};

	const handleReplySave = (id) => {
		if (!replyText.trim()) return;
		answerQuestion(id, replyText);
		setReplyingId(null);
		setReplyText("");
	};

	const handleQuestionChange = (e) => {
		setNewQuestion(e.target.value);
		if (validationError) {
			setValidationError("");
		}
	};

	const filteredQuestions = questions.filter((q) => q.question.toLowerCase().includes(searchTerm.toLowerCase()));

	return (
		<div className="max-w-4xl mx-auto p-6">
			<h1 className="text-2xl font-bold text-blue-600 mb-2">Ask & Answer</h1>

			{/* Search box */}
			<div className="relative mb-6">
				<input
					type="text"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					placeholder="Search questions..."
					className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
				/>
				<Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
			</div>

			{/* Ask Question */}
			{(role === "adult" || role === "adolescent") && (
				<div className="mb-6">
					<textarea
						value={newQuestion}
						onChange={handleQuestionChange}
						placeholder="Type your health-related question..."
						className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
						rows={3}
					/>

					{validationError && (
						<div
							className="flex items-center p-3 mb-2 text-sm text-red-700 bg-red-100 rounded-lg"
							role="alert"
						>
							<ShieldAlert className="h-5 w-5 mr-2" />
							<span className="font-medium">{validationError}</span>
						</div>
					)}

					<button
						onClick={handleAddQuestion}
						disabled={isVerifying}
						className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
					>
						{isVerifying ? (
							<>Verifying...</>
						) : (
							<>
								<PlusCircle className="h-4 w-4 mr-2" />
								Add Question
							</>
						)}
					</button>
				</div>
			)}

			{/* Questions List */}
			{loading && <p className="text-gray-500">Loading questions...</p>}
			{error && <p className="text-red-500">{error}</p>}

			<div className="space-y-4">
				{filteredQuestions.length === 0 && !loading && <p className="text-gray-400 italic">No matching questions found.</p>}

				{filteredQuestions.map((q) => (
					<div
						key={q._id}
						className="p-4 border rounded-lg shadow-sm bg-white"
					>
						<div className="flex justify-between items-start">
							<p className="font-medium text-blue-700">{q.question}</p>
							{role === "admin" && (
								<button
									onClick={() => deleteQuestion(q._id)}
									className="text-red-500 hover:text-red-700"
								>
									<Trash2 className="h-5 w-5" />
								</button>
							)}
						</div>

						{q.answer ? <p className="mt-2 text-gray-700">{q.answer}</p> : <p className="mt-2 text-gray-400 italic">No answer yet.</p>}

						{/* Reply box for health professionals */}
						{role === "health_prof" && !q.answer && (
							<>
								{replyingId === q._id ? (
									<div className="mt-3">
										<textarea
											value={replyText}
											onChange={(e) => setReplyText(e.target.value)}
											placeholder="Type your reply..."
											className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
											rows={2}
										/>
										<button
											onClick={() => handleReplySave(q._id)}
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
										onClick={() => setReplyingId(q._id)}
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
