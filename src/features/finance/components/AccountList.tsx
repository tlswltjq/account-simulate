'use client';

import { useState } from 'react';
import { useAccounts } from '../api/queries';
import { useChargeAccount, useTransfer, useCreateSavingAccount, useCreateGeneralAccount } from '../api/mutations';

type ModalType = 'CHARGE' | 'TRANSFER' | 'CREATE_SAVING' | 'CREATE_GENERAL' | null;

export function AccountList() {
  const { data, isLoading, isError } = useAccounts();
  const chargeMutation = useChargeAccount();
  const transferMutation = useTransfer();
  const createSavingMutation = useCreateSavingAccount();
  const createGeneralMutation = useCreateGeneralAccount();

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  
  // Form states
  const [amount, setAmount] = useState<string>('');
  const [receiver, setReceiver] = useState<string>('');
  const [linkedAccount, setLinkedAccount] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

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

  const closeModal = () => {
    setActiveModal(null);
    setSelectedAccount('');
    setAmount('');
    setReceiver('');
    setLinkedAccount('');
    setErrorMsg('');
  };

  const openChargeCard = (accountAddress: string) => {
    setSelectedAccount(accountAddress);
    setActiveModal('CHARGE');
  };

  const openTransferCard = (accountAddress: string) => {
    setSelectedAccount(accountAddress);
    setActiveModal('TRANSFER');
  };

  const openCreateSavingCard = () => {
    if (generalAccounts.length === 0) {
      alert('적금계좌를 연결할 일반계좌가 존재하지 않습니다.');
      return;
    }
    setLinkedAccount(generalAccounts[0].accountAddress); // 첫번째 일반계좌 기본 선택
    setActiveModal('CREATE_SAVING');
  };

  const openCreateGeneralCard = () => {
    setActiveModal('CREATE_GENERAL');
  };

  // Submit Handlers
  const handleSubmitCharge = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 1) {
      setErrorMsg('유효한 금액을 입력하세요.');
      return;
    }
    chargeMutation.mutate({ accountNumber: selectedAccount, amount: numAmount }, {
      onSuccess: () => closeModal(),
      onError: (err: any) => setErrorMsg(err.response?.data?.message || '충전 실패')
    });
  };

  const handleSubmitTransfer = (e: React.FormEvent) => {
    e.preventDefault();
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
      senderAccountNumber: selectedAccount, 
      receiverAccountNumber: receiver, 
      amount: numAmount 
    }, {
      onSuccess: () => closeModal(),
      onError: (err: any) => setErrorMsg(err.response?.data?.message || '송금 실패')
    });
  };

  const handleSubmitCreateSaving = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedAccount) {
      setErrorMsg('연결할 일반계좌를 선택해주세요.');
      return;
    }
    createSavingMutation.mutate(linkedAccount, {
      onSuccess: () => closeModal(),
      onError: (err: any) => setErrorMsg(err.response?.data?.message || '적금계좌 개설 실패')
    });
  };

  const handleSubmitCreateGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    createGeneralMutation.mutate(undefined, {
      onSuccess: () => closeModal(),
      onError: (err: any) => setErrorMsg(err.response?.data?.message || '일반계좌 개설 실패')
    });
  };

  return (
    <div className="space-y-8 relative">
      {/* 일반계좌 섹션 */}
      <section>
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className="text-base font-bold text-gray-900">내 일반계좌</h3>
          <button onClick={openCreateGeneralCard} disabled={createGeneralMutation.isPending} className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50">
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
                  <button onClick={() => openChargeCard(account.accountAddress)} className="flex-1 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-sm transition-colors shadow-sm">
                    채우기
                  </button>
                  <button onClick={() => openTransferCard(account.accountAddress)} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm shadow-blue-200">
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
          <button onClick={openCreateSavingCard} disabled={createSavingMutation.isPending || generalAccounts.length === 0} className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50">
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

      {/* 모달 오버레이 */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* 공통 에러 메시지 */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                {errorMsg}
              </div>
            )}

            {/* CHARGE MODAL */}
            {activeModal === 'CHARGE' && (
              <form onSubmit={handleSubmitCharge}>
                <h3 className="text-lg font-bold text-gray-900 mb-1">채우기</h3>
                <p className="text-sm text-gray-500 mb-5 font-mono">{selectedAccount}</p>
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

            {/* TRANSFER MODAL */}
            {activeModal === 'TRANSFER' && (
              <form onSubmit={handleSubmitTransfer}>
                <h3 className="text-lg font-bold text-gray-900 mb-1">송금하기</h3>
                <p className="text-sm text-gray-500 mb-5 font-mono">출금: {selectedAccount}</p>
                <div className="space-y-4 mb-6">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">받는 계좌번호</label>
                    <input
                      type="text"
                      value={receiver}
                      onChange={(e) => setReceiver(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono"
                      placeholder="받으실 분의 계좌번호"
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

            {/* CREATE_SAVING MODAL */}
            {activeModal === 'CREATE_SAVING' && (
              <form onSubmit={handleSubmitCreateSaving}>
                <h3 className="text-lg font-bold text-gray-900 mb-1">새 적금계좌 개설</h3>
                <p className="text-sm text-gray-500 mb-5">적금계좌와 연결할 일반계좌를 선택해주세요.</p>
                <div className="space-y-1 mb-6">
                  <label className="text-sm font-semibold text-gray-700">연결할 일반계좌</label>
                  <select
                    value={linkedAccount}
                    onChange={(e) => setLinkedAccount(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                  >
                    {generalAccounts.map((acc) => (
                      <option key={acc.accountAddress} value={acc.accountAddress}>
                        {acc.accountAddress} (잔액: {acc.balance.toLocaleString()}원)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">취소</button>
                  <button type="submit" disabled={createSavingMutation.isPending} className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50">
                    {createSavingMutation.isPending ? '개설중...' : '개설하기'}
                  </button>
                </div>
              </form>
            )}

            {/* CREATE_GENERAL MODAL */}
            {activeModal === 'CREATE_GENERAL' && (
              <form onSubmit={handleSubmitCreateGeneral}>
                <h3 className="text-lg font-bold text-gray-900 mb-1">새 일반계좌 개설</h3>
                <p className="text-sm text-gray-500 mb-6">새로운 일반계좌를 개설하시겠습니까? 개설 후 바로 메인 화면에서 확인하실 수 있습니다.</p>
                <div className="flex gap-2">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">취소</button>
                  <button type="submit" disabled={createGeneralMutation.isPending} className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50">
                    {createGeneralMutation.isPending ? '개설중...' : '진행하기'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
