# Drazy — AI Voice Assistant

A React + TypeScript + Vite web application that replicates the Drazy AI Voice Assistant UI and functionality.

## Features

- 🎙️ **Voice recognition** — uses the Web Speech API to listen to user commands
- 🤖 **AI responses** — powered by Google Gemini 2.0 Flash
- 🎨 **Image generation** — DALL-E 3 via RapidAPI
- 🔊 **Text-to-speech** — uses the Web Speech Synthesis API
- 💜 **Dark purple animated UI** — matches the original Flutter design exactly
- 📜 **Conversation history sidebar**

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure API keys

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_RAPID_API_KEY=your_rapidapi_key_here
```

- **Gemini API key**: Get one at https://aistudio.google.com/
- **RapidAPI key**: Subscribe to the DALL-E 3 API at https://rapidapi.com/

### 3. Run the development server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### 4. Build for production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── ChatBubble.tsx      # User/AI message bubbles
│   ├── HistoryMenu.tsx     # Slide-in conversation history sidebar
│   └── TypingIndicator.tsx # Animated typing dots
├── models/
│   └── message.ts          # Message type definition
├── screens/
│   ├── WelcomeScreen.tsx   # Animated welcome / landing screen
│   └── ChatScreen.tsx      # Main chat interface (greeting + chat mode)
├── services/
│   ├── aiService.ts        # Gemini AI + DALL-E image generation
│   └── speechService.ts    # Web Speech API (STT + TTS)
├── App.tsx
└── main.tsx
```

## Browser Requirements

- Chrome / Edge (recommended) — full Web Speech API support
- Firefox / Safari — partial support; voice input may not work

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** (build tool)
- **@google/generative-ai** (Gemini)
- **lottie-react** (AI bot animation)
- **Web Speech API** (STT + TTS, built into modern browsers)
