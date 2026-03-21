'use client';

import { useAccounts } from '../api/queries';
import { useChargeAccount, useTransfer, useCreateSavingAccount, useCreateGeneralAccount } from '../api/mutations';

export function AccountList() {
  const { data, isLoading, isError } = useAccounts();
  const chargeMutation = useChargeAccount();
  const transferMutation = useTransfer();
  const createSavingMutation = useCreateSavingAccount();
  const createGeneralMutation = useCreateGeneralAccount();

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

  const generalAccounts = data?.accounts?.filter(acc => acc.accountType === 'GENERAL') || [];
  const savingAccounts = data?.accounts?.filter(acc => acc.accountType === 'SAVING') || [];

  const handleCreateGeneral = () => {
    if (confirm('새 일반계좌를 개설하시겠습니까?')) {
      createGeneralMutation.mutate(undefined, {
        onSuccess: () => alert('일반계좌가 성공적으로 개설되었습니다!'),
        onError: (err: any) => alert(err.response?.data?.message || '일반계좌 개설 실패')
      });
    }
  };

  const handleCreateSaving = () => {
    if (generalAccounts.length === 0) return alert('적금계좌를 연결할 일반계좌가 존재하지 않습니다.');
    const targetAddress = prompt('연결할 일반계좌 번호를 입력하세요:\n(기본값: 첫번째 계좌)', generalAccounts[0].accountAddress);
    if (!targetAddress) return;
    
    if (confirm('새 적금계좌를 개설하시겠습니까?')) {
      createSavingMutation.mutate(targetAddress, {
        onSuccess: () => alert('적금계좌가 성공적으로 개설되었습니다!'),
        onError: (err: any) => alert(err.response?.data?.message || '적금계좌 개설 실패')
      });
    }
  };

  const handleCharge = (accountAddress: string) => {
    const amountInput = prompt('충전할 금액(원)을 숫자만 입력하세요:');
    if (!amountInput) return;
    const amount = Number(amountInput.replace(/[^0-9]/g, ''));
    if (!amount || amount < 1) return alert('유효한 금액을 입력하세요.');

    chargeMutation.mutate({ accountNumber: accountAddress, amount }, {
      onSuccess: () => alert('충전이 완료되었습니다.'),
      onError: (err: any) => alert(err.response?.data?.message || '충전 실패')
    });
  };

  const handleTransfer = (senderAccountAddress: string) => {
    const receiver = prompt('송금받을 계좌번호를 입력하세요:');
    if (!receiver) return;
    const amountInput = prompt('송금할 금액을 입력하세요:');
    if (!amountInput) return;
    const amount = Number(amountInput.replace(/[^0-9]/g, ''));
    if (!amount || amount < 1) return alert('유효한 금액을 입력하세요.');

    transferMutation.mutate({ 
      senderAccountNumber: senderAccountAddress, 
      receiverAccountNumber: receiver, 
      amount 
    }, {
      onSuccess: () => alert('송금이 완료되었습니다.'),
      onError: (err: any) => alert(err.response?.data?.message || '송금 실패')
    });
  };

  return (
    <div className="space-y-8">
      {/* 일반계좌 섹션 */}
      <section>
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className="text-base font-bold text-gray-900">내 일반계좌</h3>
          <button onClick={handleCreateGeneral} disabled={createGeneralMutation.isPending} className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50">
            {createGeneralMutation.isPending ? '개설 중...' : '+ 새 일반계좌 개설'}
          </button>
        </div>
        {generalAccounts.length > 0 ? (
          <div className="space-y-4">
            {generalAccounts.map(account => (
              <div key={account.accountAddress} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-6 -mt-6 opacity-60 pointer-events-none" />
                <h4 className="text-sm font-semibold text-gray-500 mb-1">일반계좌 <span className="text-xs text-gray-400 font-mono tracking-widest">{account.accountAddress}</span></h4>
                <div className="flex items-baseline gap-1 mb-6">
                  <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    {account.balance.toLocaleString()}
                  </p>
                  <span className="text-lg font-bold text-gray-900">원</span>
                </div>
                
                <div className="flex gap-3">
                  <button onClick={() => handleCharge(account.accountAddress)} disabled={chargeMutation.isPending} className="flex-1 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50">
                    채우기
                  </button>
                  <button onClick={() => handleTransfer(account.accountAddress)} disabled={transferMutation.isPending} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm shadow-blue-200 disabled:opacity-50">
                    송금하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <p className="text-sm text-gray-500">개설된 일반계좌가 없습니다.</p>
          </div>
        )}
      </section>

      {/* 적금계좌 섹션 */}
      <section>
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className="text-base font-bold text-gray-900">적금계좌</h3>
          <button onClick={handleCreateSaving} disabled={createSavingMutation.isPending || generalAccounts.length === 0} className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50">
            {createSavingMutation.isPending ? '개설 중...' : '+ 새 적금계좌 개설'}
          </button>
        </div>
        {savingAccounts.length > 0 ? (
          <div className="space-y-3">
            {savingAccounts.map(account => (
              <div key={account.accountAddress} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex justify-between items-center transition hover:border-gray-300">
                <div>
                  <h4 className="text-sm font-bold text-gray-800">적금계좌</h4>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-mono">{account.accountAddress}</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-gray-900 text-xl">{account.balance.toLocaleString()}원</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <p className="text-sm text-gray-500">개설된 적금계좌가 없습니다.</p>
          </div>
        )}
      </section>
    </div>
  );
}
