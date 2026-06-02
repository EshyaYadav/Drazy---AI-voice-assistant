import { motion } from 'framer-motion';
import type { AssistantId } from '../types';
import { ASSISTANTS } from '../lib/assistants';
import { AssistantAvatar } from './AssistantAvatar';

const SUGGESTIONS = {
  drazy: [
    'How do I find a career that truly excites me?',
    'I feel stuck in life. Where do I start?',
    'How can I build better daily habits?',
    'Help me deal with anxiety about the future',
  ],
  samarth: [
    'How do I plan my career for the next 5 years?',
    'What skills should I focus on to grow faster?',
    'How do I make better decisions under pressure?',
    'Help me think through starting my own business',
  ],
};

interface Props {
  assistantId: AssistantId;
  onSuggestion: (text: string) => void;
}

export function WelcomeScreen({ assistantId, onSuggestion }: Props) {
  const assistant = ASSISTANTS[assistantId];
  const suggestions = SUGGESTIONS[assistantId];

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 pb-8 gap-8">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AssistantAvatar assistantId={assistantId} size="lg" />
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Hi, I'm {assistant.name}</h2>
          <p className="text-white/50 mt-2 text-base">{assistant.tagline}</p>
        </div>
        <p className="text-white/40 text-sm text-center max-w-md leading-relaxed">
          {assistant.description}
        </p>
      </motion.div>

      <motion.div
        className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        {suggestions.map((s, i) => (
          <motion.button
            key={i}
            onClick={() => onSuggestion(s)}
            className="text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/15 text-white/70 hover:text-white text-sm leading-snug transition-all duration-200"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {s}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
