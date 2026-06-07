import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function SettingsScreen() {
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });
  const [simulateAdmin, setSimulateAdmin] = useState(() => {
    return localStorage.getItem('simulate_admin') === 'true';
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setYear(data.year || 'Year 1');
          setSemester(data.semester || 'Semester 1');
          if (data.theme) {
            setTheme(data.theme);
            if (data.theme === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
        }
      }
    };
    fetchUserData();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setIsSaving(true);
    setMessage('');
    try {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(docRef, {
        year,
        semester,
        theme,
        updatedAt: serverTimestamp()
      });
      setMessage('Settings updated successfully.');
    } catch (err: any) {
      setMessage('Error updating settings: ' + err.message);
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md gap-4 transition-colors">
        <h2 className="text-xl font-extrabold text-[#0D1E36] dark:text-white tracking-tight">App Settings</h2>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md transition-colors">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Interface Theme</label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => toggleTheme()}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-[#0D1E36] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D1E36] focus:ring-offset-2"
              >
                <span
                  className={`${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </button>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                {theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
              </span>
            </div>
          </div>

          <hr className="border-slate-150 dark:border-slate-700" />

          {/* Admin Simulation for Reviewers */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Admin Testing Bypass</label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => {
                  const nextSim = !simulateAdmin;
                  setSimulateAdmin(nextSim);
                  localStorage.setItem('simulate_admin', String(nextSim));
                  window.location.reload();
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-[#00A896] focus:ring-2 focus:ring-offset-2 ${
                  simulateAdmin ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-[#0D1E36]'
                }`}
              >
                <span
                  className={`${
                    simulateAdmin ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </button>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                {simulateAdmin ? 'Administrative Mode Enabled' : 'Simulate Student Role'}
              </span>
            </div>
          </div>

          <hr className="border-slate-150 dark:border-slate-700" />

          {/* Premium Simulation for Reviewers */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Premium subscription Simulation</label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => {
                  const currentPremium = localStorage.getItem('simulate_premium') === 'true';
                  const nextPremium = !currentPremium;
                  localStorage.setItem('simulate_premium', String(nextPremium));
                  window.location.reload();
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-[#00A896] focus:ring-2 focus:ring-offset-2 ${
                  localStorage.getItem('simulate_premium') === 'true' ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-[#0D1E36]'
                }`}
              >
                <span
                  className={`${
                    localStorage.getItem('simulate_premium') === 'true' ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </button>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                {localStorage.getItem('simulate_premium') === 'true' ? 'Premium Paid Account Activated' : 'Standard (Free) Subscription'}
              </span>
            </div>
          </div>
          
          <hr className="border-slate-100 dark:border-slate-700" />

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Academic Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 dark:text-white text-slate-900 font-medium focus:ring-2 focus:ring-[#0D1E36] focus:border-transparent outline-none transition-colors"
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
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 dark:text-white text-slate-900 font-medium focus:ring-2 focus:ring-[#0D1E36] focus:border-transparent outline-none transition-colors"
            >
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full md:w-auto bg-[#0D1E36] hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md text-sm tracking-wide"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>

          {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm font-bold ${message.includes('Error') ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
