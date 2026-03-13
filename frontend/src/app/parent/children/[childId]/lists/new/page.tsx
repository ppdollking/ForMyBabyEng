'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { vocabApi } from '@/lib/api';

export default function ParentNewListPage() {
  const { user, loading } = useAuth('parent');
  const params = useParams();
  const router = useRouter();
  const childId = Number(params.childId);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || Number.isNaN(childId)) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await vocabApi.createChildList(childId, { Name: name.trim() });
      if (res.data?.statusCode !== 200) {
        setError(res.data?.statusMsg ?? '단어장 생성에 실패했습니다.');
        return;
      }

      const listId = res.data?.data?.id;
      router.replace(listId ? `/parent/children/${childId}/lists/${listId}` : `/parent/children/${childId}`);
    } catch {
      setError('단어장 생성 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">부모가 만드는 새 단어장</h1>
          <p className="text-sm text-gray-400 mb-6">선택한 아이 계정에 바로 연결됩니다.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="단어장 이름"
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
              {submitting ? '생성 중...' : '단어장 만들기'}
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
