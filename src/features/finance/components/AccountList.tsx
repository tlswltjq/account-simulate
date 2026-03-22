'use client';

import { useState } from 'react';
import { useAccounts, Account } from '../api/queries';
import { useCreateSavingAccount, useCreateGeneralAccount } from '../api/mutations';

type ModalType = 'CREATE_SAVING' | 'CREATE_GENERAL' | null;

interface AccountListProps {
  selectedAccount?: Account | null;
  onSelectAccount?: (account: Account) => void;
}

export function AccountList({ selectedAccount, onSelectAccount }: AccountListProps) {
  const { data, isLoading, isError } = useAccounts();
  const createSavingMutation = useCreateSavingAccount();
  const createGeneralMutation = useCreateGeneralAccount();

  const [activeModal, setActiveModal] = useState<ModalType>(null);
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
    setLinkedAccount('');
    setErrorMsg('');
  };

  const openCreateSavingCard = () => {
    if (generalAccounts.length === 0) {
      alert('적금계좌를 연결할 일반계좌가 존재하지 않습니다.');
      return;
    }
    setLinkedAccount(generalAccounts[0].accountAddress);
    setActiveModal('CREATE_SAVING');
  };

  const openCreateGeneralCard = () => {
    setActiveModal('CREATE_GENERAL');
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
      <section>
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className="text-base font-bold text-gray-900">내 일반계좌</h3>
          <button onClick={openCreateGeneralCard} disabled={createGeneralMutation.isPending} className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50">
            {createGeneralMutation.isPending ? '개설 중...' : '+ 새 일반계좌 개설'}
          </button>
        </div>
        {generalAccounts.length > 0 ? (
          <div className="space-y-4">
            {generalAccounts.map(account => {
              const isSelected = selectedAccount?.accountAddress === account.accountAddress;
              return (
                <div 
                  key={account.accountAddress} 
                  className={`bg-white rounded-3xl p-6 shadow-sm border relative overflow-hidden transition-all duration-200 cursor-pointer ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 'border-gray-100 hover:border-blue-300'}`}
                  onClick={() => onSelectAccount?.(account)}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-6 -mt-6 opacity-60 pointer-events-none" />
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">일반계좌 <span className="text-xs text-gray-400 font-mono tracking-widest">{account.accountAddress}</span></h4>
                  <div className="flex items-baseline gap-1 mt-4">
                    <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
                      {account.balance.toLocaleString()}
                    </p>
                    <span className="text-lg font-bold text-gray-900">원</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <p className="text-sm text-gray-500">개설된 일반계좌가 없습니다.</p>
          </div>
        )}
      </section>

      <section>
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className="text-base font-bold text-gray-900">적금계좌</h3>
          <button onClick={openCreateSavingCard} disabled={createSavingMutation.isPending || generalAccounts.length === 0} className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50">
            {createSavingMutation.isPending ? '개설 중...' : '+ 새 적금계좌 개설'}
          </button>
        </div>
        {savingAccounts.length > 0 ? (
          <div className="space-y-3">
            {savingAccounts.map(account => {
              const isSelected = selectedAccount?.accountAddress === account.accountAddress;
              return (
                <div 
                  key={account.accountAddress} 
                  className={`bg-white rounded-2xl p-5 shadow-sm border flex justify-between items-center transition-all duration-200 cursor-pointer ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 'border-gray-100 hover:border-blue-300'}`}
                  onClick={() => onSelectAccount?.(account)}
                >
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">적금계좌</h4>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-mono">{account.accountAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-gray-900 text-xl">{account.balance.toLocaleString()}원</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <p className="text-sm text-gray-500">개설된 적금계좌가 없습니다.</p>
          </div>
        )}
      </section>

      {activeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                {errorMsg}
              </div>
            )}

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
