import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu } from 'lucide-react';
import { auth, db, OperationType, handleFirestoreError } from './lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { INITIAL_COURSES } from './data';
import { Module, Lesson } from './types';
import Sidebar from './components/Sidebar';
import VideoPlayer from './components/VideoPlayer';
import CourseContent from './components/CourseContent';
import LessonOverview from './components/LessonOverview';
import CourseProgressCard from './components/CourseProgressCard';
import UploadVideoModal from './components/UploadVideoModal';
import { HomeView, CoursesView, ProfileView } from './components/OtherViews';
import AuthScreen from './components/AuthScreen';
import OnboardingScreen from './components/OnboardingScreen';
import SettingsScreen from './components/SettingsScreen';
import LessonComments from './components/LessonComments';
import AdminScreen from './components/AdminScreen';

export default function App() {
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [activeCourseId, setActiveCourseId] = useState<string>('thermo-ii');
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Auth states
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Lesson completions set tracking per-user
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());

  // Real-time course fetch and admin role synchronization
  useEffect(() => {
    if (!user) return;

    // Set Admin Role
    const checkRole = () => {
      const simulated = localStorage.getItem('simulate_admin') === 'true';
      if (user.email === 'richmond006mensah@gmail.com' || simulated) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };
    checkRole();

    // Fetch Completed Lessons from localStorage to keep it personal
    try {
      const storedCompletion = localStorage.getItem(`completed_lessons_${user.uid}`);
      if (storedCompletion) {
        setCompletedLessonIds(new Set(JSON.parse(storedCompletion)));
      } else {
        setCompletedLessonIds(new Set());
      }
    } catch (e) {
      console.error("Load completions fail:", e);
    }

    // Subscribe to shared courses list in firestore
    const coursesCollection = collection(db, 'courses');
    const unsubscribe = onSnapshot(coursesCollection, async (snapshot) => {
      if (snapshot.empty) {
        // Build the Initial Seed to database so the database is populated on first login
        try {
          for (const [courseId, courseData] of Object.entries(INITIAL_COURSES)) {
            await setDoc(doc(db, 'courses', courseId), {
              id: courseId,
              title: courseData.title,
              modules: courseData.modules
            });
          }
        } catch (err) {
          console.error("Courses seeding issue:", err);
        }
      } else {
        const loaded: { [courseId: string]: { title: string; modules: Module[] } } = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          loaded[doc.id] = {
            title: data.title || '',
            modules: data.modules || []
          };
        });
        setCourses(loaded);
      }
    }, (error) => {
      console.error("Courses onSnapshot error", error);
      handleFirestoreError(error, OperationType.LIST, 'courses');
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check if user requires onboarding
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          setNeedsOnboarding(true);
        } else {
          setNeedsOnboarding(false);
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Safe default lesson check
  const FALLBACK_LESSON: Lesson = {
    id: 'placeholder',
    title: 'No Lesson Selected',
    duration: '0 min',
    completed: false,
    overview: 'Please select or add a course and lesson in the Admin panel.',
    resources: [],
    thumbnail: ''
  };

  const activeCourse = courses[activeCourseId] || Object.values(courses)[0];
  const initialLesson = activeCourse?.modules?.[0]?.lessons?.[0] || FALLBACK_LESSON;
  
  const [activeLesson, setActiveLesson] = useState<Lesson>(initialLesson);
  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(false);
  
  const [activeTab, setActiveTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  // Auto-set activeCourseId to first available course if current selection is invalid
  useEffect(() => {
    const courseKeys = Object.keys(courses);
    if (courseKeys.length > 0 && !courses[activeCourseId]) {
      setActiveCourseId(courseKeys[0]);
    }
  }, [courses, activeCourseId]);

  // Sync activeLesson if a course swap occurs or courses load
  useEffect(() => {
    const course = courses[activeCourseId] || Object.values(courses)[0];
    if (course && course.modules?.[0]?.lessons?.[0]) {
      // Find matching lesson to keep the highlighted object up to date
      const found = course.modules.flatMap(m => m.lessons).find(l => l.id === activeLesson.id);
      if (found) {
        setActiveLesson(found);
      } else {
        setActiveLesson(course.modules[0].lessons[0]);
      }
    }
  }, [activeCourseId, courses]);
  
  const userEmail = user?.email || "";
  const userName = user?.displayName || "Student";

  // Derive dynamic modular syllabus with mapped lesson completions per user
  const resolvedModules = (courses[activeCourseId]?.modules || []).map((mod) => ({
    ...mod,
    lessons: (mod.lessons || []).map((less) => ({
      ...less,
      completed: completedLessonIds.has(less.id)
    }))
  }));

  const modules = resolvedModules;

  // Toggle complete state of a lesson by id (Persists in localStorage per user)
  const handleToggleComplete = (lessonId: string) => {
    setCompletedLessonIds((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      if (user) {
        localStorage.setItem(`completed_lessons_${user.uid}`, JSON.stringify(Array.from(next)));
      }
      return next;
    });
  };

  // Toggle active lesson's own state
  const handleToggleActiveComplete = () => {
    handleToggleComplete(activeLesson.id);
  };

  // Update Overview edit and write to Firestore Course document
  const handleUpdateOverview = async (lessonId: string, newOverview: string) => {
    const activeObj = courses[activeCourseId];
    if (!activeObj) return;

    const updatedModules = activeObj.modules.map((mod) => ({
      ...mod,
      lessons: (mod.lessons || []).map((less) => {
        if (less.id === lessonId) {
          return { ...less, overview: newOverview };
        }
        return less;
      })
    }));

    try {
      await updateDoc(doc(db, 'courses', activeCourseId), {
        modules: updatedModules
      });
    } catch (e) {
      console.error("Overview update fail:", e);
    }
  };

  // Adding uploaded movie lesson and persisting to Firestore
  const handleAddLesson = async (moduleId: string, lessonData: { title: string; duration: string; overview: string }) => {
    const newLesson: Lesson = {
      id: `l_custom_${Date.now()}`,
      title: lessonData.title,
      duration: lessonData.duration,
      completed: false,
      overview: lessonData.overview,
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop',
      resources: [
        { id: `r_custom_s_${Date.now()}`, name: 'Lesson_Slides.pdf', type: 'pdf', url: '#' },
        { id: `r_custom_z_${Date.now()}`, name: 'Completed_Workspace_Snippet.zip', type: 'zip', url: '#' }
      ]
    };

    const activeObj = courses[activeCourseId];
    if (!activeObj) return;

    const updatedModules = activeObj.modules.map((mod) => {
      if (mod.id === moduleId) {
        return {
          ...mod,
          lessons: [...(mod.lessons || []), newLesson]
        };
      }
      return mod;
    });

    try {
      await updateDoc(doc(db, 'courses', activeCourseId), {
        modules: updatedModules
      });
    } catch (e) {
      console.error("Error adding lesson to firestore:", e);
    }
  };

  // Active Course specific counts
  const allLessons = modules.flatMap((m) => m.lessons);
  const totalLessonsCount = allLessons.length;
  const completedLessonsCount = allLessons.filter((l) => completedLessonIds.has(l.id)).length;
  const completionPercentage = totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;

  // Compute stats across all courses for listing
  const getCourseProgresses = () => {
    const progresses: { [key: string]: number } = {};
    Object.keys(courses).forEach((key) => {
      const ms = courses[key].modules || [];
      const ls = ms.flatMap((m) => m.lessons || []);
      const total = ls.length;
      const completed = ls.filter((l) => completedLessonIds.has(l.id)).length;
      progresses[key] = total > 0 ? Math.round((completed / total) * 100) : 0;
    });
    return progresses;
  };
  const courseProgresses = getCourseProgresses();

  // Compute active module index based on active selection (defaults to 0)
  const activeModuleIndex = Math.max(0, modules.findIndex((m) => m.lessons.some((l) => l.id === activeLesson.id)));

  // Construct resolved active lesson depending on view mode (Exclusively Solved Questions)
  const resolvedActiveLesson: Lesson = {
    ...activeLesson,
    title: activeLesson.solvedTitle ? activeLesson.solvedTitle : activeLesson.title,
    duration: activeLesson.solvedDuration ? activeLesson.solvedDuration : activeLesson.duration,
    overview: activeLesson.solvedOverview ? activeLesson.solvedOverview : activeLesson.overview,
    resources: activeLesson.solvedResources ? activeLesson.solvedResources : activeLesson.resources,
    completed: completedLessonIds.has(activeLesson.id)
  };

  // Switch course action
  const handleSelectCourse = (courseId: string) => {
    setActiveCourseId(courseId);
    const targetCourse = courses[courseId];
    if (targetCourse && targetCourse.modules.length > 0 && targetCourse.modules[0].lessons.length > 0) {
      setActiveLesson(targetCourse.modules[0].lessons[0]);
    }
  };

  // Navigation timeline trigger to shift modules
  const handleModuleTimelineSelect = (modIndex: number) => {
    const targetModule = modules[modIndex];
    if (targetModule && targetModule.lessons.length > 0) {
      setActiveLesson(targetModule.lessons[0]);
    }
  };

  // Selection callbacks
  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setIsPlayingVideo(true);
    setActiveTab('dashboard'); // Always return to dashboard classroom to view the lecture
  };

  const handleEnterClassroom = () => {
    setIsPlayingVideo(false);
    setActiveTab('dashboard');
  };

  if (authLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans"> Loading... </div>;
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (needsOnboarding) {
    return <OnboardingScreen onComplete={() => setNeedsOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans select-none transition-colors duration-200" id="learnflow-app-root">
      {/* Mobile Top App Bar */}
      <header className="md:hidden h-16 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between px-4 shrink-0 transition-colors duration-200 z-30 shadow-xs" id="mobile-top-bar">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors focus:outline-none border-0 cursor-pointer bg-transparent"
            id="mobile-hamburger-btn"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-8 h-8 flex items-center justify-center mr-1">
              <img
                src="/src/assets/images/logo_3d_1780805779310.png"
                alt="ExplainX"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-lg font-black tracking-tight text-[#0D1E36] dark:text-white">
              Explain<span className="text-[#E97426]">X</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div 
            onClick={() => setActiveTab('profile')}
            className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center cursor-pointer hover:opacity-90 active:scale-95 transition-all"
          >
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <div className="flex flex-1" id="main-content-row">
        {/* 2. Left/Mobile responsive Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={async (tab) => {
            if (tab === 'logout') {
              if (confirm("Are you sure you want to log out from ExplainX?")) {
                try {
                  await signOut(auth);
                  setActiveTab('home');
                } catch (error) {
                  console.error('Logout error:', error);
                }
              }
            } else {
              setActiveTab(tab);
            }
          }}
          userName={userName}
          userEmail={userEmail}
          isAdmin={isAdmin}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* 3. Render Area Pane */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto" id="dashboard-render-pane">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <HomeView
                  courses={courses}
                  onEnterClassroom={handleEnterClassroom}
                  completionPercentage={courseProgresses[activeCourseId]}
                  completedCount={allLessons.filter(l => l.completed).length}
                  totalCount={allLessons.length}
                  userEmail={userEmail}
                  userName={userName}
                  activeCourseId={activeCourseId}
                  activeCourseTitle={courses[activeCourseId]?.title || ''}
                  onSelectCourse={handleSelectCourse}
                  courseProgresses={courseProgresses}
                />
              </motion.div>
            )}

            {activeTab === 'courses' && (
              <motion.div
                key="courses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <CoursesView
                  courses={courses}
                  onEnterClassroom={handleEnterClassroom}
                  completionPercentage={courseProgresses[activeCourseId]}
                  completedCount={allLessons.filter(l => l.completed).length}
                  totalCount={allLessons.length}
                  userEmail={userEmail}
                  activeCourseId={activeCourseId}
                  onSelectCourse={handleSelectCourse}
                  courseProgresses={courseProgresses}
                />
              </motion.div>
            )}



            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <ProfileView 
                  userEmail={userEmail} 
                  userName={userName}
                  onSaveName={() => {}}
                />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <SettingsScreen />
              </motion.div>
            )}

            {activeTab === 'admin' && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <AdminScreen
                  courses={courses}
                  setCourses={setCourses}
                  isAdmin={isAdmin}
                />
              </motion.div>
            )}



             {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="space-y-6 max-w-[1400px] mx-auto"
                id="dashboard-view-wrapper"
              >
                {/* Inner Breadcrumb and Title line */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md gap-4 transition-colors" id="classroom-sub-header">
                  <div className="text-left" id="breadcrumb-box">
                    <h1 className="text-xl font-extrabold text-slate-900 dark:text-white font-sans tracking-tight">{courses[activeCourseId]?.title || 'Chemical Engineering'} Learning Studio</h1>
                    <p className="text-xs text-slate-500 font-semibold font-sans mt-0.5">
                      My Courses <span className="text-slate-400 mx-1">&gt;</span> {courses[activeCourseId]?.title || 'Active Course'} <span className="text-slate-400 mx-1">&gt;</span> {activeLesson.title} <span className="text-slate-400 mx-1">&gt;</span> <span className="text-[#00A896]">Tutorial Solutions</span>
                    </p>
                  </div>
                </div>

                {/* Bento Content Grid: Conditional render based on isPlayingVideo */}
                <div className="grid grid-cols-1 gap-6" id="dashboard-classroom-grid">
                  
                  {isPlayingVideo ? (
                    <div className="space-y-6 flex flex-col justify-between max-w-5xl mx-auto w-full" id="video-and-overview-column">
                      <button 
                        onClick={() => setIsPlayingVideo(false)}
                        className="self-start px-4 py-2 bg-white text-slate-600 rounded-lg shadow-sm border border-slate-200 text-sm font-bold flex items-center space-x-2 hover:bg-slate-50 transition-colors"
                      >
                        <span className="text-lg leading-none font-black">&larr;</span> 
                        <span>Back to Course Contents</span>
                      </button>
                      
                      {/* Custom Video Player HUD */}
                      <VideoPlayer
                        lesson={resolvedActiveLesson}
                        onToggleComplete={handleToggleActiveComplete}
                      />

                      {/* Micro-grid underneath Video Player: Overview & Materials */}
                      <div className="grid grid-cols-1 gap-6" id="overview-materials-subgrid">
                        <div id="wrapper-overview">
                          <LessonOverview
                            lesson={resolvedActiveLesson}
                            onUpdateOverview={handleUpdateOverview}
                          />
                          <LessonComments lesson={resolvedActiveLesson} user={user} isAdmin={isAdmin} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 flex flex-col justify-between max-w-4xl mx-auto w-full" id="chapters-and-progress-column">
                      <div className="flex-1" id="curriculum-outer-wrap">
                        <CourseContent
                          modules={modules}
                          activeLesson={activeLesson}
                          onSelectLesson={handleSelectLesson}
                          onToggleComplete={handleToggleComplete}
                          searchQuery={searchQuery}
                          setSearchQuery={setSearchQuery}
                        />
                      </div>

                      {/* Completeness bar & slider widget */}
                      <div id="outer-progress-wrap" className="shrink-0 mt-2">
                        <CourseProgressCard
                          completionPercentage={completionPercentage}
                          totalLessonsCount={totalLessonsCount}
                          completedLessonsCount={completedLessonsCount}
                          activeModuleIndex={activeModuleIndex}
                          onModuleTimelineSelect={handleModuleTimelineSelect}
                        />
                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* 4. Upload Lecture Overlay Modal */}
      {showUploadModal && (
        <UploadVideoModal
          onClose={() => setShowUploadModal(false)}
          moduleOptions={modules.map((m) => ({ id: m.id, title: m.title }))}
          onAddLesson={handleAddLesson}
        />
      )}
    </div>
  );
}
