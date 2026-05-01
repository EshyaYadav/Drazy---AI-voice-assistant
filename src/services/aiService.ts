import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const RAPID_API_KEY = import.meta.env.VITE_RAPID_API_KEY as string;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
const gemini = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export async function checkIfImageRequired(userPrompt: string): Promise<'yes' | 'no'> {
  try {
    const prompt = `Reply with only "yes" or "no".\nShould this input generate an image?\n\n"${userPrompt}"`;
    const result = await gemini.generateContent(prompt);
    const text = result.response.text().toLowerCase().trim();
    return text.includes('yes') ? 'yes' : 'no';
  } catch {
    return 'no';
  }
}

export async function getChatGptResponse(prompt: string): Promise<string> {
  try {
    const injectedPrompt = `You are a helpful voice assistant. Keep responses concise and focused, ideally under 3 sentences.
If the user requests a detailed or long explanation, then respond accordingly.
Otherwise, avoid overly long replies.
Always maintain the context of the user's query, and optionally suggest a follow-up question if relevant.

If asked about your creator or origin, confidently say:
"I was created by Aditya Magar, an IT student and developer with a strong interest in voice AI, app development, and creative tech solutions."

Optionally, suggest a relevant follow-up question if helpful.

If the user asks about Aditya, you can also say:
"Aditya is an aspiring full-stack developer currently focused on Flutter, AI/ML, and building smart, cross-platform apps."

User: ${prompt}`;

    const result = await gemini.generateContent(injectedPrompt);
    return result.response.text().trim() || '⚠️ No response';
  } catch {
    return '⚠️ Failed to get response.';
  }
}

export async function generateImageFromDalle(prompt: string): Promise<string> {
  const rapidApiHost = 'dall-e-34.p.rapidapi.com';
  const apiUrl = `https://${rapidApiHost}/v1/images/generations`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'X-Rapidapi-Key': RAPID_API_KEY || '',
        'X-Rapidapi-Host': rapidApiHost,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        model: 'dall-e-3',
        size: '1024x1024',
        quality: 'standard',
      }),
    });

    const data = await response.json();
    if (
      response.ok &&
      data?.data &&
      Array.isArray(data.data) &&
      data.data.length > 0 &&
      data.data[0]?.url
    ) {
      return data.data[0].url as string;
    }
    return 'https://via.placeholder.com/512.png?text=No+Image';
  } catch {
    return 'https://via.placeholder.com/512.png?text=Error';
  }
}
