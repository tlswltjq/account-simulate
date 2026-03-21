import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/axios';

export const useAddFriend = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post('/members/friends', { email });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
};

export const useAcceptFriend = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (friendshipId: number) => {
      const { data } = await api.post(`/members/friends/${friendshipId}/accept`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
};

export const useRejectFriend = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (friendshipId: number) => {
      const { data } = await api.post(`/members/friends/${friendshipId}/reject`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
};

export const useDeleteFriend = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (friendshipId: number) => {
      const { data } = await api.delete(`/members/friends/${friendshipId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
};
