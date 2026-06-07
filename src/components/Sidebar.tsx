import { Home, LayoutDashboard, Compass, FileText, User, BarChart3, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'My Courses', icon: Compass },
    { id: 'resources', label: 'Resources', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'logout', label: 'Logout', icon: LogOut }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 min-h-[calc(100vh-68px)] flex flex-col pt-6 select-none shrink-0" id="sidebar-left">
      <div className="px-3 space-y-1.5" id="sidebar-menu-list">
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
        <p className="text-[10px] text-slate-400 font-mono tracking-wider font-semibold uppercase">ChemNova v1.50</p>
      </div>
    </aside>
  );
}
