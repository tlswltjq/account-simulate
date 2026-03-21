'use client';

import { api } from '@/shared/api/axios';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken }).catch(console.error);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="text-sm font-bold text-gray-400 hover:text-gray-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50"
    >
      로그아웃
    </button>
  );
}
