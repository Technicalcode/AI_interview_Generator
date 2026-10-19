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

const FALLBACK_MODELS = [
    "gemini-3.5-flash",
    "gemini-3.6-flash",
    "gemini-3.7-flash",
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash"
];

const askAi = async (messages) => {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        throw new Error("Messages array is empty.");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Missing Gemini API key. Set GEMINI_API_KEY in server/.env.");
    }

    // Separate system message from conversation messages
    const systemMsg = messages.find((m) => m.role === "system");
    const conversationMsgs = messages.filter((m) => m.role !== "system");

    // Convert messages to Gemini format
    const contents = conversationMsgs.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
    }));

    const requestBody = {
        contents,
        generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 1024
        }
    };

    if (systemMsg) {
        requestBody.systemInstruction = {
            parts: [{ text: systemMsg.content }]
        };
    }

    // Determine model list to try: prefer configured model, then fallback models
    const configuredModel = process.env.GEMINI_MODEL;
    const modelsToTry = [
        ...(configuredModel ? [configuredModel] : []),
        ...FALLBACK_MODELS
    ].filter((m, i, arr) => arr.indexOf(m) === i);

    let lastError = null;

    for (const model of modelsToTry) {
        try {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                requestBody,
                {
                    headers: { "Content-Type": "application/json" },
                    timeout: 25000
                }
            );

            const content = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (content && content.trim()) {
                return content;
            }
        } catch (error) {
            const status = error.response?.status;
            const errorMsg = error.response?.data?.error?.message || error.message;
            console.warn(`Gemini model ${model} failed (${status || "error"}): ${errorMsg}. Trying next model...`);
            lastError = error;
            // Continue loop to try next model in fallback list
        }
    }

    console.error("All Gemini models failed. Last error:", lastError?.response?.data || lastError?.message);
    throw new Error("Gemini API Error: " + (lastError?.response?.data?.error?.message || lastError?.message || "All models failed"));
};

module.exports = { askAi, readJson };
