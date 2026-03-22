'use client';

import { useAccounts, useTransferHistory } from '../api/queries';
import { Loader2 } from 'lucide-react';

export function TransferHistoryList() {
  const { data: accountsData } = useAccounts();
  const primaryAccount = accountsData?.accounts?.find(acc => acc.accountType === 'GENERAL');
  
  const { data: history, isLoading } = useTransferHistory(primaryAccount?.accountAddress);

  if (isLoading) {
    return (
      <section className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </section>
    );
  }

  const hasHistory = Array.isArray(history) && history.length > 0;

  return (
    <section>
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="text-base font-bold text-gray-900">최근 내역</h3>
      </div>
      
      {!hasHistory ? (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[160px] text-center">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500">거래 내역이 없어요.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 divide-y divide-gray-50">
          {history.map((tx: any, idx: number) => {
            const isDeposit = tx.receiverAccountAddress === primaryAccount?.accountAddress;
            const rawDisplayAccount = isDeposit ? tx.senderAccountAddress : tx.receiverAccountAddress;
            const displayAccount = rawDisplayAccount === '00000000-0000-0000-0000-000000000000' ? '충전' : rawDisplayAccount;
            return (
              <div key={idx} className="py-4 px-2 flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-gray-900">{displayAccount || '알 수 없음'}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(tx.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${isDeposit ? 'text-blue-600' : 'text-gray-900'}`}>
                    {isDeposit ? '+' : '-'}{Math.abs(tx.amount).toLocaleString()}원
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
