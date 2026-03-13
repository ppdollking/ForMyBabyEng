'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { userApi, testApi } from '@/lib/api';

interface Child {
  id: number;
  nickname: string;
  loginId: string;
  points: number;
}

export default function ParentDashboardPage() {
  const { user, loading } = useAuth('parent');
  const [children, setChildren] = useState<Child[]>([]);
  const [childStats, setChildStats] = useState<Record<number, { recentScore: number | null; totalTests: number }>>({});

  useEffect(() => {
    if (!user) return;
    userApi.getChildren().then(async (res) => {
      const list: Child[] = res.data?.data ?? [];
      setChildren(list);

      // 각 자녀의 최근 시험 점수 로드
      const stats: Record<number, { recentScore: number | null; totalTests: number }> = {};
      await Promise.all(
        list.map(async (child) => {
          try {
            const histRes = await testApi.getChildHistory(child.id);
            const history = histRes.data?.data ?? [];
            stats[child.id] = {
              recentScore: history[0]?.score ?? null,
              totalTests: history.length,
            };
          } catch {
            stats[child.id] = { recentScore: null, totalTests: 0 };
          }
        }),
      );
      setChildStats(stats);
    });
  }, [user]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">대시보드</h1>
          <Link
            href="/parent/children/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition font-semibold text-sm"
          >
            + 아이 계정 추가
          </Link>
        </div>

        {children.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">👶</div>
            <p>아직 등록된 아이 계정이 없습니다.</p>
            <Link href="/parent/children/new" className="text-indigo-600 font-semibold hover:underline mt-2 inline-block">
              첫 번째 아이 계정 만들기
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {children.map((child, i) => {
              const stats = childStats[child.id];
              return (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl shadow p-6 border border-gray-100"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{child.nickname}</h2>
                      <p className="text-gray-400 text-sm">@{child.loginId}</p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-700 font-bold px-3 py-1 rounded-full text-sm">
                      ⭐ {child.points}점
                    </span>
                  </div>

                  {stats && (
                    <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                      <div className="bg-indigo-50 rounded-xl p-3">
                        <p className="text-2xl font-bold text-indigo-600">
                          {stats.recentScore !== null ? `${stats.recentScore}점` : '-'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">최근 시험 점수</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-3">
                        <p className="text-2xl font-bold text-green-600">{stats.totalTests}</p>
                        <p className="text-xs text-gray-500 mt-1">총 시험 횟수</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/parent/children/${child.id}`}
                      className="flex-1 text-center py-2 border border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 transition text-sm font-semibold"
                    >
                      학습 상세
                    </Link>
                    <Link
                      href={`/parent/children/${child.id}/points`}
                      className="flex-1 text-center py-2 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition text-sm font-semibold"
                    >
                      포인트 관리
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
