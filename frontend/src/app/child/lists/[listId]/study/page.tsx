'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useSpeech } from '@/hooks/useSpeech';
import { vocabApi } from '@/lib/api';

interface Word {
  id: number;
  english: string;
  meaning: string;
  phonetic?: string;
  audioUrl?: string;
}

export default function StudyPage() {
  const { user, loading } = useAuth('child');
  const params = useParams();
  const router = useRouter();
  const listId = Number(params.listId);
  const { speak } = useSpeech();

  const [words, setWords] = useState<Word[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [listName, setListName] = useState('');

  useEffect(() => {
    if (!user) return;
    vocabApi.getList(listId).then((res) => {
      const data = res.data?.data;
      setListName(data?.name ?? '');
      setWords(data?.words ?? []);
      setDataLoading(false);
    });
  }, [user, listId]);

  // 카드 표시 시 자동 발음
  useEffect(() => {
    if (words.length > 0 && !flipped) {
      speak(words[currentIdx].english, words[currentIdx].audioUrl);
    }
  }, [currentIdx, flipped]);

  const handlePrev = () => {
    setFlipped(false);
    setCurrentIdx((prev) => (prev - 1 + words.length) % words.length);
  };

  const handleNext = () => {
    setFlipped(false);
    setCurrentIdx((prev) => (prev + 1) % words.length);
  };

  if (loading || dataLoading) return <LoadingSpinner />;
  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-gray-400">
          <p>단어장에 단어가 없습니다.</p>
          <button onClick={() => router.back()} className="mt-4 text-indigo-600 hover:underline">돌아가기</button>
        </div>
      </div>
    );
  }

  const word = words[currentIdx];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-xl">←</button>
          <h1 className="text-xl font-bold text-gray-800">{listName} 학습</h1>
          <span className="ml-auto text-gray-400 text-sm">{currentIdx + 1} / {words.length}</span>
        </div>

        {/* 플래시 카드 */}
        <div
          className="cursor-pointer select-none"
          onClick={() => setFlipped(!flipped)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentIdx}-${flipped}`}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`bg-white rounded-3xl shadow-xl p-10 text-center min-h-[260px] flex flex-col items-center justify-center border-2 ${
                flipped ? 'border-indigo-300 bg-indigo-50' : 'border-gray-100'
              }`}
            >
              {!flipped ? (
                <>
                  <p className="text-5xl font-extrabold text-gray-800 mb-3">{word.english}</p>
                  {word.phonetic && <p className="text-indigo-400 text-lg">{word.phonetic}</p>}
                  <p className="text-gray-300 text-sm mt-4">클릭하면 뜻이 보여요</p>
                </>
              ) : (
                <>
                  <p className="text-3xl font-bold text-indigo-700 mb-2">{word.meaning}</p>
                  <p className="text-gray-400">{word.english}</p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 컨트롤 버튼 */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <button
            onClick={handlePrev}
            className="w-12 h-12 bg-white rounded-full shadow flex items-center justify-center text-gray-600 hover:bg-gray-100 transition text-xl"
          >
            ◀
          </button>
          <button
            onClick={() => speak(word.english, word.audioUrl)}
            className="w-16 h-16 bg-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-indigo-700 transition text-2xl"
          >
            🔊
          </button>
          <button
            onClick={handleNext}
            className="w-12 h-12 bg-white rounded-full shadow flex items-center justify-center text-gray-600 hover:bg-gray-100 transition text-xl"
          >
            ▶
          </button>
        </div>

        {/* 진행 바 */}
        <div className="mt-6 bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-indigo-500 h-2 rounded-full"
            animate={{ width: `${((currentIdx + 1) / words.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}
