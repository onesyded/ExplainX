import React, { useState, useEffect } from 'react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, setDoc, updateDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { 
  Plus, FolderPlus, Film, BookOpen, MessageSquare, Check, HelpCircle, 
  Trash2, Layers, Video, FileText, ExternalLink, RefreshCw 
} from 'lucide-react';
import { Module, Lesson, Resource } from '../types';

interface AdminScreenProps {
  courses: { [courseId: string]: { title: string; modules: Module[] } };
  setCourses: React.Dispatch<React.SetStateAction<{ [courseId: string]: { title: string; modules: Module[] } }>>;
  isAdmin: boolean;
}

interface StudentComment {
  id: string;
  lessonId: string;
  courseId: string;
  userId: string;
  userName: string;
  text: string;
  replyText?: string;
  createdAt: any;
}

export default function AdminScreen({ courses, setCourses, isAdmin }: AdminScreenProps) {
  const [activeSubTab, setActiveSubTab] = useState<'content' | 'inbox'>('content');
  
  // Course/Module form states
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseId, setNewCourseId] = useState('');
  
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [newModuleTitle, setNewModuleTitle] = useState('');
  
  // Lesson/Lecture form states
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonMins, setNewLessonMins] = useState('10');
  const [newLessonSecs, setNewLessonSecs] = useState('00');
  const [newLessonOverview, setNewLessonOverview] = useState('');
  const [pdfResourceUrl, setPdfResourceUrl] = useState('');
  const [zipResourceUrl, setZipResourceUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [solvedVideoUrl, setSolvedVideoUrl] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  
  // Student Inbox state
  const [studentComments, setStudentComments] = useState<StudentComment[]>([]);
  const [adminReplyTextMap, setAdminReplyTextMap] = useState<Record<string, string>>({});
  
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Set default selected course
  useEffect(() => {
    const courseIds = Object.keys(courses);
    if (courseIds.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courseIds[0]);
    }
  }, [courses, selectedCourseId]);

  // Set default selected module when course changes
  useEffect(() => {
    if (selectedCourseId && courses[selectedCourseId]) {
      const firstMod = courses[selectedCourseId].modules[0];
      if (firstMod) {
        setSelectedModuleId(firstMod.id);
      } else {
        setSelectedModuleId('');
      }
    }
  }, [selectedCourseId, courses]);

  // Fetch all comments in real-time across all courses for the admin inbox
  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: StudentComment[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() } as StudentComment);
      });
      setStudentComments(data);
    }, (error) => {
      console.error("Inbox comments load issue:", error);
      handleFirestoreError(error, OperationType.LIST, 'comments');
    });
    return () => unsubscribe();
  }, []);

  const triggerStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  // Add a brand-new course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) {
      triggerStatus('error', 'Please provide a Course Title.');
      return;
    }
    const generatedId = newCourseId.trim().toLowerCase().replace(/\s+/g, '-') || 
                       newCourseTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    if (courses[generatedId]) {
      triggerStatus('error', 'A course with this ID already exists!');
      return;
    }

    setIsSaving(true);
    try {
      await setDoc(doc(db, 'courses', generatedId), {
        id: generatedId,
        title: newCourseTitle.trim(),
        modules: []
      });
      setNewCourseTitle('');
      setNewCourseId('');
      setSelectedCourseId(generatedId);
      triggerStatus('success', `Course "${newCourseTitle}" created successfully!`);
    } catch (err: any) {
      triggerStatus('error', 'Failed to save course: ' + err.message);
    }
    setIsSaving(false);
  };

  // Add a Module / Chapter to selected Course
  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      triggerStatus('error', 'Please select or create a course first.');
      return;
    }
    if (!newModuleTitle.trim()) {
      triggerStatus('error', 'Please specify a chapter or section title.');
      return;
    }

    setIsSaving(true);
    try {
      const courseRef = doc(db, 'courses', selectedCourseId);
      const activeObj = courses[selectedCourseId];
      const newModuleObj: Module = {
        id: `mod_${Date.now()}`,
        title: newModuleTitle.trim(),
        lessons: []
      };
      
      const updatedModules = [...(activeObj.modules || []), newModuleObj];
      await updateDoc(courseRef, {
        modules: updatedModules
      });

      setNewModuleTitle('');
      setSelectedModuleId(newModuleObj.id);
      triggerStatus('success', `Syllabus Chapter "${newModuleTitle}" appended!`);
    } catch (err: any) {
      triggerStatus('error', 'Syllabus save failed: ' + err.message);
    }
    setIsSaving(false);
  };

  // Add a lecture/topic/video solved solution
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !selectedModuleId) {
      triggerStatus('error', 'Make sure course and target module are specified.');
      return;
    }
    if (!newLessonTitle.trim()) {
      triggerStatus('error', 'Please provide a lesson topic title.');
      return;
    }
    if (!newLessonOverview.trim()) {
      triggerStatus('error', 'Please outline a quick lecture description.');
      return;
    }

    setIsSaving(true);
    try {
      const courseRef = doc(db, 'courses', selectedCourseId);
      const activeObj = courses[selectedCourseId];

      const durationString = `${newLessonMins.padStart(2, '0')}:${newLessonSecs.padStart(2, '0')}`;
      
      const resourceList: Resource[] = [];
      if (pdfResourceUrl.trim()) {
        resourceList.push({
          id: `res_pdf_${Date.now()}`,
          name: 'Lecture_Handout_Formulas.pdf',
          type: 'pdf',
          url: pdfResourceUrl.trim()
        });
      }
      if (zipResourceUrl.trim()) {
        resourceList.push({
          id: `res_zip_${Date.now()}`,
          name: 'Solved_Tutorial_Code_Snippet.zip',
          type: 'zip',
          url: zipResourceUrl.trim()
        });
      }

      const newLessonObj: Lesson = {
        id: `less_${Date.now()}`,
        title: newLessonTitle.trim(),
        duration: durationString,
        completed: false,
        overview: newLessonOverview.trim(),
        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop',
        videoUrl: videoUrl.trim() || undefined,
        solvedVideoUrl: solvedVideoUrl.trim() || undefined,
        isPremium: isPremium,
        resources: resourceList.length > 0 ? resourceList : [
          { id: `r_d_${Date.now()}`, name: 'Tutorial_Exercise.pdf', type: 'pdf', url: '#' }
        ],
        solvedTitle: `${newLessonTitle.trim()} (Solved Question)`,
        solvedDuration: durationString,
        solvedOverview: `Detailed chemical engineering step-by-step solved walkthrough for: ${newLessonTitle.trim()}.\n\nOverview:\n${newLessonOverview.trim()}`,
        solvedThumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop',
        solvedResources: resourceList.length > 0 ? resourceList : [
          { id: `r_d_s_${Date.now()}`, name: 'Walkthrough_Notes_Handout.pdf', type: 'pdf', url: '#' }
        ]
      };

      const updatedModules = activeObj.modules.map(mod => {
        if (mod.id === selectedModuleId) {
          return {
            ...mod,
            lessons: [...(mod.lessons || []), newLessonObj]
          };
        }
        return mod;
      });

      await updateDoc(courseRef, {
        modules: updatedModules
      });

      // Reset fields
      setNewLessonTitle('');
      setNewLessonOverview('');
      setPdfResourceUrl('');
      setZipResourceUrl('');
      setVideoUrl('');
      setSolvedVideoUrl('');
      setIsPremium(false);
      triggerStatus('success', `Video Topic "${newLessonTitle}" added to current curriculum!`);
    } catch (err: any) {
      triggerStatus('error', 'Failed adding lesson: ' + err.message);
    }
    setIsSaving(false);
  };

  // Reply as Admin to Student Discussion Forums centrally
  const handleReplyStudentPost = async (commentId: string) => {
    const text = adminReplyTextMap[commentId];
    if (!text?.trim()) return;

    try {
      await updateDoc(doc(db, 'comments', commentId), {
        replyText: text.trim(),
        updatedAt: serverTimestamp()
      });
      setAdminReplyTextMap(prev => ({ ...prev, [commentId]: '' }));
      triggerStatus('success', 'Teaching reply successfully posted to lesson discussion catalog!');
    } catch (err: any) {
      triggerStatus('error', 'Could not post administrative reply: ' + err.message);
    }
  };

  const unansweredComments = studentComments.filter(c => !c.replyText);

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none text-left">
      
      {/* Admin Title Block */}
      <div className="bg-gradient-to-r from-[#0D1E36] to-indigo-950 text-white p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
            Explain<span className="text-[#E97426]">X</span> Academic Portal
          </h2>
          <p className="text-xs text-slate-300 font-semibold mt-1">
            Curriculum, Classroom Syllabus, Video Lectures and Discussion Management Engine
          </p>
        </div>
        
        {/* Sub Navigation controls */}
        <div className="flex bg-slate-900/30 p-1.5 rounded-xl border border-white/10 shrink-0">
          <button
            onClick={() => setActiveSubTab('content')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'content' 
                ? 'bg-white text-slate-900 shadow-md' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manage Curriculum</span>
          </button>
          <button
            onClick={() => setActiveSubTab('inbox')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all relative ${
              activeSubTab === 'inbox' 
                ? 'bg-white text-slate-900 shadow-md' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Student Inbox</span>
            {unansweredComments.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#E97426] text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0D1E36] animate-pulse">
                {unansweredComments.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Floating Action Alerts */}
      {statusMessage && (
        <div className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-2xl z-50 animate-bounce flex items-center space-x-2.5 max-w-md ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-600 border border-emerald-500 text-white' 
            : 'bg-rose-600 border border-rose-500 text-white'
        }`}>
          <Check className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold tracking-wide">{statusMessage.text}</span>
        </div>
      )}

      {/* Render Main Selected Portal Pane */}
      {activeSubTab === 'content' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Block - Course Selection, Course Creation & Chapter Management */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Create Course segment */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg transition-colors">
              <div className="flex items-center space-x-2 mb-4 border-b border-slate-50 dark:border-slate-700 pb-2.5">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                <h3 className="font-extrabold text-[#0D1E36] dark:text-white tracking-tight text-base">Add New Course</h3>
              </div>
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">Course Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chemical Process Synthesis"
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    className="w-full text-sm border border-slate-200 focus:ring-2 focus:ring-[#0D1E36] outline-none px-3.5 py-2.5 rounded-xl text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">Database URI Key (Optional ID)</label>
                  <input
                    type="text"
                    placeholder="e.g. process-synthesis"
                    value={newCourseId}
                    onChange={(e) => setNewCourseId(e.target.value)}
                    className="w-full text-sm border border-slate-200 focus:ring-2 focus:ring-[#0D1E36] outline-none px-3.5 py-2.5 rounded-xl text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-colors animate-fade-in"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-[#0D1E36] hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition-transform active:scale-95 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Create Course'}</span>
                </button>
              </form>
            </div>

            {/* 2. Create Module / Chapter block */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg transition-colors">
              <div className="flex items-center space-x-2 mb-4 border-b border-slate-50 dark:border-slate-700 pb-2.5">
                <FolderPlus className="w-5 h-5 text-[#E97426]" />
                <h3 className="font-extrabold text-[#0D1E36] dark:text-white tracking-tight text-base">Add Chapter to Course</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">Select Target Course</label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white text-sm outline-none px-3 py-2.5 rounded-xl font-semibold"
                  >
                    {Object.keys(courses).map(id => (
                      <option key={id} value={id}>{courses[id]?.title}</option>
                    ))}
                    {Object.keys(courses).length === 0 && (
                      <option value="">No Active Courses Configured</option>
                    )}
                  </select>
                </div>

                <form onSubmit={handleCreateModule} className="space-y-4 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">Chapter Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chapter 4: Distillation Column Sizing"
                      value={newModuleTitle}
                      onChange={(e) => setNewModuleTitle(e.target.value)}
                      className="w-full text-sm border border-slate-200 focus:ring-2 focus:ring-[#0D1E36] outline-none px-3.5 py-2.5 rounded-xl text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSaving || !selectedCourseId}
                    className="w-full bg-[#E97426] hover:bg-[#d4661e] text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition-transform active:scale-95 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Chapter / Module</span>
                  </button>
                </form>
              </div>
            </div>

          </div>

          {/* Right Block - Add Topic Solutions / Video Lecture Details */}
          <div className="lg:col-span-7">
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg transition-colors h-full">
              <div className="flex items-center space-x-2 mb-4 border-b border-slate-50 dark:border-slate-700 pb-2.5">
                <Film className="w-5 h-5 text-indigo-500 animate-pulse" />
                <h3 className="font-extrabold text-[#0D1E36] dark:text-white tracking-tight text-base">Upload Video Solutions & Lectures</h3>
              </div>

              <form onSubmit={handleCreateLesson} className="space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">Select Course</label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs outline-none p-2.5 rounded-xl font-semibold"
                    >
                      {Object.keys(courses).map(id => (
                        <option key={id} value={id}>{courses[id]?.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">Select Chapter</label>
                    <select
                      value={selectedModuleId}
                      onChange={(e) => setSelectedModuleId(e.target.value)}
                      className="w-full border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs outline-none p-2.5 rounded-xl font-semibold"
                    >
                      {selectedCourseId && courses[selectedCourseId]?.modules?.map(m => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                      {(!selectedCourseId || !courses[selectedCourseId] || courses[selectedCourseId]?.modules?.length === 0) && (
                        <option value="">-- No Chapters Appended Yet --</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">Lecture / Solution Topic</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Walkthrough: Multi-Component Vapor Liquid Equilibrium Proof"
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    className="w-full text-sm border border-slate-200 focus:ring-2 focus:ring-[#0D1E36] outline-none px-3 py-2.5 rounded-xl text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">Duration (Minutes)</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={newLessonMins}
                      onChange={(e) => setNewLessonMins(e.target.value)}
                      className="w-full text-sm border border-slate-200 focus:ring-2 focus:ring-[#0D1E36] outline-none px-3 py-2 rounded-xl text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">Duration (Seconds)</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={newLessonSecs}
                      onChange={(e) => setNewLessonSecs(e.target.value)}
                      className="w-full text-sm border border-slate-200 focus:ring-2 focus:ring-[#0D1E36] outline-none px-3 py-2 rounded-xl text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">Overview Description (Chemical Solver Walkthrough Details)</label>
                  <textarea
                    required
                    placeholder="Provide a quick chemical engineering overview, process steps, equations or tips discussed..."
                    value={newLessonOverview}
                    onChange={(e) => setNewLessonOverview(e.target.value)}
                    className="w-full text-sm border border-slate-200 focus:ring-2 focus:ring-[#0D1E36] outline-none p-3 rounded-xl text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-colors h-24"
                  />
                </div>

                {/* Video URLs inputs */}
                <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-700">
                  <h4 className="text-[10px] uppercase font-extrabold text-[#0D1E36] dark:text-white tracking-wide block">Video Broadcast Media (Paste YouTube Links)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-400 block">Theory Video url (YouTube or Direct Link)</label>
                      <input
                        type="text"
                        placeholder="e.g. https://www.youtube.com/watch?v=..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full text-xs border border-slate-200 focus:ring-2 focus:ring-[#0D1E36] outline-none px-3.5 py-2.5 rounded-xl text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-400 block">Solved walkthrough Video url (YouTube/Direct)</label>
                      <input
                        type="text"
                        placeholder="e.g. https://www.youtube.com/watch?v=..."
                        value={solvedVideoUrl}
                        onChange={(e) => setSolvedVideoUrl(e.target.value)}
                        className="w-full text-xs border border-slate-200 focus:ring-2 focus:ring-[#0D1E36] outline-none px-3.5 py-2.5 rounded-xl text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Premium Locking Toggle */}
                  <div className="flex items-start space-x-3 bg-slate-50 dark:bg-slate-900 p-3 border border-slate-150 dark:border-slate-700 rounded-xl mt-1.5">
                    <input
                      type="checkbox"
                      id="premium-checkbox"
                      checked={isPremium}
                      onChange={(e) => setIsPremium(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-[#0D1E36] mt-0.5 cursor-pointer"
                    />
                    <div className="flex-1">
                      <label htmlFor="premium-checkbox" className="text-xs font-bold text-slate-800 dark:text-slate-105 cursor-pointer block select-none">
                        🔒 Mark Lecture as Paid/Premium-Only
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium block leading-tight mt-0.5">
                        If checked, standard students will be blocked by a locking wall when trying to watch this lesson's video unless they possess a premium account.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <h4 className="text-[10px] uppercase font-extrabold text-[#0D1E36] dark:text-white tracking-wide">Support Materials (Mockup Resource URL Link)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      <input
                        type="text"
                        placeholder="Handouts Lecture.pdf URL"
                        value={pdfResourceUrl}
                        onChange={(e) => setPdfResourceUrl(e.target.value)}
                        className="bg-transparent text-xs w-full focus:outline-none dark:text-white"
                      />
                    </div>
                    <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <ExternalLink className="w-4 h-4 text-[#E97426] shrink-0" />
                      <input
                        type="text"
                        placeholder="Snippet Zip Solution URL"
                        value={zipResourceUrl}
                        onChange={(e) => setZipResourceUrl(e.target.value)}
                        className="bg-transparent text-xs w-full focus:outline-none dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving || !selectedModuleId}
                  className="w-full mt-2 bg-[#0C8B7F] hover:bg-[#086a61] text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center justify-center space-x-2 transition-transform active:scale-95 shadow-md shrink-0"
                >
                  <Video className="w-4 h-4" />
                  <span>{isSaving ? 'Compiling Solution...' : 'Add Solution and Broadcast'}</span>
                </button>
              </form>
            </div>

          </div>

        </div>
      ) : (
        /* Render Student Inbox / Discussion Forum Answers segment */
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl transition-colors min-h-[400px]">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-700 pb-3">
            <div className="flex items-center space-x-2.5">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              <h3 className="font-extrabold text-[#0D1E36] dark:text-white tracking-tight text-lg">Central student Questions & Forum Inbox</h3>
            </div>
            
            <span className="text-xs bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full text-slate-600 dark:text-slate-300 font-bold font-sans">
              Pending: {unansweredComments.length} Queries
            </span>
          </div>

          <div className="space-y-6">
            {unansweredComments.map((c) => (
              <div 
                key={c.id} 
                className="p-5 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-left transition-all hover:bg-slate-50/80 dark:hover:bg-slate-900/50"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3.5">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-sm flex items-center justify-center shrink-0 shadow-sm border border-indigo-200/20">
                      {c.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-sm tracking-tight flex items-center">
                        <span>{c.userName}</span>
                        <span className="mx-2 text-slate-300 font-normal">|</span>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md uppercase tracking-wider">Student</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        Asked on: {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleString() : 'Recently'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Context labels */}
                  <div className="flex flex-wrap gap-1.5" id="context-labels">
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                      Course: {c.courseId}
                    </span>
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-md font-bold uppercase tracking-wider truncate max-w-[180px]">
                      Lesson: {c.lessonId}
                    </span>
                  </div>
                </div>

                <div className="pl-12">
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-4 border-l-2 border-indigo-200 pl-4 py-0.5 italic">
                    "{c.text}"
                  </p>

                  {/* Immediate Reply formulation HUD */}
                  <div className="space-y-2 mt-4 max-w-2.5xl">
                    <textarea
                      value={adminReplyTextMap[c.id] || ''}
                      onChange={(e) => setAdminReplyTextMap(prev => ({ ...prev, [c.id]: e.target.value }))}
                      placeholder="Type official administrative reply / chemical guidance walkthrough..."
                      className="w-full text-xs p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none mb-2 text-slate-800 dark:text-white min-h-[70px] transition-colors"
                    />
                    <button
                      onClick={() => handleReplyStudentPost(c.id)}
                      disabled={!adminReplyTextMap[c.id]?.trim()}
                      className="text-xs font-bold bg-[#0C8B7F] hover:bg-[#086a61] disabled:bg-slate-200 disabled:dark:bg-slate-700 disabled:text-slate-400 text-white px-5 py-2 rounded-xl flex items-center space-x-2 transition-transform active:scale-95 shadow-md"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Post TA Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {unansweredComments.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-4" id="empty-inbox">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-905 text-emerald-600 rounded-full flex items-center justify-center animate-pulse">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-base font-extrabold text-slate-800 dark:text-white">All Clear! No Student Queries Pending</h4>
                <p className="text-xs text-slate-405 leading-relaxed max-w-md">
                  All discussion questions across all chemical modules have been answered by the Teaching Assistant team!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
