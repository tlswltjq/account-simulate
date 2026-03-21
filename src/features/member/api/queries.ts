import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/axios';

export interface Friendship {
  name: string;
  nickname: string;
  email: string;
}

export interface FriendListResponse {
  friends: Friendship[];
}

export const useFriends = () => {
  return useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const { data } = await api.get('/members/friends');
      return data.data as FriendListResponse;
    },
    staleTime: 1000 * 60, // 1분
  });
};
