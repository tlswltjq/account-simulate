import { TransferHistoryList } from '@/features/finance/components/TransferHistoryList';
export default function HistoryPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 본문 */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-gray-900">거래내역</h2>
          <p className="mt-1 text-sm text-gray-500">특정 계좌의 최근 거래 내역을 조회합니다. (통합 조회 API 추가 예정)</p>
        </div>
        <TransferHistoryList />
      </main>
    </div>
  );
}
