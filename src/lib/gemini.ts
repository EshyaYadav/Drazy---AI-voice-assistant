import type { AssistantId } from '../types';
import { ASSISTANTS } from './assistants';

// @ts-ignore
const apiKey = (import.meta as any).env.VITE_GROQ_API_KEY as string;
if (!apiKey) throw new Error('VITE_GROQ_API_KEY environment binding is not set.');
export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export function buildChatHistory(
  messages: { role: 'user' | 'assistant'; content: string }[],
): ChatMessage[] {
  return messages.map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));
}

class GroqStreamIterator {
  private textResponse: string;

  constructor(textResponse: string) {
    this.textResponse = textResponse;
  }

  async *[Symbol.asyncIterator]() {
    const chunks = this.textResponse.match(/.{1,8}/g) || [this.textResponse];
    for (const chunk of chunks) {
      await new Promise((resolve) => setTimeout(resolve, 12));
      yield {
        text: () => chunk,
      };
    }
  }
}

class GroqChatSession {
  private systemPrompt: string;
  private history: ChatMessage[];

  constructor(systemPrompt: string, history: ChatMessage[]) {
    this.systemPrompt = systemPrompt;
    this.history = history;
  }

  async sendMessageStream(message: string) {
    this.history.push({ role: 'user', parts: [{ text: message }] });

    // Force strict voice assistant behavior for short responses
    const strictVoiceInstruction = `${this.systemPrompt} CRITICAL: You are a casual voice assistant. Keep all responses ultra-short, dynamic, and limited to 1 or 2 conversational sentences maximum. Never output long paragraphs or lists unless explicitly requested.`;

    const groqMessages = [
      { role: 'system', content: strictVoiceInstruction },
      ...this.history.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.parts[0]?.text || '',
      })),
    ];

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: groqMessages,
          temperature: 0.85,
          max_tokens: 150, // Strict token limit to prevent long paragraphs
        }),
      });

      if (!response.ok) {
        const errPayload = await response.json().catch(() => ({}));
        throw new Error(errPayload.error?.message || 'Groq response processing failure.');
      }

      const data = await response.json();
      const aiResponseText = data.choices[0]?.message?.content || 'No context returned.';

      this.history.push({ role: 'model', parts: [{ text: aiResponseText }] });

      return {
        stream: new GroqStreamIterator(aiResponseText),
      };

    } catch (error) {
      console.error('Groq Engine Breakdown:', error);
      throw error;
    }
  }
}

export function createChat(assistantId: AssistantId, history: ChatMessage[]) {
  if (!apiKey) throw new Error('VITE_GROQ_API_KEY environment binding is not set.');
  
  const assistant = ASSISTANTS[assistantId];
  return new GroqChatSession(assistant.systemPrompt, history);
}