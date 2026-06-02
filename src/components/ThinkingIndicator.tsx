import { motion } from 'framer-motion';
import { AssistantAvatar } from './AssistantAvatar';
import type { AssistantId } from '../types';

interface Props {
  assistantId: AssistantId;
}

export function ThinkingIndicator({ assistantId }: Props) {
  return (
    <div className="flex items-start gap-3 px-4 py-2">
      <AssistantAvatar assistantId={assistantId} size="sm" />
      <div className="flex items-center gap-1.5 bg-white/5 rounded-2xl px-4 py-3 mt-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-white/40"
            animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </div>
  );
}
