import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { MessageBubble } from '../components/MessageBubble';
import { ThinkingIndicator } from '../components/ThinkingIndicator';
import { WelcomeScreen } from '../components/WelcomeScreen';
import { ChatInput } from '../components/ChatInput';
import { VoiceSettings } from '../components/VoiceSettings';
import { useConversations } from '../hooks/useConversations';
import { useGroq } from '../hooks/useGroq';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { AssistantId, VoiceConfig, AppTheme } from '../types';
import type { Message } from '../types';

const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  voiceURI: '',
  voiceName: '',
  rate: 1.15,   // Speed increased to 1.15 for crisp, natural, fast talking pace
  pitch: 1.0,
  volume: 1.0,
};

export function ChatPage() {
  const [assistantId, setAssistantId] = useLocalStorage<AssistantId>('ai-assistant-persona', 'drazy');
  const [theme, setTheme] = useLocalStorage?.<AppTheme>('ai-assistant-theme', 'dark');
  const [voiceEnabled, setVoiceEnabled] = useLocalStorage<boolean>('ai-assistant-voice', true);
  const [voiceConfig, setVoiceConfig] = useLocalStorage<VoiceConfig>('ai-assistant-voice-config', DEFAULT_VOICE_CONFIG);
  const [voiceSettingsOpen, setVoiceSettingsOpen] = useState(false);
  const [prefillText, setPrefillText] = useState<string | undefined>();
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  const {
    conversations,
    activeConversation,
    activeId,
    setActiveId,
    createConversation,
    addMessage,
    updateLastAssistantMessage,
    deleteConversation,
  } = useConversations();

  const { isLoading, sendMessage, resetChat } = useGroq();
  const { isSpeaking, speak, stop: stopSpeaking } = useSpeechSynthesis();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages.length, streamingMessageId]);

  const handleAssistantChange = useCallback((id: AssistantId) => {
    setAssistantId(id);
    resetChat();
    setActiveId(null);
  }, [setAssistantId, resetChat, setActiveId]);

  const handleNewConversation = useCallback(() => {
    setActiveId(null);
    setPrefillText(undefined);
  }, [setActiveId]);

  // Optimized dynamic synthesis handler for standard human speech pace mapping
  const handleDynamicSpeak = useCallback((textToSpeak: string) => {
    if (!voiceEnabled) return;
    
    const voices = window.speechSynthesis.getVoices();
    let runtimeConfig = { ...voiceConfig };

    // Strict professional voice mapping logic avoiding artificial pitch accents
    if (assistantId === 'drazy') {
      const targetFemale = voices.find(v => 
        v.name.includes('Google US English') || v.name.includes('Zira') || v.name.includes('Female') || v.name.includes('Hazel')
      );
      if (targetFemale) {
        runtimeConfig.voiceURI = targetFemale.voiceURI;
        runtimeConfig.voiceName = targetFemale.name;
      }
      runtimeConfig.pitch = 0.96; // Dropped pitch slightly below default to eliminate artificial sweetness
      runtimeConfig.rate = 1.15;  // Fast-paced professional rate
    } else {
      const targetMale = voices.find(v => 
        v.name.includes('David') || v.name.includes('Google UK English Male') || v.name.includes('Male') || v.name.includes('Ravi')
      );
      if (targetMale) {
        runtimeConfig.voiceURI = targetMale.voiceURI;
        runtimeConfig.voiceName = targetMale.name;
      }
      runtimeConfig.pitch = 0.88; // Grounded, mature professional depth
      runtimeConfig.rate = 1.15;  // Fast-paced crisp execution
    }

    speak(textToSpeak, runtimeConfig);
  }, [assistantId, voiceEnabled, voiceConfig, speak]);

  const handleSend = useCallback(async (text: string) => {
    let convId = activeId;

    if (!convId) {
      const conv = createConversation(assistantId, text);
      convId = conv.id;
    }

    addMessage(convId, {
      role: 'user',
      content: text,
      assistantId,
    });

    const placeholderMsg = addMessage(convId, {
      role: 'assistant',
      content: '',
      assistantId,
    });

    setStreamingMessageId(placeholderMsg.id);

    const history: Message[] = (activeConversation?.messages ?? []).filter(
      (m) => m.role === 'user' || m.role === 'assistant',
    );

    await sendMessage(
      text,
      assistantId,
      history,
      (accumulated) => {
        updateLastAssistantMessage(convId!, accumulated);
      },
      (fullText) => {
        updateLastAssistantMessage(convId!, fullText);
        setStreamingMessageId(null);
        handleDynamicSpeak(fullText);
      },
      (err) => {
        const errText =
          err.message.includes('API_KEY') || err.message.includes('400')
            ? 'API key error. Please check your Groq API key in the settings.'
            : `Error: ${err.message}`;
        updateLastAssistantMessage(convId!, errText);
        setStreamingMessageId(null);
      },
    );
  }, [
    activeId,
    activeConversation,
    assistantId,
    createConversation,
    addMessage,
    updateLastAssistantMessage,
    sendMessage,
    handleDynamicSpeak,
  ]);

  const handleSuggestion = useCallback((text: string) => {
    setPrefillText(text);
  }, []);

  useEffect(() => {
    if (prefillText) {
      handleSend(prefillText);
      setPrefillText(undefined);
    }
  }, [prefillText, handleSend]);

  const messages = activeConversation?.messages ?? [];
  const showWelcome = messages.length === 0;

  return (
    <div className={`flex h-screen w-full overflow-hidden ${theme === 'dark' ? 'bg-[#13111a]' : 'bg-[#f5f5f7]'}`}>
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        assistantId={assistantId}
        theme={theme}
        onSelect={setActiveId}
        onNew={handleNewConversation}
        onDelete={deleteConversation}
        onAssistantChange={handleAssistantChange}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />

      <div className="flex flex-col flex-1 min-w-0 relative">
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
          {showWelcome ? (
            <div className="h-full flex items-center justify-center">
              <WelcomeScreen
                assistantId={assistantId}
                onSuggestion={handleSuggestion}
              />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto py-6 space-y-1">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isStreaming={streamingMessageId === msg.id}
                />
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <ThinkingIndicator assistantId={assistantId} />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="shrink-0 pt-2"
        >
          <ChatInput
            assistantId={assistantId}
            isLoading={isLoading}
            isSpeaking={isSpeaking}
            voiceEnabled={voiceEnabled}
            onSend={handleSend}
            onStopSpeaking={stopSpeaking}
            onToggleVoice={() => setVoiceEnabled((v) => !v)}
            onOpenVoiceSettings={() => setVoiceSettingsOpen(true)}
          />
        </motion.div>
      </div>

      <VoiceSettings
        open={voiceSettingsOpen}
        assistantId={assistantId}
        config={voiceConfig}
        onChange={setVoiceConfig}
        onClose={() => setVoiceSettingsOpen(false)}
      />
    </div>
  );
}