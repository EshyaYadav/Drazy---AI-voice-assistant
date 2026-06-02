import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Square, Volume2, VolumeX, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import type { AssistantId } from '../types';
import { ASSISTANTS } from '../lib/assistants';

interface Props {
  assistantId: AssistantId;
  isLoading: boolean;
  isSpeaking: boolean;
  voiceEnabled: boolean;
  onSend: (text: string) => void;
  onStopSpeaking: () => void;
  onToggleVoice: () => void;
  onOpenVoiceSettings: () => void;
  prefillText?: string;
}

export function ChatInput({
  assistantId,
  isLoading,
  isSpeaking,
  voiceEnabled,
  onSend,
  onStopSpeaking,
  onToggleVoice,
  onOpenVoiceSettings,
  prefillText,
}: Props) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const assistant = ASSISTANTS[assistantId];

  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported: micSupported,
    startListening,
    stopListening,
    reset: resetTranscript,
  } = useSpeechRecognition();

  useEffect(() => {
    if (prefillText) {
      setText(prefillText);
      textareaRef.current?.focus();
    }
  }, [prefillText]);

  useEffect(() => {
    if (transcript) {
      setText((prev) => (prev ? prev + ' ' + transcript : transcript));
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px';
    }
  }, [text]);

  const displayText = text + (interimTranscript ? ' ' + interimTranscript : '');

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    if (isListening) stopListening();
    onSend(trimmed);
    setText('');
    resetTranscript();
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const canSend = text.trim().length > 0 && !isLoading;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="flex items-center gap-2 mb-2 px-2"
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-xs text-white/50">
              Listening{interimTranscript ? ': ' + interimTranscript : '...'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2 bg-white/6 border border-white/10 rounded-2xl px-3 py-2 focus-within:border-white/20 transition-colors">
        <textarea
          ref={textareaRef}
          value={displayText}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder={`Message ${assistant.name}...`}
          rows={1}
          disabled={isLoading}
          className="flex-1 resize-none bg-transparent text-white placeholder:text-white/30 text-sm leading-relaxed outline-none py-1.5 min-h-[36px] max-h-[180px]"
          style={{ scrollbarWidth: 'none' }}
        />

        <div className="flex items-center gap-1 pb-1">
          {isSpeaking ? (
            <button
              onClick={onStopSpeaking}
              className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              title="Stop speaking"
            >
              <VolumeX size={18} />
            </button>
          ) : (
            <button
              onClick={onToggleVoice}
              className={cn(
                'p-2 rounded-xl transition-colors',
                voiceEnabled
                  ? 'text-white/80 hover:bg-white/10'
                  : 'text-white/30 hover:text-white/60 hover:bg-white/10',
              )}
              title={voiceEnabled ? 'Voice on — click to mute' : 'Voice off — click to enable'}
            >
              <Volume2 size={18} />
            </button>
          )}

          <button
            onClick={onOpenVoiceSettings}
            className="p-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/10 transition-colors"
            title="Voice settings"
          >
            <Settings2 size={18} />
          </button>

          {micSupported && (
            <button
              onClick={toggleMic}
              className={cn(
                'p-2 rounded-xl transition-all duration-200',
                isListening
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/10',
              )}
              title={isListening ? 'Stop recording' : 'Start voice input'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}

          {isLoading ? (
            <button
              disabled
              className="p-2 rounded-xl bg-white/10 text-white/30 cursor-not-allowed"
            >
              <Square size={18} className="animate-pulse" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={cn(
                'p-2 rounded-xl transition-all duration-200',
                canSend
                  ? 'text-white hover:bg-white/15 opacity-100'
                  : 'text-white/20 cursor-not-allowed',
              )}
              title="Send (Enter)"
            >
              <Send size={18} />
            </button>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-white/20 mt-2">
        Press Enter to send &middot; Shift+Enter for new line
      </p>
    </div>
  );
}
