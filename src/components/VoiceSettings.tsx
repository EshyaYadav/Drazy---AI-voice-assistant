import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Play } from 'lucide-react';
import type { VoiceConfig, AssistantId } from '../types';
import { ASSISTANTS } from '../lib/assistants';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

interface Props {
  open: boolean;
  assistantId: AssistantId;
  config: VoiceConfig;
  onChange: (config: VoiceConfig) => void;
  onClose: () => void;
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  format,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="text-sm text-white/70">{label}</label>
        <span className="text-xs text-white/40 tabular-nums">
          {format ? format(value) : value.toFixed(1)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-purple-400 cursor-pointer"
      />
    </div>
  );
}

export function VoiceSettings({ open, assistantId, config, onChange, onClose }: Props) {
  const assistant = ASSISTANTS[assistantId];
  const { availableVoices, speak } = useSpeechSynthesis();

  const [local, setLocal] = useState<VoiceConfig>(config);

  useEffect(() => {
    setLocal(config);
  }, [config, open]);

  const update = (patch: Partial<VoiceConfig>) => {
    setLocal((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = () => {
    onChange(local);
    onClose();
  };

  const handlePreview = () => {
    const previewText =
      assistantId === 'drazy'
        ? "Hi! I'm Drazy, your personal mentor. How can I help you today?"
        : "Hello, I'm Samarth. Let's work on something meaningful together.";
    speak(previewText, local);
  };

  const femaleVoices = availableVoices.filter(
    (v) => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('victoria') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('google us english') || v.name.toLowerCase().includes('fiona'),
  );
  const maleVoices = availableVoices.filter(
    (v) => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('man') || v.name.toLowerCase().includes('daniel') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('alex') || v.name.toLowerCase().includes('james') || v.name.toLowerCase().includes('mark'),
  );

  const suggestedVoices = assistant.gender === 'female'
    ? femaleVoices.length > 0 ? femaleVoices : availableVoices.slice(0, 6)
    : maleVoices.length > 0 ? maleVoices : availableVoices.slice(0, 6);

  const allOtherVoices = availableVoices.filter(
    (v) => !suggestedVoices.find((s) => s.voiceURI === v.voiceURI),
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#1e1c24] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/8">
              <div className="flex items-center gap-2">
                <Volume2 size={18} className="text-white/60" />
                <h2 className="text-base font-semibold text-white">Voice Settings</h2>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-5 max-h-[60vh] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
              <div>
                <label className="text-sm text-white/70 block mb-2">
                  Voice for {assistant.name}
                  {suggestedVoices.length > 0 && (
                    <span className="ml-1 text-xs text-white/30">(suggested)</span>
                  )}
                </label>
                <div className="space-y-1.5">
                  {suggestedVoices.slice(0, 5).map((voice) => (
                    <button
                      key={voice.voiceURI}
                      onClick={() => update({ voiceURI: voice.voiceURI, voiceName: voice.name })}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                        local.voiceURI === voice.voiceURI
                          ? 'bg-white/15 text-white'
                          : 'bg-white/4 hover:bg-white/8 text-white/60 hover:text-white'
                      }`}
                    >
                      <span className="font-medium">{voice.name}</span>
                      {voice.lang && (
                        <span className="ml-2 text-xs text-white/30">{voice.lang}</span>
                      )}
                    </button>
                  ))}

                  {allOtherVoices.length > 0 && (
                    <>
                      <p className="text-xs text-white/25 pt-1 pb-0.5">Other voices</p>
                      {allOtherVoices.slice(0, 8).map((voice) => (
                        <button
                          key={voice.voiceURI}
                          onClick={() => update({ voiceURI: voice.voiceURI, voiceName: voice.name })}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                            local.voiceURI === voice.voiceURI
                              ? 'bg-white/15 text-white'
                              : 'bg-white/4 hover:bg-white/8 text-white/60 hover:text-white'
                          }`}
                        >
                          <span className="font-medium">{voice.name}</span>
                          {voice.lang && (
                            <span className="ml-2 text-xs text-white/30">{voice.lang}</span>
                          )}
                        </button>
                      ))}
                    </>
                  )}

                  {availableVoices.length === 0 && (
                    <p className="text-sm text-white/30 py-2">
                      No voices available. Your browser may not support speech synthesis.
                    </p>
                  )}
                </div>
              </div>

              <Slider
                label="Speed"
                min={0.5}
                max={2}
                step={0.1}
                value={local.rate}
                onChange={(v) => update({ rate: v })}
                format={(v) => `${v.toFixed(1)}x`}
              />

              <Slider
                label="Pitch"
                min={0.5}
                max={2}
                step={0.1}
                value={local.pitch}
                onChange={(v) => update({ pitch: v })}
              />

              <Slider
                label="Volume"
                min={0}
                max={1}
                step={0.05}
                value={local.volume}
                onChange={(v) => update({ volume: v })}
                format={(v) => `${Math.round(v * 100)}%`}
              />
            </div>

            <div className="flex items-center gap-2 px-5 py-4 border-t border-white/8">
              <button
                onClick={handlePreview}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/8 hover:bg-white/12 text-white/70 hover:text-white text-sm transition-colors"
              >
                <Play size={14} />
                Preview
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200"
                style={{ background: `${assistant.accentColor}30`, border: `1px solid ${assistant.accentColor}40` }}
              >
                Save Settings
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
