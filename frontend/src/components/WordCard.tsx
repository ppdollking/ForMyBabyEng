'use client';
import { motion } from 'framer-motion';
import { useSpeech } from '@/hooks/useSpeech';

interface Word {
  id: number;
  english: string;
  meaning: string;
  phonetic?: string;
  audioUrl?: string;
  registrationCount?: number;
}

interface Props {
  word: Word;
  index: number;
}

export default function WordCard({ word, index }: Props) {
  const { speak } = useSpeech();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl shadow p-4 flex items-center justify-between border border-gray-100"
    >
      <div>
        <p className="text-lg font-bold text-gray-800">{word.english}</p>
        {word.phonetic && <p className="text-xs text-gray-400">{word.phonetic}</p>}
        <p className="text-gray-500 mt-1">{word.meaning}</p>
        {(word.registrationCount ?? 1) > 1 && (
          <p className="text-xs text-amber-600 mt-2">다른 단어장 포함 총 {word.registrationCount}회 등록</p>
        )}
      </div>
      <button
        onClick={() => speak(word.english, word.audioUrl)}
        className="ml-4 w-10 h-10 flex items-center justify-center rounded-full bg-indigo-50 hover:bg-indigo-100 transition text-indigo-600 text-xl"
        title="발음 듣기"
      >
        🔊
      </button>
    </motion.div>
  );
}
