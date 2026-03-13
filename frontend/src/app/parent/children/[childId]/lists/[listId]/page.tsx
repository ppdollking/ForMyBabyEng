'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import WordCard from '@/components/WordCard';
import { dictApi, userApi, vocabApi } from '@/lib/api';

interface Child {
  id: number;
  nickname: string;
}

interface Word {
  id: number;
  english: string;
  meaning: string;
  phonetic?: string;
  audioUrl?: string;
  registrationCount?: number;
}

interface VocabList {
  id: number;
  name: string;
  words: Word[];
}

export default function ParentListDetailPage() {
  const { user, loading } = useAuth('parent');
  const params = useParams();
  const router = useRouter();
  const childId = Number(params.childId);
  const listId = Number(params.listId);

  const [child, setChild] = useState<Child | null>(null);
  const [list, setList] = useState<VocabList | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [english, setEnglish] = useState('');
  const [meaning, setMeaning] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const fetchList = useCallback(async () => {
    const [childRes, listRes] = await Promise.all([userApi.getChild(childId), vocabApi.getChildList(childId, listId)]);
    setChild(childRes.data?.data ?? null);
    setList(listRes.data?.data ?? null);
    setDataLoading(false);
  }, [childId, listId]);

  useEffect(() => {
    if (!user || Number.isNaN(childId) || Number.isNaN(listId)) return;
    fetchList();
  }, [user, childId, listId, fetchList]);

  const handleEnglishBlur = async () => {
    if (!english.trim() || meaning.trim()) return;

    setLookingUp(true);
    try {
      const res = await dictApi.lookup(english.trim());
      const dict = res.data;
      if (dict && dict.meanings?.length > 0) {
        const firstDef = dict.meanings[0].definitions[0] ?? '';
        if (!meaning) setMeaning(firstDef);
        if (dict.phonetic) setPhonetic(dict.phonetic);
        if (dict.audioUrl) setAudioUrl(dict.audioUrl);
      }
    } finally {
      setLookingUp(false);
    }
  };

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!english.trim() || !meaning.trim()) return;

    setAdding(true);
    setError('');

    try {
      const res = await vocabApi.addChildWord(childId, listId, {
        English: english.trim(),
        Meaning: meaning.trim(),
        AudioUrl: audioUrl || undefined,
        Phonetic: phonetic || undefined,
      });

      if (res.data?.statusCode !== 200) {
        setError(res.data?.statusMsg ?? '단어 등록에 실패했습니다.');
        return;
      }

      setEnglish('');
      setMeaning('');
      setAudioUrl('');
      setPhonetic('');
      await fetchList();
    } catch {
      setError('단어 등록 중 오류가 발생했습니다.');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteWord = async (wordId: number) => {
    if (!confirm('이 단어를 삭제하시겠습니까?')) return;
    await vocabApi.deleteChildWord(childId, listId, wordId);
    await fetchList();
  };

  if (loading || dataLoading) return <LoadingSpinner />;
  if (!list) return <div className="p-8 text-gray-500">단어장을 찾을 수 없습니다.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push(`/parent/children/${childId}`)} className="text-gray-400 hover:text-gray-600 text-xl">
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{list.name}</h1>
            <p className="text-sm text-gray-400">{child?.nickname ?? '아이'} 계정에 연결된 단어장</p>
          </div>
          <span className="text-gray-400 text-sm ml-auto">{list.words.length}개 단어</span>
        </div>

        <form onSubmit={handleAddWord} className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="font-bold text-gray-700 mb-4">단어 등록</h2>
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
              {lookingUp && <span className="absolute right-3 top-3 text-xs text-indigo-400">조회 중...</span>}
            </div>
            <input
              type="text"
              placeholder={lookingUp ? '뜻을 조회 중입니다...' : '뜻'}
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          {phonetic && <p className="text-xs text-indigo-400 mt-2">발음 기호: {phonetic}</p>}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <button
            type="submit"
            disabled={adding || !english.trim() || !meaning.trim()}
            className="mt-4 w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition"
          >
            {adding ? '등록 중...' : '단어 등록'}
          </button>
        </form>

        <div className="space-y-3">
          <AnimatePresence>
            {list.words.map((word, index) => (
              <div key={word.id} className="relative">
                <WordCard word={word} index={index} />
                <button
                  onClick={() => handleDeleteWord(word.id)}
                  className="absolute top-3 right-14 text-gray-300 hover:text-red-400 transition text-lg"
                  title="삭제"
                >
                  ×
                </button>
              </div>
            ))}
          </AnimatePresence>
          {list.words.length === 0 && <p className="text-center text-gray-400 py-10">아직 등록된 단어가 없습니다.</p>}
        </div>
      </div>
    </div>
  );
}
