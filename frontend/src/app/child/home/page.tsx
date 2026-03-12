'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { vocabApi } from '@/lib/api';

interface VocabList {
  id: number;
  name: string;
  createdAt: string;
}

export default function ChildHomePage() {
  const { user, loading } = useAuth('child');
  const [lists, setLists] = useState<VocabList[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    vocabApi.getLists().then((res) => {
      setLists(res.data?.data ?? []);
      setDataLoading(false);
    });
  }, [user]);

  if (loading || dataLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">안녕하세요, {user?.nickname}님! 👋</h1>
            <p className="text-gray-400 text-sm mt-1">내 단어장 목록</p>
          </div>
          <Link
            href="/child/lists/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition font-semibold text-sm"
          >
            + 새 단어장
          </Link>
        </div>

        {lists.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-4">📖</div>
            <p className="text-lg">아직 단어장이 없어요!</p>
            <Link href="/child/lists/new" className="text-indigo-600 font-semibold hover:underline mt-2 inline-block">
              첫 번째 단어장 만들기
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {lists.map((list, i) => (
              <motion.div
                key={list.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl shadow border border-gray-100 p-6"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-4">{list.name}</h2>
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/child/lists/${list.id}`}
                    className="w-full text-center py-2 border border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 transition text-sm font-semibold"
                  >
                    📝 단어 보기 / 추가
                  </Link>
                  <Link
                    href={`/child/lists/${list.id}/study`}
                    className="w-full text-center py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition text-sm font-semibold"
                  >
                    🔊 학습하기
                  </Link>
                  <Link
                    href={`/child/lists/${list.id}/test`}
                    className="w-full text-center py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-semibold"
                  >
                    ✏️ 시험 보기
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
