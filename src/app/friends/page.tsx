import { FriendList } from '@/features/member/components/FriendList';
import Link from 'next/link';

export default function FriendsPage() {
  return (
    <main className="flex flex-1 flex-col h-full bg-gray-50 pb-20 overflow-y-auto overflow-x-hidden">
      <header className="sticky top-0 z-10 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center gap-3">
        <Link href="/" className="p-1 -ml-1 text-gray-400 hover:text-gray-900 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">친구 목록</h1>
      </header>
      
      <div className="p-6 flex-1 space-y-6">
        <FriendList />
      </div>
    </main>
  );
}
