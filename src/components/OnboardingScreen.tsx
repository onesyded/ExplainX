import React, { useState } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [year, setYear] = useState('Year 1');
  const [semester, setSemester] = useState('Semester 1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setIsSubmitting(true);
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        userId: auth.currentUser.uid,
        email: auth.currentUser.email,
        year,
        semester,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      onComplete();
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
        <h2 className="text-2xl font-black text-[#0D1E36] dark:text-white mb-2 tracking-tight">Complete Profile</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm font-medium">Select your current academic standing to tailor your content.</p>

        {error && (
          <div className="w-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl mb-6 border border-red-100 dark:border-red-900/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Academic Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#0D1E36] focus:border-transparent outline-none"
            >
              <option value="Year 1">Year 1</option>
              <option value="Year 2">Year 2</option>
              <option value="Year 3">Year 3</option>
              <option value="Year 4">Year 4</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#0D1E36] focus:border-transparent outline-none"
            >
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#0D1E36] dark:bg-[#1a3a63] text-white font-bold py-3 px-4 rounded-xl hover:bg-slate-800 dark:hover:bg-[#153158] transition-colors mt-4 shadow-sm"
          >
            {isSubmitting ? 'Saving...' : 'Get Started'}
          </button>
        </form>
      </div>
    </div>
  );
}
