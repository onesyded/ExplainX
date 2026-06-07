import { Home, LayoutDashboard, Compass, FileText, User, BarChart3, LogOut, Settings, ChevronUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userName?: string;
  userEmail?: string;
  isAdmin?: boolean;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  userName = "Student", 
  userEmail = "student@example.com", 
  isAdmin = false,
  mobileOpen = false,
  setMobileOpen
}: SidebarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'courses', label: 'My Courses', icon: Compass },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Portal', icon: LayoutDashboard }] : []),
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  const renderSidebarContents = (isMobile: boolean = false) => (
    <>
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-700 transition-colors cursor-pointer" id={isMobile ? "brand-has-close" : undefined}>
        <div className="flex items-center" onClick={() => handleTabClick('home')}>
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
        
        {isMobile && setMobileOpen && (
          <button 
            type="button"
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-605 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="px-3 space-y-1.5 pt-6 flex-1 overflow-y-auto" id={isMobile ? "sidebar-menu-list-mobile" : "sidebar-menu-list"}>
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className="w-full relative px-4 py-3 rounded-xl text-left font-semibold text-sm transition-colors cursor-pointer block select-none group border-0 bg-transparent"
              id={`${isMobile ? 'm-' : ''}sidebar-${item.id}`}
            >
              {/* Sliding dynamic selection capsule */}
              {isActive && (
                <motion.div
                  layoutId={isMobile ? "activeSidebarTabMobile" : "activeSidebarTab"}
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
              onClick={() => { handleTabClick('profile'); setShowProfileMenu(false); }}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-full text-left border-0 cursor-pointer text-slate-700 dark:text-slate-200 bg-transparent"
            >
              <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="text-sm font-semibold">Profile</span>
            </button>
            <div className="h-[1px] bg-slate-105 dark:bg-slate-700 my-1"></div>
            <button 
              onClick={() => { handleTabClick('logout'); setShowProfileMenu(false); }}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors w-full text-left border-0 cursor-pointer bg-transparent"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-semibold">Logout</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 border-t border-slate-100 dark:border-slate-700" id={isMobile ? "m-sidebar-footer" : "sidebar-footer"}>
        <button 
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group border-0 text-left cursor-pointer bg-transparent"
        >
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col items-start truncate text-left">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate w-full text-left">{userName}</span>
              <span className="text-[10px] items-center text-slate-500 dark:text-slate-400 truncate w-full text-left">{userEmail}</span>
            </div>
          </div>
          <ChevronUp className={`w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Desktop Sidebar Column */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 min-h-screen flex-col select-none shrink-0 relative transition-colors duration-200" id="sidebar-left">
        {renderSidebarContents(false)}
      </aside>

      {/* 2. Mobile Responsive Drawer Panel */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden" id="mobile-sidebar-drawer">
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
              id="m-sidebar-backdrop"
            />
            
            {/* Sidebar drawer content container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="absolute inset-y-0 left-0 w-64 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 flex flex-col select-none shadow-2xl transition-colors duration-200"
              id="m-sidebar-box"
            >
              {renderSidebarContents(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
