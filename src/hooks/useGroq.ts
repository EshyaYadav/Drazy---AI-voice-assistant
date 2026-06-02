import { useState, useCallback, useRef } from 'react';
import { createChat, buildChatHistory } from '../lib/gemini';
import type { Message, AssistantId } from '../types';

type ChatInstance = ReturnType<typeof createChat>;

export function useGroq() {
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const chatRef = useRef<ChatInstance | null>(null);
  const lastAssistantRef = useRef<AssistantId | null>(null);

  const resetChat = useCallback(() => {
    chatRef.current = null;
    lastAssistantRef.current = null;
  }, []);

  const sendMessage = useCallback(
    async (
      text: string,
      assistantId: AssistantId,
      history: Message[],
      onChunk: (accumulated: string) => void,
      onComplete: (fullText: string) => void,
      onError: (err: Error) => void,
    ) => {
      setIsLoading(true);
      setStreamingContent('');

      try {
        if (!chatRef.current || lastAssistantRef.current !== assistantId) {
          const localHistory = buildChatHistory(
            history.filter((m) => m.role === 'user' || m.role === 'assistant'),
          );
          chatRef.current = createChat(assistantId, localHistory);
          lastAssistantRef.current = assistantId;
        }

        const result = await chatRef.current.sendMessageStream(text);
        let accumulated = '';

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          accumulated += chunkText;
          setStreamingContent(accumulated);
          onChunk(accumulated);
        }

        setStreamingContent('');
        onComplete(accumulated);
      } catch (err) {
        setStreamingContent('');
        onError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { isLoading, streamingContent, sendMessage, resetChat };
}