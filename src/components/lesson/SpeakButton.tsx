'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

const noSubscribe = () => () => undefined;
const canSpeakNow = () => 'speechSynthesis' in globalThis;
const canSpeakOnServer = () => false;

interface SpeakButtonProps {
  readonly text: string;
  readonly label: string;
}

/** Reads text out loud with the browser's own voice (South African English where available). */
export function SpeakButton({ text, label }: SpeakButtonProps) {
  const canSpeak = useSyncExternalStore(noSubscribe, canSpeakNow, canSpeakOnServer);
  const [isSpeaking, setSpeaking] = useState(false);
  useEffect(() => () => globalThis.speechSynthesis?.cancel(), []);
  if (!canSpeak) {
    return null;
  }
  const toggle = () => {
    const speech = globalThis.speechSynthesis;
    speech.cancel();
    if (isSpeaking) {
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-ZA';
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    speech.speak(utterance);
    setSpeaking(true);
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isSpeaking}
      className="rounded-full bg-jacaranda-500 px-4 py-1.5 text-sm font-bold text-white"
    >
      {isSpeaking ? '■ Stop' : label}
    </button>
  );
}
