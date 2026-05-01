import { useEffect, useRef } from 'react';
import './WelcomeScreen.css';

interface Props {
  onGetStarted: () => void;
}

export default function WelcomeScreen({ onGetStarted }: Props) {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;

    const particles = container.querySelectorAll<HTMLDivElement>('.particle');
    let animFrame: number;
    let angle = 0;

    function animate() {
      angle += 0.005;
      particles.forEach((p, i) => {
        const a = angle + (i * 2 * Math.PI) / particles.length;
        const radius = 100 + (i % 3) * 50;
        const x = Math.cos(a) * radius;
        const y = Math.sin(a) * radius;
        p.style.transform = `translate(${x}px, ${y}px)`;
      });
      animFrame = requestAnimationFrame(animate);
    }

    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  return (
    <div className="welcome-screen">
      {/* Floating particles */}
      <div className="particles-container" ref={particlesRef}>
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              width: `${4 + (i % 3) * 2}px`,
              height: `${4 + (i % 3) * 2}px`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="welcome-content animate-in">
        {/* Animated microphone */}
        <div className="mic-container">
          <div className="mic-outer-ring rotating" />
          <div className="mic-pulse-ring pulsing" />
          <div className="mic-circle">
            <div className="mic-highlight" />
            <span className="material-icon mic-icon">mic</span>
          </div>
        </div>

        {/* Title section */}
        <div className="title-section">
          <h1 className="title-main">VOICE AI</h1>
          <h2 className="title-sub">ASSISTANT</h2>
          <p className="title-desc">
            Experience the future of voice interaction
            <br />
            with advanced AI technology
          </p>
        </div>

        {/* Get started button */}
        <button className="get-started-btn" onClick={onGetStarted}>
          GET STARTED
          <span className="material-icon btn-arrow">arrow_forward_ios</span>
        </button>
      </div>
    </div>
  );
}
