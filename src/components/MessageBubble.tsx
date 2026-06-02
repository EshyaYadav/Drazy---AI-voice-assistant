import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { AssistantAvatar } from './AssistantAvatar';
import type { Message } from '../types';
import type { AssistantId } from '../types';
import { ASSISTANTS } from '../lib/assistants';

interface Props {
  message: Message;
  isStreaming?: boolean;
}

function UserBubble({ content }: { content: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex justify-end px-4 py-1"
    >
      <div className="max-w-[75%] bg-white/10 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words">
        {content}
      </div>
    </motion.div>
  );
}

function AssistantBubble({
  content,
  assistantId,
  isStreaming,
}: {
  content: string;
  assistantId: AssistantId;
  isStreaming?: boolean;
}) {
  const assistant = ASSISTANTS[assistantId];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-3 px-4 py-1"
    >
      <AssistantAvatar assistantId={assistantId} size="sm" className="mt-1 shrink-0" />
      <div className="flex-1 min-w-0">
        <span
          className="text-xs font-semibold mb-1 block"
          style={{ color: assistant.accentColor }}
        >
          {assistant.name}
        </span>
        <div
          className={cn(
            'prose prose-sm prose-invert max-w-none text-white/90 leading-relaxed',
            '[&>p]:mb-3 [&>p:last-child]:mb-0',
            '[&>ul]:mb-3 [&>ol]:mb-3',
            '[&>h1]:text-white [&>h2]:text-white [&>h3]:text-white',
            '[&>code]:text-pink-300 [&>pre]:bg-white/5 [&>pre]:rounded-lg [&>pre]:p-3',
            '[&>blockquote]:border-l-2 [&>blockquote]:border-white/20 [&>blockquote]:pl-3 [&>blockquote]:text-white/60',
          )}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          {isStreaming && (
            <span className="inline-block w-0.5 h-4 bg-white/60 ml-0.5 animate-pulse align-text-bottom" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function MessageBubble({ message, isStreaming }: Props) {
  if (message.role === 'user') {
    return <UserBubble content={message.content} />;
  }

  return (
    <AssistantBubble
      content={message.content}
      assistantId={(message.assistantId as AssistantId) ?? 'drazy'}
      isStreaming={isStreaming}
    />
  );
}
