import './HistoryMenu.css';

interface Props {
  onClose: () => void;
}

const historyItems = [
  "What's the weather like today?",
  'Tell me a joke',
  'How do I cook pasta?',
  'What time is it?',
  'Play some music',
  'Set a reminder',
  "What's my schedule?",
  'Tell me about AI',
];

export default function HistoryMenu({ onClose }: Props) {
  return (
    <div className="history-menu">
      <div className="history-header">
        <span className="history-title">Conversation History</span>
        <button className="history-close" onClick={onClose}>
          <span className="material-icon">close</span>
        </button>
      </div>

      <div className="history-list-wrapper">
        <ul className="history-list">
          {historyItems.map((item, index) => (
            <li key={index} className="history-item" onClick={onClose}>
              <div className="history-item-icon">
                <span className="material-icon">history</span>
              </div>
              <div className="history-item-text">
                <span className="history-item-title">{item}</span>
                <span className="history-item-time">{index + 1} hours ago</span>
              </div>
              <span className="material-icon history-item-arrow">arrow_forward_ios</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="history-footer">
        <button className="history-clear-btn">
          <span className="material-icon">delete_outline</span>
          Clear All History
        </button>
      </div>
    </div>
  );
}
