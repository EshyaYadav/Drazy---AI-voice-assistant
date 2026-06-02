export type AssistantId = 'drazy' | 'samarth';

export interface Assistant {
  id: AssistantId;
  name: string;
  gender: 'female' | 'male';
  tagline: string;
  description: string;
  systemPrompt: string;
  hue: string;
  avatarGradient: string;
  accentColor: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  assistantId?: AssistantId;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  assistantId: AssistantId;
  createdAt: number;
  updatedAt: number;
}

export interface VoiceConfig {
  voiceURI: string;
  voiceName: string;
  rate: number;
  pitch: number;
  volume: number;
}

export type AppTheme = 'dark' | 'light';
