'use client';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="bg-indigo-600 text-white px-6 py-3 flex items-center justify-between shadow">
      <Link
        href={user.role === 'parent' ? '/parent/dashboard' : '/child/home'}
        className="text-xl font-bold tracking-tight"
      >
        📚 WordMaster
      </Link>
      <div className="flex items-center gap-4">
        {user.role === 'child' && (
          <span className="bg-yellow-400 text-yellow-900 font-bold px-3 py-1 rounded-full text-sm">
            ⭐ {user.points ?? 0}점
          </span>
        )}
        <span className="text-sm opacity-80">{user.nickname}</span>
        <button onClick={logout} className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition">
          로그아웃
        </button>
      </div>
    </nav>
  );
}
