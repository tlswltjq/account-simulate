import { SignupForm } from '@/features/auth/components/SignupForm';

export default function SignupPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-8 bg-gray-50 h-full">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">회원가입</h1>
          <p className="text-gray-500 mt-2 font-medium">서비스 이용을 위해 계정을 생성합니다</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <SignupForm />
        </div>
      </div>
    </main>
  );
}
