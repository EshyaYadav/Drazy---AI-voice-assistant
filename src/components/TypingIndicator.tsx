import { useEffect, useRef } from 'react';
import './TypingIndicator.css';

export default function TypingIndicator() {
  const dot1 = useRef<HTMLDivElement>(null);
  const dot2 = useRef<HTMLDivElement>(null);
  const dot3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dots = [dot1.current, dot2.current, dot3.current];
    const timers: ReturnType<typeof setTimeout>[] = [];

    function animateDot(el: HTMLDivElement | null, delay: number) {
      if (!el) return;
      const t = setTimeout(() => {
        el.style.opacity = '1';
        setTimeout(() => {
          el.style.opacity = '0.3';
        }, 400);
      }, delay);
      timers.push(t);
    }

    let cycle = 0;
    const interval = setInterval(() => {
      dots.forEach((dot, i) => {
        animateDot(dot, i * 200);
      });
      cycle++;
    }, 1400);

    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="typing-indicator">
      <div className="typing-avatar">
        <span className="material-icon">psychology</span>
      </div>
      <div className="typing-bubble">
        <div ref={dot1} className="typing-dot" />
        <div ref={dot2} className="typing-dot" />
        <div ref={dot3} className="typing-dot" />
      </div>
    </div>
  );
}
