'use client';
import { useCallback, useRef } from 'react';

export function useSpeech() {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // 브라우저 내장 Web Speech API로 영어 단어 읽기
  const speak = useCallback((text: string, audioUrl?: string | null) => {
    // 오디오 URL이 있으면 Audio 엘리먼트로 재생 우선
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(() => {
        // 오디오 재생 실패 시 Web Speech API fallback
        speakWithSynthesis(text);
      });
      return;
    }
    speakWithSynthesis(text);
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
    }
  }, []);

  function speakWithSynthesis(text: string) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }

  return { speak, stop };
}
