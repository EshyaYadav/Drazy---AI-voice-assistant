import { cn } from '@/lib/utils';
import type { AssistantId } from '../types';
import { ASSISTANTS } from '../lib/assistants';

interface Props {
  assistantId: AssistantId;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-xl',
};

export function AssistantAvatar({ assistantId, size = 'md', animated = false, className }: Props) {
  const assistant = ASSISTANTS[assistantId];
  const initial = assistant.name[0];

  return (
    <div
      className={cn(
        'relative rounded-full flex items-center justify-center font-bold text-white select-none',
        `bg-gradient-to-br ${assistant.avatarGradient}`,
        sizeMap[size],
        animated && 'animate-pulse',
        className,
      )}
    >
      {initial}
      {animated && (
        <span className="absolute inset-0 rounded-full animate-ping opacity-30 bg-current" />
      )}
    </div>
  );
}
