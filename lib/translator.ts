import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

const cache: Record<string, string> = {
  // Pre-seed cache with mock data to avoid unnecessary API calls on first load
  "en:Stały klient": "Regular client",
  "de:Stały klient": "Stammkunde",
  "en:Zalega z płatnością za ostatni miesiąc": "Overdue payment for last month",
  "de:Zalega z płatnością za ostatni miesiąc": "Zahlungsrückstand für den letzten Monat",
  "en:Opona przebita, dopłata 120 euro": "Flat tire, 120 euro surcharge",
  "de:Opona przebita, dopłata 120 euro": "Reifenpanne, 120 Euro Aufpreis",
  "pl:Achse defekt": "Uszkodzona oś",
  "en:Achse defekt": "Broken axle",
};

export async function translateDynamicText(text: string, targetLang: string): Promise<string> {
  if (!text) return text;
  const cacheKey = `${targetLang}:${text}`;
  if (cache[cacheKey]) return cache[cacheKey];

  try {
    if (!ai) {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("No Gemini API key found. Returning original text.");
        return text;
      }
      ai = new GoogleGenAI({ apiKey });
    }

    const langName = targetLang === 'pl' ? 'Polish' : targetLang === 'de' ? 'German' : 'English';
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Translate the following text to ${langName}. Only return the translated text, nothing else. Do not wrap in quotes. Text: "${text}"`,
    });
    const translated = response.text?.trim() || text;
    cache[cacheKey] = translated;
    return translated;
  } catch (e) {
    console.error("Translation error", e);
    return text;
  }
}
