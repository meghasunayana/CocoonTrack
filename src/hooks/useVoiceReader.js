// src/hooks/useVoiceReader.js
// Web Speech API hook — reads out any text, supports language switching + pause/resume

import { useState, useEffect, useRef, useCallback } from "react";

// Map our app language codes to BCP-47 speech codes
const SPEECH_LANG_MAP = {
  en: "en-IN",
  kn: "kn-IN",
  te: "te-IN",
  ta: "ta-IN",
  hi: "hi-IN",
};

export default function useVoiceReader() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");
  const [supported, setSupported] = useState(true);
  const utteranceRef = useRef(null);
  const keepAliveRef = useRef(null); // FIX 1: interval to prevent Chrome freezing

  useEffect(() => {
    if (!window.speechSynthesis) {
      setSupported(false);
      return;
    }
    // FIX 1: Chrome silently pauses speechSynthesis after ~15s of speaking.
    // Pinging resume() every 10s keeps it alive without affecting audio.
    keepAliveRef.current = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);

    return () => {
      clearInterval(keepAliveRef.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speak = useCallback((text, langOverride = null) => {
    if (!supported) return;

    // FIX 1: Cancel + resume to un-freeze Chrome's synthesis engine
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume(); // clears any stuck state

    const lang = SPEECH_LANG_MAP[langOverride || currentLang] || "en-IN";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart  = () => { setIsPlaying(true);  setIsPaused(false); };
    utterance.onend    = () => { setIsPlaying(false); setIsPaused(false); };
    utterance.onerror  = (e) => {
      // 'interrupted' fires on cancel() — not a real error, ignore it
      if (e.error !== "interrupted") {
        setIsPlaying(false);
        setIsPaused(false);
      }
    };
    utterance.onpause  = () => setIsPaused(true);
    utterance.onresume = () => setIsPaused(false);

    utteranceRef.current = utterance;

    // FIX 1: Small delay so cancel() fully clears before new utterance queues
    setTimeout(() => window.speechSynthesis.speak(utterance), 100);
  }, [currentLang, supported]);

  const pause = useCallback(() => {
    window.speechSynthesis?.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis?.resume();
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  const toggle = useCallback((text) => {
    if (isPlaying && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      speak(text);
    }
  }, [isPlaying, isPaused, pause, resume, speak]);

  return {
    speak,
    pause,
    resume,
    stop,
    toggle,
    isPlaying,
    isPaused,
    supported,
    currentLang,
    setCurrentLang,
  };
}
