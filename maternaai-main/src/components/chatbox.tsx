import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRecommendation } from "@/context/RecommendationContext";

type ChatMessage = {
  role: "user" | "ai";
  text: string;
};

export default function ChatBox() {
  const [open, setOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const location = useLocation();
  const { results } = useRecommendation();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const updatedChat: ChatMessage[] = [
      ...chat,
      { role: "user", text: message }
    ];

    setChat(updatedChat);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("https://maternaai.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedChat.map((msg) => ({
            role: msg.role === "ai" ? "assistant" : "user",
            content: msg.text,
          })),
          currentPage: location.pathname,
          recommendationData: results,
        }),
      });

      if (!res.ok) {
        throw new Error("Server response failed");
      }

      const data = await res.json();

      setChat((prev) => [
        ...prev,
        { role: "ai", text: data.reply || "No response generated." },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setChat((prev) => [
        ...prev,
        { role: "ai", text: "⚠️ Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full 
        bg-gradient-to-r from-[#e76f51] to-[#f4a261]
        shadow-lg flex items-center justify-center 
        text-white text-xl cursor-pointer z-50 transition-all duration-300"
      >
        💬
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 w-[380px] h-[520px] 
              bg-white/90 backdrop-blur-xl 
              border border-[#f1e5dc]
              shadow-2xl rounded-2xl 
              flex flex-col z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-[#f1e5dc]">
              <h3 className="font-semibold text-transparent bg-clip-text 
                bg-gradient-to-r from-[#e76f51] to-[#f4a261]">
                Materna AI Assistant
              </h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chat.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`max-w-[80%] px-4 py-2 rounded-xl text-sm ${
                    msg.role === "user"
                      ? "ml-auto bg-gradient-to-r from-[#e76f51] to-[#f4a261] text-white"
                      : "bg-[#fdf6f0] text-gray-800"
                  }`}
                >
                  {msg.text}
                </motion.div>
              ))}

              {loading && (
                <div className="text-sm text-gray-500">Materna AI is typing...</div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-[#f1e5dc] flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask about your recommendations..."
                className="flex-1 px-3 py-2 rounded-lg 
                border border-[#f1e5dc] 
                bg-white text-gray-800 
                focus:outline-none focus:ring-2 focus:ring-[#e76f51] transition"
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                className="px-4 py-2 rounded-lg 
                bg-gradient-to-r from-[#e76f51] to-[#f4a261] 
                text-white hover:opacity-90 transition disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}