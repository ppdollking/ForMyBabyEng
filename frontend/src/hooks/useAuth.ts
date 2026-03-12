'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, getToken, clearAuth, UserInfo } from '@/lib/auth';

export function useAuth(requiredRole?: 'parent' | 'child') {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    const userInfo = getUser();
    if (!token || !userInfo) {
      router.replace('/');
      return;
    }
    if (requiredRole && userInfo.role !== requiredRole) {
      // 역할이 맞지 않으면 해당 역할의 홈으로 리다이렉트
      router.replace(userInfo.role === 'parent' ? '/parent/dashboard' : '/child/home');
      return;
    }
    setUser(userInfo);
    setLoading(false);
  }, []);

  const logout = () => {
    clearAuth();
    router.replace('/');
  };

  return { user, loading, logout };
}
