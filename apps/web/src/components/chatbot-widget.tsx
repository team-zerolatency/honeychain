"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { X, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useChatbot } from "@/hooks/use-chatbot";

export function ChatbotWidget() {
  const t = useTranslations("chatbot");
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, isPending, isError } = useChatbot();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isPending]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isPending) return;
    sendMessage(trimmed);
    setInput("");
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="glass-panel mb-3 flex h-96 w-80 flex-col rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="Chatbot Logo"
                  width={20}
                  height={20}
                  className="h-5 w-5 object-contain"
                />
                <p className="font-display text-sm font-medium">{t("title")}</p>
              </div>
              <button onClick={() => setIsOpen(false)} aria-label="close">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={scrollRef} className="custom-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-3 pr-2">
              {messages.length === 0 && <p className="text-sm text-muted-foreground">{t("greeting")}</p>}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    m.role === "user" ? "ml-auto bg-accent text-background" : "bg-surface-2"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {isPending && <div className="max-w-[85%] rounded-xl bg-surface-2 px-3 py-2 text-sm text-muted-foreground">…</div>}
              {isError && <p className="text-sm text-verify-red">{t("unavailable")}</p>}
            </div>

            <div className="flex items-center gap-2 border-t border-border p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={t("placeholder")}
                className="flex-1 rounded-full border border-border bg-transparent px-3 py-1.5 text-sm outline-none"
              />
              <button
                onClick={handleSend}
                disabled={isPending}
                aria-label={t("send")}
                className="rounded-full bg-accent p-2 text-background"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((v) => !v)}
        aria-label={t("openLabel")}
        className="flex items-center justify-center bg-transparent border-0 p-0 focus:outline-none cursor-pointer filter drop-shadow-lg"
      >
        <Image
          src="/logo.png"
          alt="Chatbot"
          width={56}
          height={56}
          className="h-14 w-14 object-contain"
          priority
        />
      </motion.button>
    </div>
  );
}