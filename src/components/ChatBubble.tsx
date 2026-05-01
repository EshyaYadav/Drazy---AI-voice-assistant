import type { Message } from '../models/message';
import './ChatBubble.css';

interface Props {
  message: Message;
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

export default function ChatBubble({ message }: Props) {
  return (
    <div className={`chat-bubble-row ${message.isUser ? 'user' : 'ai'}`}>
      {!message.isUser && (
        <div className="chat-avatar ai-avatar">
          <span className="material-icon">psychology</span>
        </div>
      )}

      <div className={`chat-bubble-content ${message.isUser ? 'user' : 'ai'}`}>
        <div className={`chat-bubble ${message.isUser ? 'user-bubble' : 'ai-bubble'}`}>
          <p className="bubble-text">{message.text}</p>

          {message.imgUrl && message.imgUrl.trim() !== '' && (
            <div className="bubble-image-wrapper">
              <img
                src={message.imgUrl}
                alt="Generated"
                className="bubble-image"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        <span className="bubble-timestamp">{formatTimestamp(message.timestamp)}</span>
      </div>

      {message.isUser && (
        <div className="chat-avatar user-avatar">
          <span className="material-icon">person</span>
        </div>
      )}
    </div>
  );
}
