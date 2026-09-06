import { env } from "../env";
import { retrieveRelevantContext } from "../chatbot/knowledge-base";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export class ChatbotUnavailableError extends Error {}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MAX_HISTORY_MESSAGES = 10;

function buildSystemPrompt(context: string, locale: string) {
  const languageInstruction =
    locale === "hi" ? "Respond in Hindi." : "Respond in English.";
  return [
    "You are the support assistant for Honey Chain, a honey traceability platform built for SIH 2026.",
    "Answer ONLY using the context below. If the question isn't covered by the context, say plainly that you don't have that information and suggest checking with the Honey Chain team, rather than guessing.",
    "Keep answers short — 2-4 sentences unless the question genuinely needs more.",
    languageInstruction,
    "",
    "Context:",
    context,
  ].join("\n");
}

export async function getChatbotReply(userMessage: string, history: ChatMessage[], locale: string): Promise<string> {
  if (!env.GROQ_ENABLED || !env.GROQ_API_KEY) {
    throw new ChatbotUnavailableError("Chat support is not configured.");
  }

  const context = retrieveRelevantContext(userMessage);
  const trimmedHistory = history.slice(-MAX_HISTORY_MESSAGES);

  const messages = [
    { role: "system", content: buildSystemPrompt(context, locale) },
    ...trimmedHistory,
    { role: "user", content: userMessage },
  ];

  let response: Response;
  try {
    response = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: env.GROQ_MODEL,
        messages,
        temperature: 0.3,
        max_tokens: 300,
        reasoning_effort: "low",
      }),
    });
  } catch (err) {
    throw new ChatbotUnavailableError("Could not reach chat support right now.");
  }

  if (!response.ok) {
    throw new ChatbotUnavailableError("Chat support is temporarily unavailable.");
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content;
  if (!reply) throw new ChatbotUnavailableError("Chat support returned an unexpected response.");
  return reply;
}