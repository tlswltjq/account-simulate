import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/axios';

interface ChargeAccountRequest {
  accountNumber: string;
  amount: number;
}

interface TransferRequest {
  senderAccountNumber: string;
  receiverAccountNumber: string;
  amount: number;
}

export const useChargeAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (req: ChargeAccountRequest) => {
      const { data } = await api.post('/finance/accounts/charge', req);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useTransfer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (req: TransferRequest) => {
      const { data } = await api.post('/finance/transfers', req);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transferHistory'] });
    },
  });
};

export const useTransferWithReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (req: TransferRequest) => {
      const { data } = await api.post('/finance/transfers/review', req);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transferHistory'] });
      queryClient.invalidateQueries({ queryKey: ['reviewRequestedTransfers'] });
    },
  });
};

export const useCreateSavingAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (linkedAccountNumber: string) => {
      const { data } = await api.post('/finance/accounts/saving', { linkedAccountNumber });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useCreateGeneralAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/finance/accounts/general');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};
