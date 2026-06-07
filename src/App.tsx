import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, CheckSquare } from 'lucide-react';
import { INITIAL_COURSES } from './data';
import { Module, Lesson } from './types';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import VideoPlayer from './components/VideoPlayer';
import CourseContent from './components/CourseContent';
import LessonOverview from './components/LessonOverview';
import ResourcesSection from './components/ResourcesSection';
import CourseProgressCard from './components/CourseProgressCard';
import UploadVideoModal from './components/UploadVideoModal';
import { HomeView, CoursesView, ProfileView, GlobalResourcesView, ReportsView } from './components/OtherViews';

export default function App() {
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [activeCourseId, setActiveCourseId] = useState<string>('thermo-ii');
  
  // Set default active lesson to the 5-minute Platform Orientation & Course Overview video
  const [activeLesson, setActiveLesson] = useState<Lesson>(INITIAL_COURSES['thermo-ii'].modules[0].lessons[0]);
  
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [lessonViewMode, setLessonViewMode] = useState<'concept' | 'solved'>('concept');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('Richmond');
  const userEmail = "richmond006mensah@gmail.com";

  // Derive dynamic modular syllabus for currently active course
  const modules = courses[activeCourseId]?.modules || [];

  // Toggle complete state of a lesson by id
  const handleToggleComplete = (lessonId: string) => {
    setCourses((prevCourses) => {
      const activeObj = prevCourses[activeCourseId];
      if (!activeObj) return prevCourses;

      const updatedModules = activeObj.modules.map((mod) => ({
        ...mod,
        lessons: mod.lessons.map((less) => {
          if (less.id === lessonId) {
            const updated = { ...less, completed: !less.completed };
            // Update active lesson if it is the toggled one
            if (activeLesson.id === lessonId) {
              setActiveLesson(updated);
            }
            return updated;
          }
          return less;
        })
      }));

      return {
        ...prevCourses,
        [activeCourseId]: {
          ...activeObj,
          modules: updatedModules
        }
      };
    });
  };

  // Toggle active lesson's own state
  const handleToggleActiveComplete = () => {
    handleToggleComplete(activeLesson.id);
  };

  // Update Overview edit
  const handleUpdateOverview = (lessonId: string, newOverview: string) => {
    setCourses((prevCourses) => {
      const activeObj = prevCourses[activeCourseId];
      if (!activeObj) return prevCourses;

      const updatedModules = activeObj.modules.map((mod) => ({
        ...mod,
        lessons: mod.lessons.map((less) => {
          if (less.id === lessonId) {
            const updated = { ...less, overview: newOverview };
            if (activeLesson.id === lessonId) {
              setActiveLesson(updated);
            }
            return updated;
          }
          return less;
        })
      }));

      return {
        ...prevCourses,
        [activeCourseId]: {
          ...activeObj,
          modules: updatedModules
        }
      };
    });
  };

  // Adding uploaded movie lesson
  const handleAddLesson = (moduleId: string, lessonData: { title: string; duration: string; overview: string }) => {
    const newLesson: Lesson = {
      id: `l_custom_${Date.now()}`,
      title: lessonData.title,
      duration: lessonData.duration,
      completed: false,
      overview: lessonData.overview,
      thumbnail: '/src/assets/images/teacher_react_lesson_1780368326324.png',
      resources: [
        { id: `r_custom_s_${Date.now()}`, name: 'Lesson_Slides.pdf', type: 'pdf', url: '#' },
        { id: `r_custom_z_${Date.now()}`, name: 'Completed_Workspace_Snippet.zip', type: 'zip', url: '#' }
      ]
    };

    setCourses((prevCourses) => {
      const activeObj = prevCourses[activeCourseId];
      if (!activeObj) return prevCourses;

      const updatedModules = activeObj.modules.map((mod) => {
        if (mod.id === moduleId) {
          return {
            ...mod,
            lessons: [...mod.lessons, newLesson]
          };
        }
        return mod;
      });

      return {
        ...prevCourses,
        [activeCourseId]: {
          ...activeObj,
          modules: updatedModules
        }
      };
    });
  };

  // Active Course specific counts
  const allLessons = modules.flatMap((m) => m.lessons);
  const totalLessonsCount = allLessons.length;
  const completedLessonsCount = allLessons.filter((l) => l.completed).length;
  const completionPercentage = totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;

  // Compute stats across all courses for listing
  const getCourseProgresses = () => {
    const progresses: { [key: string]: number } = {};
    Object.keys(courses).forEach((key) => {
      const ms = courses[key].modules;
      const ls = ms.flatMap((m) => m.lessons);
      const total = ls.length;
      const completed = ls.filter((l) => l.completed).length;
      progresses[key] = total > 0 ? Math.round((completed / total) * 100) : 0;
    });
    return progresses;
  };
  const courseProgresses = getCourseProgresses();

  // Compute active module index based on active selection (defaults to 0)
  const activeModuleIndex = Math.max(0, modules.findIndex((m) => m.lessons.some((l) => l.id === activeLesson.id)));

  // Construct resolved active lesson depending on view mode (Concept Explanation vs. Solved Questions)
  const resolvedActiveLesson: Lesson = {
    ...activeLesson,
    title: lessonViewMode === 'solved' && activeLesson.solvedTitle ? activeLesson.solvedTitle : activeLesson.title,
    duration: lessonViewMode === 'solved' && activeLesson.solvedDuration ? activeLesson.solvedDuration : activeLesson.duration,
    overview: lessonViewMode === 'solved' && activeLesson.solvedOverview ? activeLesson.solvedOverview : activeLesson.overview,
    resources: lessonViewMode === 'solved' && activeLesson.solvedResources ? activeLesson.solvedResources : activeLesson.resources,
  };

  // Switch course action
  const handleSelectCourse = (courseId: string) => {
    setActiveCourseId(courseId);
    const targetCourse = courses[courseId];
    if (targetCourse && targetCourse.modules.length > 0 && targetCourse.modules[0].lessons.length > 0) {
      setActiveLesson(targetCourse.modules[0].lessons[0]);
    }
    setLessonViewMode('concept');
  };

  // Navigation timeline trigger to shift modules
  const handleModuleTimelineSelect = (modIndex: number) => {
    const targetModule = modules[modIndex];
    if (targetModule && targetModule.lessons.length > 0) {
      setActiveLesson(targetModule.lessons[0]);
      setLessonViewMode('concept');
    }
  };

  // Selection callbacks
  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setLessonViewMode('concept');
    setActiveTab('dashboard'); // Always return to dashboard classroom to view the lecture
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none" id="learnflow-app-root">
      {/* 1. Header Navigation HUD */}
      <Header
        onUploadClick={() => setShowUploadModal(true)}
        activeTab={activeTab === 'dashboard' ? 'dashboard' : activeTab}
        setActiveTab={(tab) => {
          if (tab === 'logout') {
            if (confirm("Are you sure you want to log out from LearnFlow?")) {
              alert("Logged out successfully! Re-routing back to home.");
              setActiveTab('home');
            }
          } else {
            setActiveTab(tab);
          }
        }}
        userEmail={userEmail}
        userName={userName}
      />

      <div className="flex flex-1" id="main-content-row">
        {/* 2. Left Sidebar Navigation rail */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === 'logout') {
              if (confirm("Are you sure you want to log out from LearnFlow?")) {
                alert("Logged out successfully! Re-routing back to home.");
                setActiveTab('home');
              }
            } else {
              setActiveTab(tab);
            }
          }}
        />

        {/* 3. Render Area Pane */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto" id="dashboard-render-pane">
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
                  onEnterClassroom={() => setActiveTab('dashboard')}
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
                  onEnterClassroom={() => setActiveTab('dashboard')}
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

            {activeTab === 'resources' && (
              <motion.div
                key="resources"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <GlobalResourcesView />
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
                  onSaveName={(name) => setUserName(name)}
                />
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <ReportsView
                  onEnterClassroom={() => setActiveTab('dashboard')}
                  completionPercentage={completionPercentage}
                  completedCount={completedLessonsCount}
                  totalCount={totalLessonsCount}
                  userEmail={userEmail}
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
                <div className="flex flex-col md:flex-row md:items-center md:justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-sm gap-4" id="classroom-sub-header">
                  <div className="text-left" id="breadcrumb-box">
                    <h1 className="text-xl font-extrabold text-slate-900 font-sans tracking-tight">{courses[activeCourseId]?.title || 'Chemical Engineering'} Learning Studio</h1>
                    <p className="text-xs text-slate-500 font-semibold font-sans mt-0.5">
                      My Courses <span className="text-slate-400 mx-1">&gt;</span> {courses[activeCourseId]?.title || 'Active Course'} <span className="text-slate-400 mx-1">&gt;</span> {activeLesson.title} <span className="text-slate-400 mx-1">&gt;</span> <span className={lessonViewMode === 'concept' ? 'text-[#E97426]' : 'text-[#00A896]'}>{lessonViewMode === 'concept' ? 'Concept Explanation' : 'Tutorial Solutions'}</span>
                    </p>
                  </div>

                  {/* Mode Toggles with active layout indicator */}
                  <div className="flex bg-slate-100 p-1.5 rounded-xl self-start md:self-auto shrink-0 border border-slate-200/50" id="classroom-mode-tabs">
                    <button
                      onClick={() => setLessonViewMode('concept')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-250 cursor-pointer flex items-center space-x-2 ${
                        lessonViewMode === 'concept'
                          ? 'bg-white text-[#0D1E36] shadow-sm'
                          : 'text-slate-500 hover:text-[#0D1E36]'
                      }`}
                      id="tab-concept-explanation"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#E97426]" />
                      <span>Concept Video</span>
                    </button>
                    <button
                      onClick={() => setLessonViewMode('solved')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-250 cursor-pointer flex items-center space-x-2 ${
                        lessonViewMode === 'solved'
                          ? 'bg-white text-[#0D1E36] shadow-sm'
                          : 'text-slate-500 hover:text-[#0D1E36]'
                      }`}
                      id="tab-solved-questions"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-[#00A896]" />
                      <span>Tutorials</span>
                    </button>
                  </div>
                </div>

                {/* Bento Content Grid: Left player stack + Right content list */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6" id="dashboard-classroom-grid">
                  
                  {/* 3/4 Width: Media & Details */}
                  <div className="xl:col-span-3 space-y-6 flex flex-col justify-between" id="video-and-overview-column">
                    {/* Custom Video Player HUD */}
                    <VideoPlayer
                      lesson={resolvedActiveLesson}
                      onToggleComplete={handleToggleActiveComplete}
                      viewMode={lessonViewMode}
                    />

                    {/* Micro-grid underneath Video Player: Overview & Materials */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="overview-materials-subgrid">
                      <div id="wrapper-overview">
                        <LessonOverview
                          lesson={resolvedActiveLesson}
                          onUpdateOverview={handleUpdateOverview}
                        />
                      </div>
                      <div id="wrapper-companion">
                        <ResourcesSection
                          resources={resolvedActiveLesson.resources}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 1/4 Width: Chapter Curriculums & Dynamic Course Completeness */}
                  <div className="xl:col-span-1 space-y-6 flex flex-col justify-between" id="chapters-and-progress-column">
                    {/* Dynamic course content syllabus */}
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
