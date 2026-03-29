import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.CHAT_LLM_MODEL || "gemini-1.5-flash" });

export const chatController = async (req, res) => {
    try {
        const { messages, articleContext } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: "Invalid input format. 'messages' should be a non-empty array." });
        }

        if (!articleContext || !articleContext.headline) {
            return res.status(400).json({ error: "Article context with headline is required." });
        }

        // 1. Prepare the system instruction / context
        const contextPrompt = `
You are 'ET AI', an advanced intelligence assistant. 
You are discussing the following intelligence briefing:
- Headline: ${articleContext.headline}
- Category: ${articleContext.category}
- Summary: ${articleContext.summary.join(". ")}
- Key Players: ${articleContext.keyPlayers.join(", ")}
- Story Arc: ${articleContext.arc.join(" -> ")}

Your goal is to provide deep analysis, answer questions about this specific briefing, and connect the dots. 
Keep your answers professional, concise, and focused on the provided context.
If asked about something completely unrelated to this news, politely redirect back to the briefing.
`;

        // 2. Format history for Gemini SDK
        // Gemini SDK uses 'user' and 'model' roles. 
        // We'll treat the first message as a prompt with the context.
        
        const chat = model.startChat({
            history: messages.slice(0, -1).map(msg => ({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.content }],
            })),
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const lastMessage = messages[messages.length - 1].content;
        
        // If it's the first message, prepend the context
        const messageWithContext = messages.length === 1 
            ? `${contextPrompt}\n\nUser Question: ${lastMessage}` 
            : lastMessage;

        const result = await chat.sendMessage(messageWithContext);
        const response = result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("Chat Controller Error:", error);
        const errorMessage = error instanceof Error ? error.message : "An error occurred while processing the chat.";
        res.status(500).json({ error: errorMessage });
    }
};
