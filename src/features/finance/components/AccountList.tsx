'use client';

import { useAccounts } from '../api/queries';
import { useChargeAccount, useTransfer, useCreateSavingAccount } from '../api/mutations';

export function AccountList() {
  const { data, isLoading, isError } = useAccounts();
  const chargeMutation = useChargeAccount();
  const transferMutation = useTransfer();
  const createSavingMutation = useCreateSavingAccount();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-100 rounded-lg w-1/3 mb-2"></div>
        <div className="h-12 bg-gray-100 rounded-lg w-1/2"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
        계좌 정보를 불러오는 데 실패했습니다. 다시 시도해주세요.
      </div>
    );
  }

  const primaryAccount = data?.accounts?.find(acc => acc.accountType === 'GENERAL');
  const savingAccounts = data?.accounts?.filter(acc => acc.accountType === 'SAVING') || [];

  const handleCreateSaving = () => {
    if (!primaryAccount) return alert('기본 계좌가 없습니다.');
    if (confirm('새 모임 통장을 개설하시겠습니까? (기본 계좌와 연결)')) {
      createSavingMutation.mutate(primaryAccount.accountAddress, {
        onSuccess: () => alert('모임 통장이 성공적으로 개설되었습니다!'),
        onError: (err: any) => alert(err.response?.data?.message || '모임 통장 개설 실패')
      });
    }
  };

  const handleCharge = () => {
    if (!primaryAccount) return alert('기본 계좌가 없습니다.');
    const amountInput = prompt('충전할 금액(원)을 숫자만 입력하세요:');
    if (!amountInput) return;
    const amount = Number(amountInput.replace(/[^0-9]/g, ''));
    if (!amount || amount < 1) return alert('유효한 금액을 입력하세요.');

    chargeMutation.mutate({ accountNumber: primaryAccount.accountAddress, amount }, {
      onSuccess: () => alert('충전이 완료되었습니다.'),
      onError: (err: any) => alert(err.response?.data?.message || '충전 실패')
    });
  };

  const handleTransfer = () => {
    if (!primaryAccount) return alert('기본 계좌가 없습니다.');
    const receiver = prompt('송금받을 계좌번호를 입력하세요:');
    if (!receiver) return;
    const amountInput = prompt('송금할 금액을 입력하세요:');
    if (!amountInput) return;
    const amount = Number(amountInput.replace(/[^0-9]/g, ''));
    if (!amount || amount < 1) return alert('유효한 금액을 입력하세요.');

    transferMutation.mutate({ 
      senderAccountNumber: primaryAccount.accountAddress, 
      receiverAccountNumber: receiver, 
      amount 
    }, {
      onSuccess: () => alert('송금이 완료되었습니다.'),
      onError: (err: any) => alert(err.response?.data?.message || '송금 실패')
    });
  };

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-60 pointer-events-none" />
        <h2 className="text-sm font-semibold text-gray-500 mb-2">기본 내 지갑</h2>
        <div className="flex items-baseline gap-1">
          <p className="text-4xl font-extrabold text-gray-900 tracking-tight">
            {primaryAccount ? primaryAccount.balance.toLocaleString() : 0}
          </p>
          <span className="text-xl font-bold text-gray-900">원</span>
        </div>
        
        <div className="flex gap-3 mt-8">
          <button onClick={handleCharge} disabled={chargeMutation.isPending} className="flex-1 py-3.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-2xl text-sm transition-colors shadow-sm disabled:opacity-50">
            {chargeMutation.isPending ? '충전중...' : '채우기'}
          </button>
          <button onClick={handleTransfer} disabled={transferMutation.isPending} className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm transition-colors shadow-sm shadow-blue-200 disabled:opacity-50">
            {transferMutation.isPending ? '송금중...' : '송금하기'}
          </button>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className="text-base font-bold text-gray-900">모임 통장</h3>
          <button onClick={handleCreateSaving} disabled={createSavingMutation.isPending} className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50">
            {createSavingMutation.isPending ? '개설 중...' : '+ 새 모임 개설'}
          </button>
        </div>
        {savingAccounts.length > 0 ? (
          <div className="space-y-3">
            {savingAccounts.map(account => (
              <div key={account.accountAddress} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex justify-between items-center transition hover:border-gray-300 cursor-pointer">
                <div>
                  <h4 className="text-sm font-bold text-gray-800">모임통장</h4>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-mono">{account.accountAddress.substring(0, 10)}...</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-gray-900">{account.balance.toLocaleString()}원</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <p className="text-sm text-gray-500">개설된 모임 통장이 없습니다.</p>
          </div>
        )}
      </section>
    </div>
  );
}
