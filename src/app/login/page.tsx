import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-8 bg-gray-50 h-full">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white mb-4 shadow-lg shadow-blue-200">
            <svg xmlns="http://www.w3.org/Dom/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mini Pay</h1>
          <p className="text-blue-600/80 mt-2 font-medium">더치페이를 가장 쉽게</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
