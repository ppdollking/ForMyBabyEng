'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import WordCard from '@/components/WordCard';
import { vocabApi, dictApi } from '@/lib/api';

interface Word {
  id: number;
  english: string;
  meaning: string;
  phonetic?: string;
  audioUrl?: string;
}

interface VocabList {
  id: number;
  name: string;
  words: Word[];
}

export default function ListDetailPage() {
  const { user, loading } = useAuth('child');
  const params = useParams();
  const router = useRouter();
  const listId = Number(params.listId);

  const [list, setList] = useState<VocabList | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // 단어 추가 폼 상태
  const [english, setEnglish] = useState('');
  const [meaning, setMeaning] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchList = useCallback(() => {
    vocabApi.getList(listId).then((res) => {
      setList(res.data?.data ?? null);
      setDataLoading(false);
    });
  }, [listId]);

  useEffect(() => {
    if (!user) return;
    fetchList();
  }, [user, fetchList]);

  // 영어 단어 입력 시 Dictionary API로 뜻/발음 자동완성
  const handleEnglishBlur = async () => {
    if (!english.trim() || meaning) return;
    setLookingUp(true);
    try {
      const res = await dictApi.lookup(english.trim());
      const dict = res.data;
      if (dict && dict.meanings?.length > 0) {
        const firstDef = dict.meanings[0].definitions[0] ?? '';
        // 자동 완성된 뜻과 발음 정보를 채워줌
        if (!meaning) setMeaning(firstDef);
        if (dict.phonetic) setPhonetic(dict.phonetic);
        if (dict.audioUrl) setAudioUrl(dict.audioUrl);
      }
    } catch {
      // 자동완성 실패는 조용히 처리 (수동 입력으로 진행)
    } finally {
      setLookingUp(false);
    }
  };

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!english.trim() || !meaning.trim()) return;
    setAdding(true);
    setAddError('');
    try {
      const res = await vocabApi.addWord(listId, {
        English: english.trim(),
        Meaning: meaning.trim(),
        AudioUrl: audioUrl || undefined,
        Phonetic: phonetic || undefined,
      });
      if (res.data?.statusCode !== 200) {
        setAddError(res.data?.statusMsg);
        return;
      }
      setEnglish('');
      setMeaning('');
      setAudioUrl('');
      setPhonetic('');
      fetchList();
    } catch {
      setAddError('단어 추가 중 오류가 발생했습니다.');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteWord = async (wordId: number) => {
    if (!confirm('이 단어를 삭제하시겠습니까?')) return;
    await vocabApi.deleteWord(listId, wordId);
    fetchList();
  };

  if (loading || dataLoading) return <LoadingSpinner />;
  if (!list) return <div className="p-8 text-gray-500">단어장을 찾을 수 없습니다.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-xl">←</button>
          <h1 className="text-2xl font-bold text-gray-800">{list.name}</h1>
          <span className="text-gray-400 text-sm ml-auto">{list.words.length}개 단어</span>
        </div>

        {/* 단어 추가 폼 */}
        <form onSubmit={handleAddWord} className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="font-bold text-gray-700 mb-4">단어 추가</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="영어 단어"
                value={english}
                onChange={(e) => setEnglish(e.target.value)}
                onBlur={handleEnglishBlur}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              {lookingUp && (
                <span className="absolute right-3 top-3 text-xs text-indigo-400">조회중...</span>
              )}
            </div>
            <input
              type="text"
              placeholder={lookingUp ? '뜻 자동완성 중...' : '뜻 (직접 입력 가능)'}
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          {phonetic && (
            <p className="text-xs text-indigo-400 mt-1">발음: {phonetic}</p>
          )}
          {addError && <p className="text-red-500 text-sm mt-2">{addError}</p>}
          <button
            type="submit"
            disabled={adding || !english.trim() || !meaning.trim()}
            className="mt-4 w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition"
          >
            {adding ? '추가 중...' : '단어 추가'}
          </button>
        </form>

        {/* 단어 목록 */}
        <div className="space-y-3">
          <AnimatePresence>
            {list.words.map((word, i) => (
              <div key={word.id} className="relative">
                <WordCard word={word} index={i} />
                <button
                  onClick={() => handleDeleteWord(word.id)}
                  className="absolute top-3 right-14 text-gray-300 hover:text-red-400 transition text-lg"
                  title="삭제"
                >
                  🗑️
                </button>
              </div>
            ))}
          </AnimatePresence>
          {list.words.length === 0 && (
            <p className="text-center text-gray-400 py-10">아직 단어가 없습니다. 위에서 추가해보세요!</p>
          )}
        </div>
      </div>
    </div>
  );
}
