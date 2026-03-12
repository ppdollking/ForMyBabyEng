'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { userApi } from '@/lib/api';

export default function CreateChildPage() {
  const { loading } = useAuth('parent');
  const router = useRouter();
  const [form, setForm] = useState({ nickname: '', loginId: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await userApi.createChild({ LoginId: form.loginId, Password: form.password, Nickname: form.nickname });
      const { statusCode, statusMsg } = res.data;
      if (statusCode !== 200) {
        setError(statusMsg);
        return;
      }
      router.replace('/parent/dashboard');
    } catch {
      setError('아이 계정 생성 중 오류가 발생했습니다.');
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
          <h1 className="text-2xl font-bold text-gray-800 mb-6">아이 계정 만들기</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">이름 (닉네임)</label>
              <input
                type="text"
                placeholder="아이 이름"
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">아이디</label>
              <input
                type="text"
                placeholder="로그인에 사용할 아이디"
                value={form.loginId}
                onChange={(e) => setForm({ ...form, loginId: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">비밀번호 (4자 이상)</label>
              <input
                type="password"
                placeholder="비밀번호"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition"
            >
              {submitting ? '생성 중...' : '계정 만들기'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full py-3 text-gray-500 hover:text-gray-700 transition text-sm"
            >
              취소
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
