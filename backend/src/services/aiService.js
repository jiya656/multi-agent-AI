// aiService.js
//
// The ONLY file in the whole backend that knows how to talk to our LLM
// provider. chatController.js calls getAIResponse() and never needs to
// know or care whether that's Groq, OpenAI, a local Ollama model, or
// anything else. Swapping providers later means changing THIS file only.

const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_MODEL = process.env.LLM_MODEL || "llama-3.3-70b-versatile";
// Groq exposes an OpenAI-compatible endpoint, which is why this looks
// like an OpenAI request shape even though the provider is Groq.
const LLM_BASE_URL = process.env.LLM_BASE_URL || "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT =
  "You are a helpful AI assistant inside a multi-agent AI workspace. Be clear and concise.";

// Takes the full message history for a conversation (from MongoDB) and
// returns the AI's reply as a plain string. Throws a typed Error on any
// failure — the controller decides how to translate that into an HTTP
// response; this function's only job is talking to the LLM.
async function getAIResponse(conversationHistory) {
  if (!LLM_API_KEY) {
    const err = new Error("LLM_API_KEY is not configured");
    err.type = "CONFIG_ERROR";
    throw err;
  }

  // Convert our MongoDB message documents into the {role, content} shape
  // every major LLM API expects, with a system prompt prepended.
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...conversationHistory.map((m) => ({ role: m.role, content: m.content })),
  ];

  let response;
  try {
    response = await fetch(LLM_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify({ model: LLM_MODEL, messages, max_tokens: 800 }),
    });
  } catch (networkErr) {
    // fetch itself throwing means we couldn't even reach the provider —
    // DNS failure, no internet, provider fully down, etc.
    const err = new Error("Network error reaching the LLM provider");
    err.type = "NETWORK_ERROR";
    err.cause = networkErr;
    throw err;
  }

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    const err = new Error(`LLM provider responded with ${response.status}: ${bodyText}`);
    err.type =
      response.status === 401
        ? "AUTH_ERROR" // bad/expired API key
        : response.status === 429
        ? "RATE_LIMIT" // too many requests
        : "PROVIDER_ERROR";
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    const err = new Error("LLM provider returned an empty response");
    err.type = "EMPTY_RESPONSE";
    throw err;
  }

  return content;
}

module.exports = { getAIResponse };