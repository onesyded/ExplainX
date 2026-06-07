import { Home, LayoutDashboard, Compass, FileText, User, BarChart3, LogOut, Settings, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userName?: string;
  userEmail?: string;
  isAdmin?: boolean;
}

export default function Sidebar({ activeTab, setActiveTab, userName = "Student", userEmail = "student@example.com", isAdmin = false }: SidebarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'courses', label: 'My Courses', icon: Compass },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Portal', icon: LayoutDashboard }] : []),
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 min-h-screen flex flex-col select-none shrink-0 relative transition-colors duration-200" id="sidebar-left">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-700 cursor-pointer transition-colors" onClick={() => setActiveTab('home')}>
        <div className="w-11 h-11 flex items-center justify-center mr-1.5 overflow-hidden filter dark:brightness-110">
          <img
            src="/src/assets/images/logo_3d_1780805779310.png"
            alt="ExplainX Logo"
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <span className="text-xl font-extrabold tracking-tight font-sans text-[#0D1E36] dark:text-white [text-shadow:1px_1px_0px_#cbd5e1,2px_2px_0px_#94a3b8,3px_3px_2px_rgba(0,0,0,0.15)] dark:[text-shadow:1px_1px_0px_rgba(0,0,0,0.5),2px_2px_0px_rgba(0,0,0,0.8)]">
          Explain<span className="text-[#E97426]">X</span>
        </span>
      </div>

      <div className="px-3 space-y-1.5 pt-6 flex-1" id="sidebar-menu-list">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="w-full relative px-4 py-3 rounded-xl text-left font-semibold text-sm transition-colors cursor-pointer block select-none group"
              id={`sidebar-${item.id}`}
            >
              {/* Sliding dynamic selection capsule */}
              {isActive && (
                <motion.div
                  layoutId="activeSidebarTab"
                  className="absolute inset-0 bg-[#0D1E36]/5 dark:bg-slate-700/50 rounded-xl border-l-[4px] border-[#0D1E36] dark:border-white"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}

              {/* Inner details */}
              <div className="relative z-10 flex items-center space-x-3.5">
                <motion.div
                  whileHover={{ rotate: isActive ? 0 : 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#0D1E36] dark:text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                </motion.div>
                <span className={`transition-colors ${isActive ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'}`}>
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Profile menu popup */}
      <AnimatePresence>
        {showProfileMenu && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-[88px] left-4 right-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl rounded-xl p-2 z-50 flex flex-col space-y-1"
          >
            <button 
              onClick={() => { setActiveTab('profile'); setShowProfileMenu(false); }}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-full text-left"
            >
              <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Profile</span>
            </button>
            <div className="h-[1px] bg-slate-100 dark:bg-slate-700 my-1"></div>
            <button 
              onClick={() => { setActiveTab('logout'); setShowProfileMenu(false); }}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors w-full text-left"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-semibold">Logout</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 border-t border-slate-100 dark:border-slate-700" id="sidebar-footer">
        <button 
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
        >
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col items-start truncate">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate w-full text-left">{userName}</span>
              <span className="text-[10px] items-center text-slate-500 dark:text-slate-400 truncate w-full text-left">{userEmail}</span>
            </div>
          </div>
          <ChevronUp className={`w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </aside>
  );
}
