// Gemini API Service – Finance-only AI Advisor

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_PROMPT = `You are TrueSay's financial advisor AI for Indian users.
RULES:
- Answer ONLY finance, budgeting, investments, UPI, digital payments, tax (India), fraud prevention questions.
- Keep answers clear and concise — around 3-5 sentences. Give complete, useful answers.
- Be direct and actionable. Use simple language.
- If asked non-finance topics, say: "I can only help with financial matters."
- Mention RBI/NPCI rules only when directly relevant.
- Use short paragraphs. Avoid excessive bullet points.`;

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export async function sendToGemini(
  userMessage: string,
  history: GeminiMessage[]
): Promise<string> {
  if (!GEMINI_API_KEY) {
    return "⚠️ Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file to enable the AI Advisor.";
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          ...history,
          { role: 'user', parts: [{ text: userMessage }] },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 500,
        },
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData?.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I couldn't generate a response. Please try again.";
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return `Unable to connect to the AI Advisor right now. ${error.message || 'Please check your API key and internet connection.'}`;
  }
}
