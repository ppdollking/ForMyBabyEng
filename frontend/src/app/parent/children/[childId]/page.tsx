'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { userApi, testApi, vocabApi } from '@/lib/api';

interface Child {
  id: number;
  nickname: string;
  loginId: string;
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

interface VocabList {
  id: number;
  name: string;
  createdAt: string;
}

export default function ChildDetailPage() {
  const { user, loading } = useAuth('parent');
  const params = useParams();
  const childId = Number(params.childId);
  const [child, setChild] = useState<Child | null>(null);
  const [history, setHistory] = useState<TestResult[]>([]);
  const [lists, setLists] = useState<VocabList[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user || Number.isNaN(childId)) return;

    Promise.all([
      userApi.getChild(childId),
      testApi.getChildHistory(childId),
      vocabApi.getChildLists(childId),
    ]).then(([childRes, histRes, listRes]) => {
      setChild(childRes.data?.data ?? null);
      setHistory(histRes.data?.data ?? []);
      setLists(listRes.data?.data ?? []);
      setDataLoading(false);
    });
  }, [user, childId]);

  if (loading || dataLoading) return <LoadingSpinner />;
  if (!child) return <div className="p-8 text-gray-500">아이 정보를 불러올 수 없습니다.</div>;

  const avgScore = history.length > 0 ? Math.round(history.reduce((acc, item) => acc + item.score, 0) / history.length) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{child.nickname}의 학습 현황</h1>
            <p className="text-gray-400 text-sm">@{child.loginId}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/parent/children/${childId}/lists/new`}
              className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 transition text-sm"
            >
              새 단어장 만들기
            </Link>
            <Link
              href={`/parent/children/${childId}/points`}
              className="bg-yellow-400 text-yellow-900 font-bold px-4 py-2 rounded-xl hover:bg-yellow-500 transition text-sm"
            >
              포인트 관리
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-yellow-500">{child.points}pt</p>
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

        <section className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">단어장</h2>
              <p className="text-sm text-gray-400">아이를 선택한 상태에서 단어장을 만들고 단어를 등록할 수 있습니다.</p>
            </div>
            <span className="text-sm text-gray-400">{lists.length}개</span>
          </div>

          {lists.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p>아직 단어장이 없습니다.</p>
              <Link href={`/parent/children/${childId}/lists/new`} className="text-indigo-600 font-semibold hover:underline mt-2 inline-block">
                첫 단어장 만들기
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {lists.map((list) => (
                <Link
                  key={list.id}
                  href={`/parent/children/${childId}/lists/${list.id}`}
                  className="border border-gray-100 rounded-xl p-4 hover:border-indigo-200 hover:bg-indigo-50/50 transition"
                >
                  <p className="font-semibold text-gray-800">{list.name}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    생성일 {new Date(list.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                  <p className="text-sm text-indigo-600 font-medium mt-3">단어 등록하기</p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-700 mb-3">시험 기록</h2>
          {history.length === 0 ? (
            <p className="text-gray-400 text-center py-10">아직 시험 기록이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {history.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow p-4 flex items-center justify-between border border-gray-100"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{result.list?.name ?? '단어장'}</p>
                    <p className="text-gray-400 text-sm">
                      {result.testType === 'blank' ? '빈칸 채우기' : '뜻-단어'} · {result.correctCount}/{result.totalQuestions} 정답
                    </p>
                    <p className="text-gray-300 text-xs">{new Date(result.createdAt).toLocaleDateString('ko-KR')}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-extrabold ${result.score >= 80 ? 'text-green-600' : 'text-gray-400'}`}>
                      {result.score}점
                    </p>
                    {result.pointsEarned > 0 && <p className="text-yellow-500 text-xs font-semibold">+{result.pointsEarned}pt</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
