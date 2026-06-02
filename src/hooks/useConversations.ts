import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Conversation, Message, AssistantId } from '../types';

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

function titleFromMessage(content: string): string {
  const trimmed = content.trim().slice(0, 60);
  return trimmed.length < content.trim().length ? trimmed + '…' : trimmed;
}

export function useConversations() {
  const [conversations, setConversations] = useLocalStorage<Conversation[]>(
    'ai-assistant-conversations',
    [],
  );
  const [activeId, setActiveId] = useLocalStorage<string | null>(
    'ai-assistant-active-id',
    null,
  );

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  const createConversation = useCallback(
    (assistantId: AssistantId, firstMessage?: string): Conversation => {
      const id = generateId();
      const now = Date.now();
      const conv: Conversation = {
        id,
        title: firstMessage ? titleFromMessage(firstMessage) : 'New conversation',
        messages: [],
        assistantId,
        createdAt: now,
        updatedAt: now,
      };
      setConversations((prev) => [conv, ...prev]);
      setActiveId(id);
      return conv;
    },
    [setConversations, setActiveId],
  );

  const addMessage = useCallback(
    (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
      const now = Date.now();
      const fullMessage: Message = {
        ...message,
        id: generateId(),
        timestamp: now,
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                messages: [...c.messages, fullMessage],
                updatedAt: now,
                title:
                  c.messages.length === 0 && message.role === 'user'
                    ? titleFromMessage(message.content)
                    : c.title,
              }
            : c,
        ),
      );
      return fullMessage;
    },
    [setConversations],
  );

  const updateLastAssistantMessage = useCallback(
    (conversationId: string, content: string) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c;
          const messages = [...c.messages];
          const lastIdx = messages.length - 1;
          if (lastIdx >= 0 && messages[lastIdx].role === 'assistant') {
            messages[lastIdx] = { ...messages[lastIdx], content };
          }
          return { ...c, messages, updatedAt: Date.now() };
        }),
      );
    },
    [setConversations],
  );

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      setActiveId((prev) => (prev === id ? null : prev));
    },
    [setConversations, setActiveId],
  );

  const clearAll = useCallback(() => {
    setConversations([]);
    setActiveId(null);
  }, [setConversations, setActiveId]);

  return {
    conversations,
    activeConversation,
    activeId,
    setActiveId,
    createConversation,
    addMessage,
    updateLastAssistantMessage,
    deleteConversation,
    clearAll,
  };
}
