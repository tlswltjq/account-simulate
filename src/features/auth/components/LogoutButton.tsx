'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      router.push('/login');
      router.refresh(); // 미들웨어 상태 및 캐시 갱신
    } catch (error) {
      console.error('Logout failed:', error);
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
