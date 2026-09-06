import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { apiFetch, ApiError } from "@/lib/api-client";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function useChatbot() {
  const locale = useLocale();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const mutation = useMutation({
    mutationFn: (message: string) =>
      apiFetch<{ reply: string }>("/chatbot/message", {
        method: "POST",
        body: JSON.stringify({ message, history: messages, locale }),
      }),
  });

  function sendMessage(message: string) {
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    mutation.mutate(message, {
      onSuccess: (data) => setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]),
      onError: () => {}, // surfaced via mutation.isError in the widget, not appended as a fake message
    });
  }

  return { messages, sendMessage, isPending: mutation.isPending, isError: mutation.isError, error: mutation.error };
}