import { SplitBillList } from '@/features/split-bill/components/SplitBillList';
export default function SplitBillsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 본문 */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-extrabold text-gray-900">더치페이 내역</h2>
          <button className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            + 정산 만들기
          </button>
        </div>
        <SplitBillList />
      </main>
    </div>
  );
}
