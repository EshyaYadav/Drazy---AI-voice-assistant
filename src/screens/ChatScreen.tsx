import { useEffect, useRef, useState } from 'react';
import Lottie from 'lottie-react';
import type { Message } from '../models/message';
import {
  checkIfImageRequired,
  generateImageFromDalle,
  getChatGptResponse,
} from '../services/aiService';
import { speak, startListening } from '../services/speechService';
import type { SpeechRecognitionType } from '../services/speechService';
import ChatBubble from '../components/ChatBubble';
import HistoryMenu from '../components/HistoryMenu';
import TypingIndicator from '../components/TypingIndicator';
import './ChatScreen.css';

function uuid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const greeting = "Hello! I'm your voice AI assistant. How can I help you today?";
    setMessages([
      {
        id: uuid(),
        text: greeting,
        isUser: false,
        timestamp: new Date(),
      },
    ]);

    setTimeout(() => speak(greeting), 1500);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  function refreshChat() {
    stopListening();
    const greeting = "Hello! I'm your voice AI assistant. How can I help you today?";
    setMessages([
      {
        id: uuid(),
        text: greeting,
        isUser: false,
        timestamp: new Date(),
      },
    ]);
    setIsThinking(false);
  }

  function stopListening() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }

  function toggleListening() {
    if (isListening) {
      stopListening();
      return;
    }

    setIsListening(true);

    if (!showChatInterface) {
      setShowChatInterface(true);
    }

    recognitionRef.current = startListening(
      async (text) => {
        stopListening();
        if (!text.trim()) return;

        const userMsg: Message = {
          id: uuid(),
          text,
          isUser: true,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setIsThinking(true);

        const decision = await checkIfImageRequired(text);
        if (decision === 'yes') {
          const imageUrl = await generateImageFromDalle(text);
          setMessages((prev) => [
            ...prev,
            {
              id: uuid(),
              text: 'Here is your image:',
              isUser: false,
              timestamp: new Date(),
              imgUrl: imageUrl,
            },
          ]);
          speak('Here is the image I created for you');
        } else {
          const response = await getChatGptResponse(text);
          setMessages((prev) => [
            ...prev,
            { id: uuid(), text: response, isUser: false, timestamp: new Date() },
          ]);
          speak(response);
        }

        setIsThinking(false);
      },
      () => {
        setIsListening(false);
      },
    );
  }

  // Load Lottie animation data
  const [lottieData, setLottieData] = useState<unknown>(null);
  useEffect(() => {
    fetch('/assets/lotties/ai_bot.json')
      .then((r) => r.json())
      .then(setLottieData)
      .catch(() => setLottieData(null));
  }, []);

  return (
    <div className="chat-screen">
      {/* History overlay */}
      {showHistory && (
        <div className="history-overlay" onClick={() => setShowHistory(false)}>
          <div
            className="history-sidebar slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <HistoryMenu onClose={() => setShowHistory(false)} />
          </div>
        </div>
      )}

      {!showChatInterface ? (
        /* ---- Greeting view ---- */
        <div className="greeting-screen">
          {/* App bar */}
          <div className="app-bar">
            <button className="icon-btn" onClick={() => setShowHistory(true)}>
              <span className="material-icon">history</span>
            </button>
            <span className="app-bar-title">AI Assistant</span>
            <button className="icon-btn">
              <span className="material-icon">settings</span>
            </button>
          </div>

          <div className="greeting-body">
            {/* Lottie animation */}
            <div className="lottie-wrapper">
              <div className="lottie-glow" />
              {lottieData ? (
                <Lottie
                  animationData={lottieData}
                  loop
                  className="lottie-anim floating"
                />
              ) : (
                <div className="lottie-placeholder">
                  <span className="material-icon lottie-fallback-icon">smart_toy</span>
                </div>
              )}
            </div>

            {/* Welcome card */}
            <div className="welcome-card">
              <h2 className="welcome-card-title">Welcome to AI Assistant</h2>
              <p className="welcome-card-desc">
                Your intelligent voice companion ready to help with anything you need.
                Tap the microphone to start our conversation.
              </p>
            </div>

            {/* Mic button */}
            <button
              className={`mic-btn greeting-mic ${isListening ? 'listening' : ''}`}
              onClick={toggleListening}
            >
              <span className="material-icon">
                {isListening ? 'stop' : 'mic'}
              </span>
            </button>

            <p className="tap-hint">{isListening ? 'Listening...' : 'Tap to speak'}</p>
          </div>
        </div>
      ) : (
        /* ---- Chat view ---- */
        <div className="chat-view">
          {/* App bar */}
          <div className="app-bar">
            <button className="icon-btn" onClick={() => setShowHistory(true)}>
              <span className="material-icon">history</span>
            </button>
            <span className="app-bar-title">AI Assistant</span>
            <div className="app-bar-actions">
              <button className="icon-btn" onClick={refreshChat} title="Refresh">
                <span className="material-icon">refresh</span>
              </button>
              <button className="icon-btn">
                <span className="material-icon">settings</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="messages-area">
            <div className="messages-inner">
              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
              {isThinking && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Bottom toolbar */}
          <div className="bottom-bar">
            <div className="bottom-bar-inner">
              <div className="speak-indicator">
                <span className="speak-indicator-text">
                  {isListening ? 'Listening...' : 'Tap to speak'}
                </span>
              </div>
              <button
                className={`mic-btn chat-mic ${isListening ? 'listening' : ''}`}
                onClick={toggleListening}
              >
                <span className="material-icon">
                  {isListening ? 'stop' : 'mic'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
