import { Home, LayoutDashboard, Compass, FileText, User, BarChart3, LogOut, GraduationCap, Settings } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'courses', label: 'My Courses', icon: Compass },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'logout', label: 'Logout', icon: LogOut }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 min-h-screen flex flex-col select-none shrink-0" id="sidebar-left">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 cursor-pointer" onClick={() => setActiveTab('home')}>
        <div className="w-8 h-8 rounded-xl bg-[#0D1E36] flex items-center justify-center mr-3 shadow-md shadow-[#0D1E36]/20">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-extrabold tracking-tight font-sans text-[#0D1E36] [text-shadow:1px_1px_0px_#cbd5e1,2px_2px_0px_#94a3b8,3px_3px_2px_rgba(0,0,0,0.15)]">
          Explain<span className="text-[#E97426]">X</span>
        </span>
      </div>

      <div className="px-3 space-y-1.5 pt-6" id="sidebar-menu-list">
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
                  className="absolute inset-0 bg-[#0D1E36]/5 rounded-xl border-l-[4px] border-[#0D1E36]"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}

              {/* Inner details */}
              <div className="relative z-10 flex items-center space-x-3.5">
                <motion.div
                  whileHover={{ rotate: isActive ? 0 : 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#0D1E36]' : 'text-slate-400 group-hover:text-slate-600'}`} />
                </motion.div>
                <span className={`transition-colors ${isActive ? 'text-slate-900 font-bold' : 'text-slate-500 group-hover:text-slate-800'}`}>
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-auto p-4 border-t border-slate-105 text-center" id="sidebar-footer">
        <p className="text-[10px] text-slate-400 font-mono tracking-wider font-semibold uppercase">ExplainX v1.50</p>
      </div>
    </aside>
  );
}
