'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { userApi, testApi } from '@/lib/api';

interface Child {
  id: number;
  nickname: string;
  email: string;
  points: number;
}

interface TestResult {
  id: number;
  score: number;
  testType: string;
  correctCount: number;
  totalQuestions: number;
  pointsEarned: number;
  createdAt: string;
  list: { name: string };
}

export default function ChildDetailPage() {
  const { user, loading } = useAuth('parent');
  const params = useParams();
  const childId = Number(params.childId);
  const [child, setChild] = useState<Child | null>(null);
  const [history, setHistory] = useState<TestResult[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([userApi.getChild(childId), testApi.getChildHistory(childId)]).then(([childRes, histRes]) => {
      setChild(childRes.data?.data ?? null);
      setHistory(histRes.data?.data ?? []);
      setDataLoading(false);
    });
  }, [user, childId]);

  if (loading || dataLoading) return <LoadingSpinner />;
  if (!child) return <div className="p-8 text-gray-500">아이 정보를 불러올 수 없습니다.</div>;

  const avgScore = history.length > 0 ? Math.round(history.reduce((acc, r) => acc + r.score, 0) / history.length) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{child.nickname}의 학습 현황</h1>
            <p className="text-gray-400 text-sm">{child.email}</p>
          </div>
          <Link
            href={`/parent/children/${childId}/points`}
            className="bg-yellow-400 text-yellow-900 font-bold px-4 py-2 rounded-xl hover:bg-yellow-500 transition text-sm"
          >
            ⭐ 포인트 관리
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-yellow-500">⭐ {child.points}</p>
            <p className="text-gray-500 text-sm mt-1">보유 포인트</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-indigo-600">{history.length}</p>
            <p className="text-gray-500 text-sm mt-1">총 시험 횟수</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{avgScore !== null ? `${avgScore}점` : '-'}</p>
            <p className="text-gray-500 text-sm mt-1">평균 점수</p>
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-700 mb-3">시험 기록</h2>
        {history.length === 0 ? (
          <p className="text-gray-400 text-center py-10">아직 시험 기록이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {history.map((result, i) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl shadow p-4 flex items-center justify-between border border-gray-100"
              >
                <div>
                  <p className="font-semibold text-gray-800">{result.list?.name ?? '단어장'}</p>
                  <p className="text-gray-400 text-sm">
                    {result.testType === 'blank' ? '빈칸 채우기' : '뜻↔단어'} ·{' '}
                    {result.correctCount}/{result.totalQuestions}개 정답
                  </p>
                  <p className="text-gray-300 text-xs">{new Date(result.createdAt).toLocaleDateString('ko-KR')}</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-extrabold ${result.score >= 80 ? 'text-green-600' : 'text-gray-400'}`}>
                    {result.score}점
                  </p>
                  {result.pointsEarned > 0 && (
                    <p className="text-yellow-500 text-xs font-semibold">+{result.pointsEarned}pt</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
