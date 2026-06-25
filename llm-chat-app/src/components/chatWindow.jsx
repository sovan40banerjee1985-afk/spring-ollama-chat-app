import { useState, useEffect, useRef } from "react";
import { sendChatMessage } from "../api/chatApi";

export default function ChatWindow() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [conversationId, setConversationId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    async function handleSend() {
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
        setInput("");
        setLoading(true);
        setError(null);

        try {
            const data = await sendChatMessage(trimmed, conversationId);
            setConversationId(data.conversationId);
            setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        } catch (err) {
            setError("Something went wrong. Is the backend running?");
        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 flex items-center justify-center p-4">
            <div className="flex flex-col w-full max-w-2xl h-[85vh] bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-800">

                {/* Header */}
                <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900">
                    <h1 className="text-xl font-bold text-mauve-100">LLM Chat App</h1>
                    <p className="text-xs text-zinc-500 mt-0.5">Powered by Ollama</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-zinc-950">
                    {messages.length === 0 && !loading && (
                        <p className="text-sm text-zinc-500 text-center mt-10">
                            Send a message to start the conversation
                        </p>
                    )}

                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                    msg.role === "user"
                                        ? "bg-indigo-600 text-white rounded-br-md"
                                        : "bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-bl-md"
                                }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="px-4 py-2.5 rounded-2xl rounded-bl-md bg-zinc-800 border border-zinc-700 text-zinc-400 text-sm">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <p className="text-red-400 text-xs px-6 pt-2">{error}</p>
                )}

                {/* Input */}
                <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900 flex gap-2">
          <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}