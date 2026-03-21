import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/axios';

export interface CreateSplitBillRequest {
  requesterAccountAddress: string;
  totalAmount: number;
  splitType: 'EQUAL' | 'EXACT';
  participants: number[];
  ratios?: { participantId: number, ratio: number }[];
}

export interface PaySplitBillRequest {
  splitBillId: number;
  payerAccountAddress: string;
}

export const useCreateSplitBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (req: CreateSplitBillRequest) => {
      const { data } = await api.post('/splitbills', req);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['splitbills', 'opened'] });
    },
  });
};

export const usePaySplitBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (req: PaySplitBillRequest) => {
      const { data } = await api.post('/splitbills/pay', req);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['splitbills', 'requested'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] }); // 결제가 발생했으므로 계좌 잔액 최신화
      queryClient.invalidateQueries({ queryKey: ['transferHistory'] });
    },
  });
};
