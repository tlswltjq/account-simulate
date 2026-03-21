'use client';

import { useState } from 'react';
import { useFriends } from '../api/queries';
import { useAddFriend, useAcceptFriend, useRejectFriend } from '../api/mutations';
import { Loader2 } from 'lucide-react';

export function FriendList() {
  const { data, isLoading, isError } = useFriends();
  const addMutation = useAddFriend();
  const acceptMutation = useAcceptFriend();
  const rejectMutation = useRejectFriend();
  const [email, setEmail] = useState('');

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    addMutation.mutate(email, {
      onSuccess: () => {
        alert('친구 요청을 보냈습니다.');
        setEmail('');
      },
      onError: (err: any) => alert(err.response?.data?.message || '실패했습니다.'),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return <div className="p-4 text-red-500 text-sm">친구 목록을 불러오지 못했습니다.</div>;
  }

  const friends = data?.friends || [];

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-base font-bold text-gray-900 mb-4">친구 추가</h3>
        <form onSubmit={handleAddFriend} className="flex gap-2">
          <input
            type="email"
            placeholder="이메일 주소 입력"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
          />
          <button
            type="submit"
            disabled={addMutation.isPending}
            className="px-5 py-3 bg-blue-600 text-white font-bold rounded-xl text-sm transition-colors hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
          >
            요청
          </button>
        </form>
      </section>

      <section>
        <h3 className="text-base font-bold text-gray-900 mb-3 px-1">내 친구 ({friends.length})</h3>
        {friends.length > 0 ? (
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 divide-y divide-gray-50">
            {friends.map((friend, idx) => (
              <div key={idx} className="py-3 px-2 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                     {(friend.name || friend.email).substring(0, 1).toUpperCase()}
                   </div>
                   <div>
                     <p className="font-bold text-sm text-gray-900">{friend.name} ({friend.nickname})</p>
                     <p className="text-xs text-gray-500 mt-0.5">{friend.email}</p>
                   </div>
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center">
            <p className="text-sm text-gray-500">등록된 친구가 없습니다.</p>
          </div>
        )}
      </section>
    </div>
  );
}
