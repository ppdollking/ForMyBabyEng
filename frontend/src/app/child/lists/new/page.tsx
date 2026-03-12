'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { vocabApi } from '@/lib/api';

export default function NewListPage() {
  const { user, loading } = useAuth('child');
  const router = useRouter();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const res = await vocabApi.createList({ Name: name.trim() });
      const { statusCode, statusMsg } = res.data;
      if (statusCode !== 200) {
        setError(statusMsg);
        return;
      }
      router.replace('/child/home');
    } catch {
      setError('단어장 생성 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow p-8"
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-6">새 단어장 만들기</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="단어장 이름 (예: 5학년 영어, 동물 단어)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition"
            >
              {submitting ? '생성 중...' : '만들기'}
            </button>
            <button type="button" onClick={() => router.back()} className="w-full py-3 text-gray-400 hover:text-gray-600 transition text-sm">
              취소
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
