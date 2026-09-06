import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import type { Router as ExpressRouter } from "express";
import { getChatbotReply, ChatbotUnavailableError } from "../services/chatbot.service";

export const chatbotRouter: ExpressRouter = Router();

const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many chat messages, please slow down." },
});

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .max(20)
    .default([]),
  locale: z.enum(["en", "hi"]).default("en"),
});

chatbotRouter.post("/message", chatLimiter, async (req, res, next) => {
  try {
    const input = ChatRequestSchema.parse(req.body);
    const reply = await getChatbotReply(input.message, input.history, input.locale);
    res.status(200).json({ reply });
  } catch (err) {
    if (err instanceof ChatbotUnavailableError) {
      return res.status(503).json({ error: err.message });
    }
    next(err);
  }
});