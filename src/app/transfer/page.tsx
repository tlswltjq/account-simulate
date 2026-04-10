'use client';

import { useState } from 'react';
import { useTransfer, useTransferWithReview } from '@/features/finance/api/mutations';
import { useReviewRequestedTransfers } from '@/features/finance/api/queries';
import { Send, Clock, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

function TransferForm() {
  const [senderAccountNumber, setSenderAccountNumber] = useState('');
  const [receiverAccountNumber, setReceiverAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  
  const { mutate: transfer, isPending: isTransferring } = useTransfer();
  const { mutate: transferWithReview, isPending: isReviewing } = useTransferWithReview();

  const getPayload = () => ({
    senderAccountNumber,
    receiverAccountNumber,
    amount: Number(amount.replace(/[^0-9]/g, '')),
  });

  const clearForm = () => {
    setSenderAccountNumber('');
    setReceiverAccountNumber('');
    setAmount('');
  };

  const handleNormalTransfer = () => {
    if (!senderAccountNumber || !receiverAccountNumber || !amount) return alert('모든 필드를 입력해주세요.');
    transfer(getPayload(), {
      onSuccess: () => {
        alert('이체가 성공적으로 완료되었습니다.');
        clearForm();
      },
      onError: (err: any) => {
        alert(err.response?.data?.message || '이체에 실패했습니다.');
      }
    });
  };

  const handleReviewTransfer = () => {
    if (!senderAccountNumber || !receiverAccountNumber || !amount) return alert('모든 필드를 입력해주세요.');
    transferWithReview(getPayload(), {
      onSuccess: () => {
        alert('이체 심사가 성공적으로 요청되었습니다.');
        clearForm();
      },
      onError: (err: any) => {
        alert(err.response?.data?.message || '심사 요청에 실패했습니다.');
      }
    });
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 max-w-xl mx-auto">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">출금 계좌번호</label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="출금할 계좌번호를 입력하세요"
            value={senderAccountNumber}
            onChange={(e) => setSenderAccountNumber(e.target.value)}
          />
        </div>

        <div className="flex justify-center">
          <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
            <ArrowRight className="w-4 h-4 rotate-90" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">입금 계좌번호</label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="받을 계좌번호를 입력하세요"
            value={receiverAccountNumber}
            onChange={(e) => setReceiverAccountNumber(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">이체 금액</label>
          <div className="relative">
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-12 text-right font-bold text-lg"
              placeholder="0"
              value={amount}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setAmount(val ? Number(val).toLocaleString() : '');
              }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">원</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8 pt-4">
          <button
            onClick={handleNormalTransfer}
            disabled={isTransferring || isReviewing}
            className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-2xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            일반 이체
          </button>
          <button
            onClick={handleReviewTransfer}
            disabled={isTransferring || isReviewing}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            심사 후 이체
          </button>
        </div>
      </div>
    </div>
  );
}

function PendingTransferList() {
  const { data, isLoading, error } = useReviewRequestedTransfers();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p>심사 대기 내역을 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-500">
        <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
        <p>대기 내역을 불러올 수 없습니다.</p>
      </div>
    );
  }

  const transfers = data?.reviewRequested || [];

  if (transfers.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">심사 대기 내역이 없습니다</h3>
        <p className="text-sm text-gray-500">현재 심사 중이거나 대기 중인 이체 건이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {transfers.map((item, idx) => (
        <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-500">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{item.amount.toLocaleString()}원</p>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <span>{item.address}</span>
              </p>
            </div>
          </div>
          <div className="px-4 py-2 bg-orange-50 text-orange-600 font-bold text-sm rounded-full">
            {item.status}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TransferPage() {
  const [activeTab, setActiveTab] = useState<'transfer' | 'pending'>('transfer');

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">이체</h2>
        <p className="mt-2 text-sm text-gray-500">일반 이체 또는 심사를 거치는 이체를 진행할 수 있습니다.</p>
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('transfer')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'transfer'
              ? 'bg-gray-900 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <Send className="w-4 h-4" />
          이체하기
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-gray-900 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          심사 대기 내역
        </button>
      </div>

      <div className="transition-all">
        {activeTab === 'transfer' ? <TransferForm /> : <PendingTransferList />}
      </div>
    </div>
  );
}
