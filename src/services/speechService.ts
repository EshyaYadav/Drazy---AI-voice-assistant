/* Speech-to-Text via Web Speech API */

export interface SpeechRecognitionType extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionType;
    webkitSpeechRecognition: new () => SpeechRecognitionType;
  }
}

export function startListening(
  onResult: (text: string) => void,
  onEnd: () => void,
): SpeechRecognitionType | null {
  const SpeechRecognitionCtor =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognitionCtor) {
    console.warn('Speech recognition not supported in this browser.');
    onEnd();
    return null;
  }

  const recognition = new SpeechRecognitionCtor();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const text = event.results[0][0].transcript;
    onResult(text);
  };

  recognition.onerror = () => {
    onEnd();
  };

  recognition.onend = () => {
    onEnd();
  };

  recognition.start();
  return recognition;
}

/* Text-to-Speech via Web Speech Synthesis API */
let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speak(text: string): void {
  if (!text.trim()) return;
  if (currentUtterance) {
    window.speechSynthesis.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Try to pick a female voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    (v) =>
      v.lang.startsWith('en') &&
      (v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('zira') ||
        v.name.toLowerCase().includes('samantha')),
  );
  if (preferred) {
    utterance.voice = preferred;
  }

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  window.speechSynthesis.cancel();
  currentUtterance = null;
}
