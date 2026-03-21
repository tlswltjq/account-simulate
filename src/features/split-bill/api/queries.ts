import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/axios';

export interface ShareInfo {
  participantId: number;
  amount: number;
  paidAt?: string;
}

export interface SplitBillItem {
  splitBillId: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELED';
  totalAmount: number;
  paid: ShareInfo[];
  unPaid: ShareInfo[];
  openedAt: string;
}

export interface SplitBillListResponse {
  splitBills: SplitBillItem[];
}

export const useRequestedSplitBills = () => {
  return useQuery({
    queryKey: ['splitbills', 'requested'],
    queryFn: async () => {
      const { data } = await api.get('/splitbills/requested');
      return data.data?.splitBills || data.data || [];
    },
    staleTime: 1000 * 30,
  });
};

export const useOpenedSplitBills = () => {
  return useQuery({
    queryKey: ['splitbills', 'opened'],
    queryFn: async () => {
      const { data } = await api.get('/splitbills/opened');
      return data.data?.splitBills || data.data || [];
    },
    staleTime: 1000 * 30,
  });
};
