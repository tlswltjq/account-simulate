import { SplitBillList } from '@/features/split-bill/components/SplitBillList';
import Link from 'next/link';

export default function SplitBillsPage() {
  return (
    <main className="flex flex-1 flex-col h-full bg-gray-50 pb-20 overflow-y-auto overflow-x-hidden">
      <header className="sticky top-0 z-10 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-1 -ml-1 text-gray-400 hover:text-gray-900 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">더치페이 내역</h1>
        </div>
        <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
          + 정산 만들기
        </button>
      </header>
      
      <div className="p-6 flex-1 space-y-6">
        <SplitBillList />
      </div>
    </main>
  );
}
