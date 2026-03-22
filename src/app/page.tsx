'use client';

import { useState } from 'react';
import { AccountList } from '@/features/finance/components/AccountList';
import { TransferHistoryList } from '@/features/finance/components/TransferHistoryList';
import { Account } from '@/features/finance/api/queries';

export default function HomePage() {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-gray-50">
      {/* 메인 계좌 목록 */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-8 h-full overflow-y-auto pb-32">
        <AccountList selectedAccount={selectedAccount} onSelectAccount={setSelectedAccount} />
      </main>

      {/* 오버레이 배경 (화면 어두워짐 효과) */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${
          selectedAccount ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setSelectedAccount(null)}
      />

      {/* 우측에서 슬라이드되는 내역 카드 패널 */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[460px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out border-l border-gray-100 flex flex-col ${
          selectedAccount ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto p-6 md:p-8 h-full">
          {/* 애니메이션 상태에서도 컴포넌트를 유지하기 위해 props 자체만 내려줌 */}
          {selectedAccount && (
            <TransferHistoryList 
              account={selectedAccount} 
              onClose={() => setSelectedAccount(null)} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
