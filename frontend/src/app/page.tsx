'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { authApi } from '@/lib/api';
import { setAuth, getUser } from '@/lib/auth';

type Tab = 'parent' | 'child';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('parent');
  const [email, setEmail] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (user) {
      router.replace(user.role === 'parent' ? '/parent/dashboard' : '/child/home');
    }
  }, []);

  const switchTab = (next: Tab) => {
    setTab(next);
    setError('');
    setEmail('');
    setLoginId('');
    setPassword('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let res;
      if (tab === 'parent') {
        res = await authApi.login({ Email: email, Password: password });
      } else {
        res = await authApi.loginChild({ LoginId: loginId, Password: password });
      }
      const { statusCode, data, statusMsg } = res.data;
      if (statusCode !== 200) {
        setError(statusMsg);
        return;
      }
      setAuth(data.token, { id: data.id, nickname: data.nickname, role: data.role });
      router.replace(data.role === 'parent' ? '/parent/dashboard' : '/child/home');
    } catch {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4"
      >
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">📚</div>
          <h1 className="text-3xl font-extrabold text-indigo-600">WordMaster</h1>
          <p className="text-gray-400 mt-1">영어 단어 학습 플랫폼</p>
        </div>

        {/* 탭 */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-6">
          <button
            onClick={() => switchTab('parent')}
            className={`flex-1 py-2.5 text-sm font-semibold transition ${
              tab === 'parent' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            👨‍👩‍👧 부모
          </button>
          <button
            onClick={() => switchTab('child')}
            className={`flex-1 py-2.5 text-sm font-semibold transition ${
              tab === 'child' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            🧒 아이
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {tab === 'parent' ? (
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          ) : (
            <input
              type="text"
              placeholder="아이디"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          )}
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {tab === 'parent' && (
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">부모 계정이 없으신가요?</p>
            <a href="/register" className="text-indigo-600 font-semibold hover:underline text-sm">
              부모 계정 만들기
            </a>
          </div>
        )}
      </motion.div>
    </div>
  );
}
