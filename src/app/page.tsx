import { LogoutButton } from '@/features/auth/components/LogoutButton';
import { AccountList } from '@/features/finance/components/AccountList';
import { TransferHistoryList } from '@/features/finance/components/TransferHistoryList';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col h-full bg-gray-50 pb-20 overflow-y-auto overflow-x-hidden">
      <header className="sticky top-0 z-10 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 flex justify-between items-center">
        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Mini Pay</h1>
        <LogoutButton />
      </header>
      
      <div className="p-6 flex-1 space-y-6">
        <AccountList />
        <TransferHistoryList />
      </div>

      <nav className="absolute bottom-0 w-full bg-white border-t border-gray-100 flex items-center justify-around py-3 pb-8">
        <Link href="/" className="flex flex-col items-center gap-1 text-blue-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          <span className="text-[10px] font-bold">홈</span>
        </Link>
        <Link href="/friends" className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          <span className="text-[10px] font-bold">친구</span>
        </Link>
        <Link href="/splitbills" className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <span className="text-[10px] font-bold">정산</span>
        </Link>
      </nav>
    </main>
  );
}
