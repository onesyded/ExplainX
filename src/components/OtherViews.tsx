import { useState } from 'react';
import { Compass, BookOpen, Clock, Award, Star, Mail, CheckCircle, BarChart3, Flame, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OtherViewsProps {
  onEnterClassroom: () => void;
  completionPercentage: number;
  completedCount: number;
  totalCount: number;
  userEmail: string;
  userName?: string;
}

// Stagger container helper
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }
};

interface HomeViewExtendedProps {
  onEnterClassroom: () => void;
  completionPercentage: number;
  completedCount: number;
  totalCount: number;
  userEmail: string;
  userName?: string;
  activeCourseId?: string;
  activeCourseTitle?: string;
  onSelectCourse?: (courseId: string) => void;
  courseProgresses?: { [courseId: string]: number };
}

export function HomeView({ 
  onEnterClassroom, 
  completionPercentage, 
  completedCount, 
  totalCount, 
  userName = 'Richmond',
  activeCourseId = 'thermo-ii',
  activeCourseTitle = 'Thermodynamics II',
  onSelectCourse,
  courseProgresses = {}
}: HomeViewExtendedProps) {
  const quickCourses = [
    { id: 'thermo-ii', title: 'Thermodynamics II', iconColor: 'text-[#E97426]' },
    { id: 'cre', title: 'Chemical Reaction Engineering (CRE)', iconColor: 'text-amber-500' },
    { id: 'heat-transfer', title: 'Heat Transfer Processes', iconColor: 'text-emerald-500' }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 text-left" 
      id="home-view-container"
    >
      {/* Welcome Banner */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-r from-[#0D1E36] via-[#152e52] to-[#0D1E36] text-white p-8 rounded-2xl relative overflow-hidden shadow-lg border border-white/5" 
        id="home-hero-banner"
      >
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
          <BookOpen className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 space-y-3.5 max-w-xl">
          <motion.span 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-block bg-[#E97426] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md shadow-sm shadow-[#E97426]/25"
          >
            Classroom Portal
          </motion.span>
          <h2 className="text-3xl font-extrabold font-sans tracking-tight">Welcome back, {userName}!</h2>
          <p className="text-sm text-slate-300 leading-relaxed font-medium">
            Continue where you left off. You are making rapid progress through your Chemical Engineering modules. Keep the streak active!
          </p>
        </div>
      </motion.div>

      {/* Main Grid: Ongoing Class and stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="home-blocks-grid">
        {/* Core Enrolled Classroom */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -3 }}
          className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgba(13,30,54,0.08)] border border-slate-100 lg:col-span-2 flex flex-col justify-between transition-all duration-300" 
          id="core-class-card"
        >
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#E97426] tracking-wider font-mono">SELECTED WORKSPACE</span>
              <div className="flex items-center space-x-1.5 text-amber-500 text-xs font-bold">
                <Star className="w-4 h-4 fill-current text-yellow-500" />
                <span>Active Classroom</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-950 font-sans leading-tight tracking-tight">{activeCourseTitle}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Experience focused learning with fully solved tutorial question walkthroughs.
            </p>

            {/* Quick progress bar */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500">Course Progress</span>
                <span className="text-[#00A896] bg-[#00A896]/10 px-2 py-0.5 rounded-md">{completionPercentage}% Completed</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="bg-[#00A896] h-full rounded-full shadow-sm shadow-[#00A896]/20" 
                />
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onEnterClassroom}
            className="mt-6 w-full py-3 bg-[#0D1E36] hover:bg-[#153158] text-white rounded-xl text-sm font-bold tracking-wide transition-all duration-200 shadow-md shadow-[#0D1E36]/15 hover:shadow-lg hover:shadow-[#0D1E36]/30 flex items-center justify-center space-x-2 cursor-pointer"
            id="entry-cmd"
          >
            <Compass className="w-4 h-4" />
            <span>Enter {activeCourseTitle} Learning Studio</span>
          </motion.button>
        </motion.div>

        {/* Highlight achievements & Course switcher */}
        <motion.div 
          variants={itemVariants}
          className="bg-slate-50 rounded-2xl p-6 flex flex-col justify-between border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]" 
          id="home-highlights"
        >
          <div className="space-y-4 text-left">
            <h4 className="text-xs font-bold text-slate-800 font-sans tracking-wide uppercase">Launch another course</h4>
            
            <div className="space-y-2">
              {quickCourses.map((c) => {
                const isCurrent = c.id === activeCourseId;
                const prog = courseProgresses[c.id] !== undefined ? courseProgresses[c.id] : 0;
                return (
                  <motion.button 
                    key={c.id}
                    onClick={() => {
                      if (onSelectCourse) {
                        onSelectCourse(c.id);
                      }
                    }}
                    whileHover={{ x: 3 }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                      isCurrent 
                        ? 'bg-[#0D1E36]/5 border-[#0D1E36]/20 hover:bg-[#0D1E36]/10' 
                        : 'bg-white border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3 max-w-[70%]">
                      <div className={`p-2 rounded-lg ${isCurrent ? 'bg-[#0D1E36]/15' : 'bg-slate-50'}`}>
                        <BookOpen className={`w-4 h-4 ${c.iconColor}`} />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 leading-tight truncate">{c.title}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{isCurrent ? 'Active Studio' : 'Enrolled'}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#00A896] bg-[#00A896]/10 px-2 py-0.5 rounded">
                      {prog}%
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-start space-x-2.5">
              <Award className="w-4 h-4 text-[#E97426] shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold leading-tight">Total certified status</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{completedCount} Lectures cleared across standard syllabi.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

interface CoursesViewExtendedProps {
  onEnterClassroom: () => void;
  completionPercentage: number;
  completedCount: number;
  totalCount: number;
  userEmail: string;
  activeCourseId?: string;
  onSelectCourse?: (courseId: string) => void;
  courseProgresses?: { [courseId: string]: number };
}

export function CoursesView({ 
  onEnterClassroom, 
  activeCourseId, 
  onSelectCourse, 
  courseProgresses = {} 
}: CoursesViewExtendedProps) {
  const catalog = [
    {
      id: 'thermo-ii',
      title: 'Thermodynamics II',
      desc: 'Master phase equilibrium formulations, cubic equations of state (PR & SRK), activity coefficient models, and chemical reaction equilibrium.',
      instructor: 'Teacher Alex',
      enrolled: true,
      progress: courseProgresses['thermo-ii'] !== undefined ? courseProgresses['thermo-ii'] : 60,
      rating: '4.9',
      duration: '14h playback'
    },
    {
      id: 'cre',
      title: 'Chemical Reaction Engineering (CRE)',
      desc: 'Formulate reactor design equations for batch, CSTR, and PFR configurations, analyze homogeneous reaction kinetics, and determine steady thermal states.',
      instructor: 'Teacher Alex',
      enrolled: true,
      progress: courseProgresses['cre'] !== undefined ? courseProgresses['cre'] : 50,
      rating: '4.8',
      duration: '16h playback'
    },
    {
      id: 'heat-transfer',
      title: 'Heat Transfer Processes',
      desc: 'Analyze systems with steady state heat conduction, force & free convection, phase-change boiling heat transfer coefficients, and blackbody radiation.',
      instructor: 'Marcus Aurelius',
      enrolled: true,
      progress: courseProgresses['heat-transfer'] !== undefined ? courseProgresses['heat-transfer'] : 0,
      rating: '5.0',
      duration: '12h playback'
    }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 text-left" 
      id="courses-view-container"
    >
      <motion.div variants={itemVariants} id="courses-header-block">
        <h2 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">Your Course Curriculum</h2>
        <p className="text-xs text-slate-400 mt-0.5">Explore active certifications and register for upcoming technical modules.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="catalog-card-grid">
        {catalog.map((course) => (
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(13,30,54,0.08)" }}
            key={course.id} 
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[300px] transition-all duration-300" 
            id={`ccard-${course.id}`}
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className={`text-[9px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-md ${
                  course.enrolled ? 'bg-emerald-50 text-emerald-600 border border-emerald-500/10' : 'bg-slate-100 text-slate-500'
                }`}>
                  {course.enrolled ? 'Active' : 'Not Registered'}
                </span>
                <span className="text-slate-400 text-xs font-mono font-medium">{course.duration}</span>
              </div>

              <h3 className="text-base font-bold text-slate-950 font-sans tracking-tight leading-tight">
                {course.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed truncate-2-lines">
                {course.desc}
              </p>
            </div>

            <div className="space-y-4 pt-4 mt-4 border-t border-slate-100" id={`ccard-ftr-${course.id}`}>
              {course.enrolled ? (
                <div className="space-y-1.5" id={`prog-${course.id}`}>
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-[#00A896] font-semibold">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-105 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="bg-[#00A896] h-full rounded-full" 
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Lectured by {course.instructor}</p>
              )}

              {course.enrolled ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (onSelectCourse) {
                      onSelectCourse(course.id);
                    }
                    onEnterClassroom();
                  }}
                  className={`w-full py-2.5 text-white rounded-xl text-xs font-bold transition-all duration-250 cursor-pointer text-center shadow-md hover:shadow-lg ${
                    activeCourseId === course.id 
                      ? 'bg-[#E97426] hover:bg-[#cf6319] shadow-[#E97426]/10' 
                      : 'bg-[#0D1E36] hover:bg-[#122b4d] shadow-[#0D1E36]/10'
                  }`}
                >
                  {activeCourseId === course.id ? 'Resume Classroom' : 'Enter Classroom'}
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2.5 bg-slate-100 text-slate-705 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all duration-250 cursor-pointer text-center"
                >
                  Purchase and Request Access
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function ProfileView({ userEmail, userName = 'Richmond', onSaveName }: { userEmail: string; userName?: string; onSaveName?: (name: string) => void }) {
  const [name, setName] = useState(userName);
  const [major, setMajor] = useState('Chemical Engineering Faculty');
  const [success, setSuccess] = useState(false);

  const saveProfile = () => {
    if (onSaveName) {
      onSaveName(name);
    }
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-xl mx-auto bg-white rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-150 overflow-hidden text-left" 
      id="profile-container"
    >
      <div className="bg-[#0D1E36] p-7 text-white text-center relative" id="profile-banner">
        <div className="flex flex-col items-center">
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring' }}
            src="/src/assets/images/alex_avatar_1780368345641.png"
            alt="Alex Headshot"
            className="w-24 h-24 rounded-full border-4 border-white/20 object-cover shadow-xl transform translate-y-2 mt-2"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      <div className="p-7 pt-12 space-y-6" id="profile-form">
        <div className="text-center mb-6">
          <h2 className="text-xl font-extrabold text-slate-950 font-sans tracking-tight">{name}</h2>
          <p className="text-xs font-medium text-[#E97426] uppercase tracking-wider mt-1">{major}</p>
        </div>

        {/* Inputs row 1 */}
        <div className="space-y-4" id="inputs-wrapper">
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans mb-1">Full Student Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D1E36] focus:border-[#0D1E36] transition-all bg-slate-50/50"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans mb-1">Contact Email Address</label>
            <div className="relative">
              <input
                type="email"
                disabled
                value={userEmail}
                className="w-full border border-slate-100 bg-slate-50 text-slate-400 rounded-xl pl-10 pr-3 py-2.5 text-sm cursor-not-allowed"
              />
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-300" />
            </div>
            <span className="text-[10px] text-slate-400 italic mt-1 font-sans">User emails are managed securely by AI Studio core secrets configuration.</span>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans mb-1">Current Program Major</label>
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D1E36] focus:border-[#0D1E36] transition-all bg-slate-50/50"
            />
          </div>
        </div>

        <div className="pt-5 border-t border-slate-100 flex items-center justify-between" id="profile-action-panel">
          <AnimatePresence>
            {success && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-emerald-600 font-bold flex items-center space-x-1"
              >
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Record synchronized!</span>
              </motion.p>
            )}
          </AnimatePresence>
          <div className="w-4 h-4" /> {/* Spacer */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={saveProfile}
            className="px-6 py-2.5 bg-[#0D1E36] hover:bg-[#122c4d] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#0D1E36]/15 hover:shadow-lg cursor-pointer shrink-0 uppercase tracking-wider"
          >
            Save Profile Options
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export function GlobalResourcesView() {
  const learningDocs = [
    { title: 'Official React Documentation (react.dev)', type: 'Web Link', url: 'https://react.dev' },
    { title: 'Component lifecycle methods mapping guides', type: 'PDF Document', url: '#' },
    { title: 'Common custom hook design patterns recipe books', type: 'PDF Document', url: '#' },
    { title: 'Standard configurations for Vite + Tailwind CSS templates', type: 'ZIP Bundle', url: '#' }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 text-left" 
      id="global-resources"
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">Companion Materials Archive</h2>
        <p className="text-xs text-slate-400 mt-0.5">Hand-curated papers, slide indices, and offline assets to bolster your technical workflow.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="materials-grid">
        {learningDocs.map((doc) => (
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.01, boxShadow: "0 10px 25px rgba(0,0,0,0.03)" }}
            key={doc.title} 
            className="bg-white p-4.5 rounded-xl border border-slate-100 flex items-center justify-between shadow-xs transition-shadow duration-300"
          >
            <div className="flex items-center space-x-3.5">
              <div className="p-2.5 bg-slate-50 text-slate-500 rounded-lg">
                <FileText className="w-5 h-5 text-slate-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800 leading-tight">{doc.title}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1">{doc.type}</p>
              </div>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer border border-slate-100"
            >
              Retrieve
            </motion.button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function ReportsView({ completionPercentage, completedCount, totalCount }: OtherViewsProps) {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 text-left" 
      id="reports-view"
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">Performance Analytics</h2>
        <p className="text-xs text-slate-400 mt-0.5 font-sans">Quantifiable learning metrics, screen play distributions, and lesson status.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="stats-dashboard">
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -3 }}
          className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col justify-between h-32 shadow-sm transition-shadow hover:shadow-md"
        >
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Completeness Quotient</p>
          <div className="flex justify-between items-end">
            <h4 className="text-3xl font-extrabold text-[#0D1E36] font-mono leading-none">{completionPercentage}%</h4>
            <span className="text-emerald-500 text-xs font-bold leading-none bg-emerald-55/10 px-2 py-1 rounded-md border border-emerald-500/10">+2.4% today</span>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -3 }}
          className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col justify-between h-32 shadow-sm transition-shadow hover:shadow-md"
        >
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Lessons Mastered</p>
          <div className="flex justify-between items-end">
            <h4 className="text-3xl font-extrabold text-[#0D1E36] font-mono leading-none">{completedCount} <span className="text-xs text-slate-400">/ {totalCount}</span></h4>
            <span className="text-slate-400 text-xs font-semibold">Active curriculum</span>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -3 }}
          className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col justify-between h-32 shadow-sm transition-shadow hover:shadow-md"
        >
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Active Stretch Timer</p>
          <div className="flex justify-between items-end">
            <h4 className="text-3xl font-extrabold text-[#0D1E36] font-mono leading-none flex items-center gap-1.5">
              <span>4</span>
              <Flame className="w-6 h-6 text-[#E97426] fill-current animate-pulse" />
            </h4>
            <span className="text-orange-500 text-xs font-bold bg-orange-50 px-2 py-1 rounded-md border border-orange-500/10 leading-none">Streak Secure</span>
          </div>
        </motion.div>
      </div>

      {/* Visual representation card */}
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4 shadow-sm" id="timeline-breakdown">
        <h3 className="text-base font-bold text-slate-900 font-sans tracking-tight">Active Hours Breakdown</h3>
        <p className="text-xs text-slate-400 mb-2">Simulated distribution of video minutes played over the current cycle.</p>
        
        <div className="grid grid-cols-7 gap-3 h-36 items-end pt-4" id="chart-bars-stack">
          {[20, 45, 10, 80, 55, 30, 95].map((val, idx) => {
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            return (
              <div key={idx} className="flex flex-col items-center space-y-2 h-full justify-end">
                <span className="text-[10px] text-slate-400 font-mono font-bold">{val}m</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(val / 100) * 110}px` }}
                  transition={{ delay: 0.15 + idx * 0.05, duration: 0.5, type: 'spring', stiffness: 200 }}
                  className="w-full rounded-md bg-gradient-to-t from-[#0D1E36] to-[#00A896] shadow-md hover:to-[#00c2ad] transition-colors cursor-pointer"
                />
                <span className="text-[11px] font-bold text-slate-500">{days[idx]}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
