'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { userApi } from '@/lib/api';

interface Child {
  id: number;
  nickname: string;
  points: number;
}

export default function PointsManagePage() {
  const { user, loading } = useAuth('parent');
  const params = useParams();
  const router = useRouter();
  const childId = Number(params.childId);
  const [child, setChild] = useState<Child | null>(null);
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!user) return;
    userApi.getChild(childId).then((res) => setChild(res.data?.data ?? null));
  }, [user, childId]);

  const handleAdjust = async (type: 'add' | 'deduct') => {
    const amount = parseInt(delta);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ text: '올바른 숫자를 입력해주세요.', type: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await userApi.adjustPoints(childId, { Delta: type === 'add' ? amount : -amount, Reason: reason });
      const { statusCode, data, statusMsg } = res.data;
      if (statusCode !== 200) {
        setMessage({ text: statusMsg, type: 'error' });
        return;
      }
      setChild((prev) => prev ? { ...prev, points: data.points } : null);
      setMessage({ text: `포인트가 ${type === 'add' ? '지급' : '차감'}되었습니다.`, type: 'success' });
      setDelta('');
      setReason('');
    } catch {
      setMessage({ text: '처리 중 오류가 발생했습니다.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!child) return <div className="p-8 text-gray-500">아이 정보를 불러올 수 없습니다.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">포인트 관리</h1>
          <p className="text-gray-400 mb-6">{child.nickname}</p>

          <div className="bg-yellow-50 rounded-xl p-6 text-center mb-6">
            <motion.p
              key={child.points}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="text-5xl font-extrabold text-yellow-500"
            >
              ⭐ {child.points}
            </motion.p>
            <p className="text-gray-500 text-sm mt-1">현재 보유 포인트</p>
          </div>

          <div className="space-y-4">
            <input
              type="number"
              placeholder="포인트 수량"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              min="1"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <input
              type="text"
              placeholder="사유 (선택)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <AnimatePresence>
              {message && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`text-sm text-center font-semibold ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}
                >
                  {message.text}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAdjust('add')}
                disabled={submitting}
                className="py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 disabled:opacity-60 transition"
              >
                + 지급
              </button>
              <button
                onClick={() => handleAdjust('deduct')}
                disabled={submitting}
                className="py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 disabled:opacity-60 transition"
              >
                - 차감
              </button>
            </div>

            <button onClick={() => router.back()} className="w-full py-3 text-gray-400 hover:text-gray-600 transition text-sm">
              돌아가기
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
