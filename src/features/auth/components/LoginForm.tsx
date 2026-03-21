'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      // 프론트엔드 API 인스턴스를 통해 백엔드 API 직접 호출
      // axios 대신 설정된 api 인스턴스를 사용하거나, 자체 axios를 사용해 baseUrl로 호출
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://tlswltjq.iptime.org:8080'}/api/v1/auth/login`, { email, password });
      
      const { accessToken, refreshToken } = res.data.data;
      if (accessToken) localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
          {errorMsg}
        </div>
      )}
      
      <div className="space-y-1">
        <label className="text-sm font-semibold text-gray-700" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200"
          placeholder="your@email.com"
        />
      </div>
      
      <div className="space-y-1 mt-4">
        <label className="text-sm font-semibold text-gray-700" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 mt-6 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center"
      >
        {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : '로그인'}
      </button>

      <p className="text-center text-sm text-gray-500 mt-6">
        계정이 없으신가요?{' '}
        <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
          회원가입
        </Link>
      </p>
    </form>
  );
}
