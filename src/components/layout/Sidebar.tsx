'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from '@/features/auth/components/LogoutButton';
import { Home, Send, HandCoins, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/axios';

// /members/me 조회를 위한 임시 인터페이스 및 쿼리
// Backend에 맞춰 필드명이 다를 수 있으나 통상적인 스펙 가정
interface MeResponse {
  email: string;
  name: string;
  nickname: string;
}

function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/members/me');
      return data.data as MeResponse;
    },
    staleTime: 1000 * 60 * 5, // 5분 캐싱
    retry: false, // 로그인 안된 상태면 401/403 등 실패시 불필요한 재시도 방지
  });
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: me, isLoading } = useMe();

  // 로그인 페이지나 회원가입 페이지에서는 사이드바를 숨깁니다.
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  const menus = [
    { name: '계좌 관리', href: '/', icon: Home },
    { name: '이체', href: '/transfer', icon: Send },
    { name: '정산', href: '/splitbills', icon: HandCoins },
    { name: '친구', href: '/friends', icon: Users },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-gray-100 min-h-[140px]">
        <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight mb-6 mt-2">Mini Pay</h1>
        {isLoading ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse" />
            </div>
          </div>
        ) : me ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
              {me.nickname ? me.nickname.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <p className="font-bold text-gray-900 leading-tight">{me.nickname}</p>
              <p className="text-xs text-gray-500">환영합니다!</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              ?
            </div>
            <div>
              <p className="font-bold text-gray-900 leading-tight">로그인 필요</p>
              <Link href="/login" className="text-xs text-blue-600 hover:underline">로그인 하러가기</Link>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menus.map((menu) => {
          const isActive = pathname === menu.href || (menu.href !== '/' && pathname.startsWith(menu.href));
          const Icon = menu.icon;
          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              {menu.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <LogoutButton />
      </div>
    </aside>
  );
}
