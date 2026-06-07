import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function SettingsScreen() {
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
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
        }
      }
    };
    fetchUserData();
  }, []);

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-sm gap-4">
        <h2 className="text-xl font-extrabold text-[#0D1E36] tracking-tight">Academic Settings</h2>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Academic Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-[#0D1E36] focus:border-transparent outline-none"
            >
              <option value="Year 1">Year 1</option>
              <option value="Year 2">Year 2</option>
              <option value="Year 3">Year 3</option>
              <option value="Year 4">Year 4</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-[#0D1E36] focus:border-transparent outline-none"
            >
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="bg-[#0D1E36] text-white font-bold py-2.5 px-6 rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>

          {message && (
            <div className={`mt-4 text-sm font-medium ${message.includes('Error') ? 'text-red-500' : 'text-emerald-500'}`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
