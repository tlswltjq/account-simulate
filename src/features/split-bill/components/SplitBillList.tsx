'use client';

import { useRequestedSplitBills, useOpenedSplitBills } from '../api/queries';
import { usePaySplitBill } from '../api/mutations';
import { useAccounts } from '@/features/finance/api/queries';
import { Loader2 } from 'lucide-react';

export function SplitBillList() {
  const { data: requested, isLoading: loadingReq } = useRequestedSplitBills();
  const { data: opened, isLoading: loadingOpen } = useOpenedSplitBills();
  const { data: accountsData } = useAccounts();
  const payMutation = usePaySplitBill();

  const primaryAccount = accountsData?.accounts?.find(acc => acc.accountType === 'GENERAL');

  const handlePay = (splitBillId: number) => {
    if (!primaryAccount) {
      alert('등록된 기본 계좌가 없습니다. 홈으로 돌아가주세요.');
      return;
    }
    payMutation.mutate({ splitBillId, payerAccountAddress: primaryAccount.accountAddress }, {
      onSuccess: () => alert('정산 지불이 완료되었습니다!'),
      onError: (err: any) => alert(err.response?.data?.message || '지불에 실패했습니다.')
    });
  };

  const isLoading = loadingReq || loadingOpen;

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  const hasRequested = Array.isArray(requested) && requested.length > 0;
  const hasOpened = Array.isArray(opened) && opened.length > 0;

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-base font-bold text-gray-900 mb-3 px-1">요청받은 정산 (내야 할 돈)</h3>
        {!hasRequested ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <p className="text-sm text-gray-500">요청받은 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requested.map((bill: any) => (
              <div key={bill.splitBillId} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-gray-800">정산 요청</h4>
                  <p className="text-xs text-gray-500 mt-1">총 금액: {bill.totalAmount?.toLocaleString() || 0}원</p>
                  <p className="text-[10px] font-bold mt-2 px-2 py-0.5 rounded-md inline-block bg-blue-50 text-blue-600">
                    {bill.status}
                  </p>
                </div>
                <button
                  onClick={() => handlePay(bill.splitBillId)}
                  disabled={payMutation.isPending || bill.status === 'COMPLETED'}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  {bill.status === 'COMPLETED' ? '완료됨' : '지불하기'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-base font-bold text-gray-900 mb-3 px-1">요청한 정산 (받을 돈)</h3>
        {!hasOpened ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <p className="text-sm text-gray-500">요청한 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {opened.map((bill: any) => (
              <div key={bill.splitBillId} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-gray-800">정산 오픈 내역</h4>
                  <p className="text-xs text-gray-500 mt-1">총 금액: {bill.totalAmount?.toLocaleString() || 0}원</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${bill.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {bill.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
