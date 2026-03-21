'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      // 백엔드 바로 호출
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://tlswltjq.iptime.org:8080'}/api/v1/auth/signup`, { email, password, name, nickname });
      
      // 회원가입 성공 시 바로 로그인 페이지로 이동
      router.push('/login');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || '회원가입에 실패했습니다. 정보를 다시 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
          {errorMsg}
        </div>
      )}
      
      <div className="space-y-1">
        <label className="text-sm font-semibold text-gray-700" htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200"
          placeholder="홍길동"
        />
      </div>

      <div className="space-y-1 mt-4">
        <label className="text-sm font-semibold text-gray-700" htmlFor="nickname">Nickname</label>
        <input
          id="nickname"
          type="text"
          required
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200"
          placeholder="길동이"
        />
      </div>

      <div className="space-y-1 mt-4">
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
        {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : '계정 생성하기'}
      </button>

      <p className="text-center text-sm text-gray-500 mt-6">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
          로그인
        </Link>
      </p>
    </form>
  );
}
