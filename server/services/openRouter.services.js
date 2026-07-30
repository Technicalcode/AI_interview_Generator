const axios = require("axios");

const readJson = (content, fallback = {}) => {
    if (!content || typeof content !== "string") {
        return fallback;
    }

    const cleaned = content
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    try {
        if (firstBrace >= 0 && lastBrace > firstBrace) {
            return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
        }

        return JSON.parse(cleaned);
    } catch {
        return fallback;
    }
};

const askAi = async (messages) => {
    try{
        if (!messages || !Array.isArray(messages) || messages.length=== 0) {
            throw new Error("Messages array is empty.");

        }

        const apiKey = process.env.OPENROUTER_API_KEY || process.env.acess_token;

        if (!apiKey) {
            throw new Error("Missing OpenRouter API key. Set OPENROUTER_API_KEY in server/.env.");
        }

        const model = process.env.OPENROUTER_MODEL || "openrouter/free";

        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model,
            messages: messages
        },{
             headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
    'X-Title': 'InterviewIQ.AI',
  },
        });

         const content = response?.data?.choices?.[0]?.message?.content;

           if (!content || !content.trim()) {
    throw new Error("AI returned empty response.");
  }

  return content;


    }
    catch (error) {
  console.error("OpenRouter Error:", error.response?.data || error.message);
  throw new Error("OpenRouter API Error");
}
}

module.exports = { askAi, readJson };
