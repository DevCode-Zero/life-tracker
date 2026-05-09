"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAIStore } from "@/store/aiStore";
import { VoiceRecorder } from "@/lib/ai/voice";
import { Mic, X, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AIAssistant() {
  const [input, setInput] = useState("");
  const [voiceRecorder] = useState(() => new VoiceRecorder());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isOpen,
    isListening,
    isProcessing,
    transcript,
    error,
    toggleOpen,
    close,
    setListening,
    setTranscript,
    processUserInput,
    clearMessages,
  } = useAIStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (voiceRecorder.supported) {
      voiceRecorder.onResult((text: string) => {
        setTranscript(text);
        setInput(text);
      });

      voiceRecorder.onEnd(() => {
        setListening(false);
      });

      voiceRecorder.onError((err: string) => {
        console.error("Voice error:", err);
        setListening(false);
      });
    }
  }, [voiceRecorder, setListening, setTranscript]);

  const handleToggleListening = () => {
    if (isListening) {
      voiceRecorder.stop();
      setListening(false);
      if (input.trim()) {
        handleSubmit();
      }
    } else {
      try {
        voiceRecorder.start();
        setListening(true);
        setTranscript("");
        setInput("");
      } catch (err) {
        console.error("Failed to start voice recognition:", err);
      }
    }
  };

  const handleSubmit = () => {
    if (input.trim() && !isProcessing) {
      processUserInput(input.trim());
      setInput("");
      setTranscript("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      {/* Siri-like Floating Button */}
      <motion.button
        onClick={toggleOpen}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full",
          "bg-gradient-to-br from-blue-500 to-purple-600",
          "shadow-lg hover:shadow-xl transition-shadow",
          "flex items-center justify-center",
          "ring-4 ring-blue-500/30",
          isOpen && "hidden",
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          scale: [1, 1.1, 1],
          boxShadow: [
            "0 0 20px rgba(59, 130, 246, 0.5)",
            "0 0 40px rgba(147, 51, 234, 0.5)",
            "0 0 20px rgba(59, 130, 246, 0.5)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="relative">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="16" cy="16" r="6" fill="white" />
            <path
              d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12 12-5.373 12-12S22.627 4 16 4z"
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M16 8v4M16 20v4M8 16h4M20 16h4"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </motion.button>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-120px)]"
          >
            <div className="flex flex-col h-full bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-700 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-700 bg-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                      <circle cx="16" cy="16" r="6" fill="white" />
                      <path
                        d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12 12-5.373 12-12S22.627 4 16 4z"
                        stroke="white"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">LifeTracker AI</h3>
                    <p className="text-zinc-400 text-xs">
                      {isListening
                        ? "Listening..."
                        : isProcessing
                          ? "Thinking..."
                          : "Online"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearMessages}
                    className="text-zinc-400 hover:text-white transition-colors"
                    title="Clear chat"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
                    </svg>
                  </button>
                  <button
                    onClick={close}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2",
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-zinc-800 text-zinc-100",
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <span className="text-xs opacity-50 mt-1 block">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-800 rounded-2xl px-4 py-2">
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Voice Waveform Animation */}
              {isListening && (
                <div className="px-4 py-2 bg-zinc-800 border-t border-zinc-700">
                  <div className="flex items-center justify-center gap-1 h-8">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-blue-500 rounded-full"
                        animate={{
                          height: [8, Math.random() * 24 + 8, 8],
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          delay: i * 0.05,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-center text-zinc-400 text-xs mt-1">
                    {transcript || "Listening..."}
                  </p>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="px-4 py-2 bg-red-900/50 border-t border-red-700">
                  <p className="text-red-200 text-xs">{error}</p>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 border-t border-zinc-700 bg-zinc-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleListening}
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      isListening
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-zinc-700 hover:bg-zinc-600 text-zinc-300",
                    )}
                    title={isListening ? "Stop recording" : "Start voice input"}
                  >
                    <Mic size={18} />
                  </button>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message or use voice..."
                    className="flex-1 bg-zinc-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isProcessing}
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!input.trim() || isProcessing}
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      input.trim() && !isProcessing
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-zinc-700 text-zinc-500 cursor-not-allowed",
                    )}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
