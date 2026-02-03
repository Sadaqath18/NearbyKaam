import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

/* ================================
   1️⃣ SPEECH → TEXT (MIC INPUT)
================================ */
export function startSpeechInput(): Promise<string> {
  return new Promise((resolve, reject) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      reject(new Error("Speech recognition not supported"));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      resolve(transcript);
    };

    recognition.onerror = (event: any) => {
      reject(event.error);
    };

    recognition.start();
  });
}

/* ================================
   2️⃣ PROMOTE INTENT PARSER
================================ */
export type PromoteIntent =
  | { type: "ASK_PLANS" }
  | { type: "SELECT_PLAN"; radiusKm: number }
  | { type: "CONFIRM_BUY" }
  | { type: "UNKNOWN" };

export async function parsePromoteIntent(
  transcript: string,
  plans: { radiusKm: number; price: number }[],
): Promise<PromoteIntent> {
  const prompt = `
User said: "${transcript}"

Promotion plans:
${plans.map((p) => `${p.radiusKm}km for ₹${p.price}`).join(", ")}

Classify intent as JSON:
- ASK_PLANS
- SELECT_PLAN (include radiusKm)
- CONFIRM_BUY
- UNKNOWN

Return ONLY JSON.
`;

  try {
    const res = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
    });

    return JSON.parse(res.text);
  } catch (err) {
    console.error("Failed to parse promote intent", err);
    return { type: "UNKNOWN" };
  }
}
