import { useState } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { GraduationCap } from 'lucide-react';

export default function AuthScreen() {
  const [error, setError] = useState<string>('');

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err.message.includes('popup-closed-by-user')) {
        return; // Ignore this
      }
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-slate-200">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-[#0D1E36] flex items-center justify-center mb-6 shadow-md shadow-[#0D1E36]/20">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-[#0D1E36] [text-shadow:2px_2px_0px_#cbd5e1,4px_4px_0px_#94a3b8,5px_5px_4px_rgba(0,0,0,0.15)]">
          Explain<span className="text-[#E97426]">X</span>
        </h1>
        <p className="text-slate-500 text-center mb-8 text-sm font-medium">
          Sign in to access specific chemical engineering tutorial solutions.
        </p>

        {error && (
          <div className="w-full bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-6 border border-red-100">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-3 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>
    </div>
  );
}
