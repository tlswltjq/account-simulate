'use client';

import { useState } from 'react';
import { useTransferHistory, Account } from '../api/queries';
import { useChargeAccount, useTransfer } from '../api/mutations';
import { Loader2, X } from 'lucide-react';

type ModalType = 'CHARGE' | 'TRANSFER' | null;

export function TransferHistoryList({ account, onClose }: { account?: Account | null; onClose?: () => void }) {
  const accountAddress = account?.accountAddress;
  
  // v5 호환성을 위해 isLoading 대신 isPending 사용. enabled가 false일 땐 status: 'pending' (v5 기준)
  const { data: history, isPending, isError, isFetching } = useTransferHistory(accountAddress || undefined);
  const loading = isPending || isFetching;

  const chargeMutation = useChargeAccount();
  const transferMutation = useTransfer();

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [amount, setAmount] = useState<string>('');
  const [receiver, setReceiver] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const closeModal = () => {
    setActiveModal(null);
    setAmount('');
    setReceiver('');
    setErrorMsg('');
  };

  const handleSubmitCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountAddress) return;
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 1) {
      setErrorMsg('유효한 금액을 입력하세요.');
      return;
    }
    chargeMutation.mutate({ accountNumber: accountAddress, amount: numAmount }, {
      onSuccess: () => closeModal(),
      onError: (err: any) => setErrorMsg(err.response?.data?.message || '충전 실패')
    });
  };

  const handleSubmitTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountAddress) return;
    if (!receiver) {
      setErrorMsg('송금받을 계좌번호를 입력하세요.');
      return;
    }
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 1) {
      setErrorMsg('유효한 금액을 입력하세요.');
      return;
    }
    transferMutation.mutate({ 
      senderAccountNumber: accountAddress, 
      receiverAccountNumber: receiver, 
      amount: numAmount 
    }, {
      onSuccess: () => closeModal(),
      onError: (err: any) => setErrorMsg(err.response?.data?.message || '송금 실패')
    });
  };

  if (!accountAddress) {
    return (
      <section className="h-full flex flex-col pt-12">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px] text-center border-dashed">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">좌측에서 계좌를 선택해<br/>거래 내역을 확인해 보세요.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="h-full flex flex-col">
      <div className="mb-6">
        <div className="flex justify-between items-start px-1">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900">상세 내역</h3>
            <p className="text-xs text-gray-500 font-mono mt-1">{accountAddress}</p>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        {account.accountType === 'GENERAL' && (
          <div className="flex gap-2 mt-4">
            <button 
              onClick={() => setActiveModal('CHARGE')} 
              className="px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded-xl text-sm transition-colors shadow-sm whitespace-nowrap"
            >
              채우기
            </button>
            <button 
              onClick={() => setActiveModal('TRANSFER')} 
              className="px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 font-bold rounded-xl text-sm transition-colors shadow-sm whitespace-nowrap flex-1 text-center justify-center"
            >
              송금하기
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 bg-white rounded-3xl p-2 shadow-sm border border-gray-100 divide-y divide-gray-50">
        {loading ? (
          <div className="flex justify-center flex-col items-center p-8 pt-12">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-4" />
            <p className="text-sm text-gray-500">내역을 불러오는 중...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500 text-sm">
            내역을 불러오는 중 오류가 발생했습니다.
          </div>
        ) : (!Array.isArray(history) || history.length === 0) ? (
          <div className="flex flex-col items-center justify-center p-12 text-center h-40">
            <p className="text-sm font-medium text-gray-500">거래 내역이 없어요.</p>
          </div>
        ) : (
          history.map((tx: any, idx: number) => {
            const isSystemAccount = tx.senderAccountAddress === '00000000-0000-0000-0000-000000000000' || tx.receiverAccountAddress === '00000000-0000-0000-0000-000000000000';
            const isDeposit = isSystemAccount ? true : tx.receiverAccountAddress === accountAddress;
            const rawDisplayAccount = isSystemAccount ? '00000000-0000-0000-0000-000000000000' : (isDeposit ? tx.senderAccountAddress : tx.receiverAccountAddress);
            const displayAccount = isSystemAccount ? '충전' : rawDisplayAccount;
            return (
              <div key={idx} className="py-4 px-4 flex justify-between items-center bg-transparent group hover:bg-gray-50 transition-colors rounded-xl mx-2 my-1">
                <div>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-blue-900 transition-colors">{displayAccount || '알 수 없음'}</p>
                  <p className="text-xs text-gray-500 mt-1">{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : ''}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${isDeposit ? 'text-blue-600' : 'text-gray-900'}`}>
                    {isDeposit ? '+' : '-'}{Math.abs(tx.amount).toLocaleString()}원
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {activeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                {errorMsg}
              </div>
            )}

            {activeModal === 'CHARGE' && (
              <form onSubmit={handleSubmitCharge}>
                <h3 className="text-lg font-bold text-gray-900 mb-1">채우기</h3>
                <p className="text-xs text-gray-500 mb-5 font-mono">{accountAddress}</p>
                <div className="space-y-1 mb-6">
                  <label className="text-sm font-semibold text-gray-700">충전 금액 (원)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    placeholder="예: 10000"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">취소</button>
                  <button type="submit" disabled={chargeMutation.isPending} className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50">
                    {chargeMutation.isPending ? '충전중...' : '충전하기'}
                  </button>
                </div>
              </form>
            )}

            {activeModal === 'TRANSFER' && (
              <form onSubmit={handleSubmitTransfer}>
                <h3 className="text-lg font-bold text-gray-900 mb-1">송금하기</h3>
                <p className="text-xs text-gray-500 mb-5 font-mono">출금: {accountAddress}</p>
                <div className="space-y-4 mb-6">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">받는 계좌번호</label>
                    <input
                      type="text"
                      value={receiver}
                      onChange={(e) => setReceiver(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                      placeholder="상대방 계좌번호"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">보낼 금액 (원)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="예: 50000"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">취소</button>
                  <button type="submit" disabled={transferMutation.isPending} className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50">
                    {transferMutation.isPending ? '송금중...' : '송금하기'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </section>
  );
}
