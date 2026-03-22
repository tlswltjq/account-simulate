import { FriendList } from '@/features/member/components/FriendList';

export default function FriendsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-gray-900">친구 목록</h2>
        </div>
        <FriendList />
      </main>
    </div>
  );
}
