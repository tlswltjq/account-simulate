import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/axios';

export interface Account {
  accountAddress: string;
  accountType: 'GENERAL' | 'SAVING';
  balance: number;
}

export interface AccountListResponse {
  accounts: Account[];
}

export const useAccounts = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      // 자체 API Route를 타고 백엔드로 Proxy
      const { data } = await api.get('/finance/accounts');
      return data.data as AccountListResponse;
    },
    // 옵저버블 설정 (에러시 재시도 등)
    retry: 1,
    staleTime: 1000 * 30, // 30초
  });
};

export interface TransferResponse {
  amount: number;
  counterpartyAddress: string;
  createdAt: string;
}

export const useTransferHistory = (accountAddress?: string) => {
  return useQuery({
    queryKey: ['transferHistory', accountAddress],
    queryFn: async () => {
      const { data } = await api.get(`/finance/history?accountAddress=${accountAddress}`);
      return data.data?.history || [];
    },
    enabled: !!accountAddress,
    retry: 1,
  });
};

export interface PendingTransfer {
  transferId: number;
  address: string;
  amount: number;
  status: string;
}

export interface ReviewRequestedTransferListResponse {
  reviewRequested: PendingTransfer[];
}

export const useReviewRequestedTransfers = () => {
  return useQuery({
    queryKey: ['reviewRequestedTransfers'],
    queryFn: async () => {
      const { data } = await api.get('/finance/transfers/review');
      return data.data as ReviewRequestedTransferListResponse;
    },
    retry: 1,
  });
};
