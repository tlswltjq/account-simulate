export default function TransferPage() {
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900">이체</h2>
        <p className="mt-1 text-sm text-gray-500">이체 기능은 준비 중입니다.</p>
      </div>

      <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">화면 구현 예정</h3>
        <p className="text-sm text-gray-500">추후 이체 관련 화면이 이곳에 구현될 예정입니다.</p>
      </div>
    </div>
  );
}
