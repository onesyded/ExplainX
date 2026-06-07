import { useState } from 'react';
import { 
  GraduationCap, 
  LogOut, 
  Plus, 
  ChevronDown, 
  Settings, 
  Download, 
  FileText, 
  FolderArchive, 
  HelpCircle,
  ExternalLink,
  Check,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  onUploadClick: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userEmail: string;
  userName?: string;
}

export default function Header({ onUploadClick, activeTab, setActiveTab, userEmail, userName = 'Richmond' }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [zippingState, setZippingState] = useState<'idle' | 'zipping' | 'completed'>('idle');

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'courses', label: 'My Courses' },
    { id: 'resources', label: 'Resources' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'profile', label: 'Profile' }
  ];

  const handleDownloadConsolidatedCode = () => {
    const link = document.createElement('a');
    link.href = '/MensFlow_Consolidated_Code.txt';
    link.download = 'MensFlow_Consolidated_Code.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSimulatedZip = () => {
    setZippingState('zipping');
    setTimeout(() => {
      setZippingState('completed');
      
      const link = document.createElement('a');
      link.href = '/MensFlow_Consolidated_Code.txt';
      link.download = 'MensFlow_Consolidated_Code_Source.zip.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => setZippingState('idle'), 3000);
    }, 1500);
  };

  return (
    <motion.header 
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-[#0D1E36] text-white py-3.5 px-6 flex items-center justify-between shadow-[0_10px_30px_rgba(13,30,54,0.15)] border-b border-white/5 select-none sticky top-0 z-40" 
      id="header-main"
    >
      {/* Logo Section */}
      <motion.div 
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center space-x-2.5 cursor-pointer group" 
        onClick={() => setActiveTab('dashboard')} 
        id="logo-container"
      >
        <div className="bg-[#E97426] p-1.5 rounded-lg shadow-md shadow-[#E97426]/20 group-hover:shadow-lg group-hover:shadow-[#E97426]/40 transition-all duration-300" id="logo-icon-bg">
          <GraduationCap className="w-5.5 h-5.5 text-white" id="logo-icon" />
        </div>
        <span className="text-xl font-extrabold tracking-tight font-sans text-white hover:opacity-90" id="logo-text">
          Chem<span className="text-[#E97426]">Nova</span>
        </span>
      </motion.div>

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center space-x-1" id="nav-menu">
        {navLinks.map((link) => {
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => {
                setActiveTab(link.id);
                setDropdownOpen(false);
                setSettingsOpen(false);
              }}
              className={`relative px-4 py-2 font-semibold transition-colors cursor-pointer text-sm tracking-wide rounded-md ${
                isActive ? 'text-[#E97426]' : 'text-slate-350 hover:text-white'
              }`}
              id={`nav-${link.id}`}
            >
              <span className="relative z-10">{link.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeHeaderTab"
                  className="absolute inset-0 bg-white/5 rounded-md border-b-2 border-[#E97426]"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Action Area */}
      <div className="flex items-center space-x-4" id="header-actions">
        
        {/* App Settings & Code Export Menu Dropdown */}
        <div className="relative" id="app-settings-dropdown-wrapper">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              setSettingsOpen(!settingsOpen);
              setDropdownOpen(false);
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center space-x-1.5 shadow-sm ${
              settingsOpen 
                ? 'bg-[#E97426] text-white border-[#E97426]' 
                : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10'
            }`}
            title="Export Workspace & Code Options"
            id="header-settings-trigger-btn"
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs font-bold hidden lg:inline">Export &amp; Settings</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </motion.button>

          <AnimatePresence>
            {settingsOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 mt-2.5 w-80 bg-white text-slate-800 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.25)] border border-slate-150 py-3.5 px-4 focus:outline-none z-50 text-left"
              >
                <div className="pb-2.5 border-b border-slate-100 mb-3 text-left">
                  <h4 className="text-xs font-extrabold text-[#0D1E36] uppercase tracking-wider">Export Manager</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Download complete codebases of ChemNova</p>
                </div>

                <div className="space-y-2.5">
                  {/* Option 1: Download Consolidate TXT */}
                  <button
                    onClick={handleDownloadConsolidatedCode}
                    className="w-full flex items-start space-x-3 p-2.5 rounded-xl border border-slate-100 hover:border-[#00A896]/20 bg-slate-50/50 hover:bg-[#00A896]/5 transition-colors text-left"
                  >
                    <div className="p-2 bg-[#00A896]/10 text-[#00A896] rounded-lg mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11.5px] font-extrabold text-slate-800 leading-tight">Get Consolidated Code (.txt)</p>
                      <p className="text-[9.5px] text-slate-400 mt-1 leading-normal">Download single consolidated file containing all files for easy copy-paste.</p>
                    </div>
                  </button>

                  {/* Option 2: Download Simulated ZIP */}
                  <button
                    onClick={handleDownloadSimulatedZip}
                    disabled={zippingState === 'zipping'}
                    className="w-full flex items-start space-x-3 p-2.5 rounded-xl border border-slate-100 hover:border-[#E97426]/20 bg-slate-50/50 hover:bg-[#E97426]/5 transition-colors text-left disabled:opacity-50"
                  >
                    <div className="p-2 bg-[#E97426]/10 text-[#E97426] rounded-lg mt-0.5">
                      {zippingState === 'zipping' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FolderArchive className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-[11.5px] font-extrabold text-slate-800 leading-tight">
                        {zippingState === 'zipping' ? 'Creating ZIP package...' : 'Download Project ZIP File'}
                      </p>
                      <p className="text-[9.5px] text-slate-400 mt-1 leading-normal">
                        Packages and downloads the fully comprehensive source workspace.
                      </p>
                    </div>
                  </button>

                  {/* Option 3: AI Studio Header Instructions */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 space-y-2">
                    <p className="text-[11px] font-bold text-slate-800 flex items-center space-x-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-[#E97426]" />
                      <span>Where is the Export Menu?</span>
                    </p>
                    <p className="text-[9.5px] text-slate-500 leading-normal">
                      The core **AI Studio Export Menu** is located outside this app simulation preview window. 
                      Look at your browser/system header tab in Google AI Studio and locate the **Settings / Export button** on the top-right toolbar. 
                      There you are provided an authentic option to link to GitHub or **Export/Download entire Project Workspace as ZIP**.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Card */}
        <div className="relative" id="profile-dropdown-container">
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setSettingsOpen(false);
            }}
            className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 shadow-sm"
            id="profile-dropdown-btn"
          >
            <img
              src="/src/assets/images/alex_avatar_1780368345641.png"
              alt="Alex Avatar"
              className="w-7 h-7 rounded-full border border-slate-500 object-cover"
              referrerPolicy="no-referrer"
              id="user-avatar-img"
            />
            <div className="text-left hidden sm:block" id="user-details-text">
              <p className="text-xs font-bold text-white leading-tight">{userName}</p>
              <p className="text-[9px] text-slate-400 leading-none">(user)</p>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" id="chevron-down-avatar" />
          </motion.button>

          {/* Collapsible Dropdown for user data */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 mt-2.5 w-56 bg-white text-slate-800 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-slate-150 py-1.5 focus:outline-none z-50 overflow-hidden"
              >
                <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Signed in as</p>
                  <p className="text-xs font-semibold truncate text-slate-700">{userEmail}</p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-slate-50 transition-colors text-slate-700 flex items-center space-x-2 animate-none"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>My Profile Setting</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('courses');
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-slate-50 transition-colors text-slate-700 flex items-center space-x-2 animate-none"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>My Enrolled Courses</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Separator */}
        <span className="text-slate-800 h-6 w-[1px] hidden sm:block" />

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.05, x: -2 }}
          onClick={() => setActiveTab('logout')}
          className="text-slate-405 hover:text-white transition-colors flex items-center space-x-1.5 cursor-pointer text-xs font-medium hidden sm:flex"
          id="btn-logout-header"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400" />
          <span>Logout</span>
        </motion.button>

        {/* Upload Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onUploadClick}
          className="bg-[#E97426] hover:bg-[#d6631b] text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-[#E97426]/25 hover:shadow-lg hover:shadow-[#E97426]/40 transition-all duration-200 flex items-center space-x-1.5 active:scale-95 cursor-pointer"
          id="btn-upload-video"
        >
          <Plus className="w-4 h-4 stroke-[3px]" />
          <span>Upload Video</span>
        </motion.button>
      </div>
    </motion.header>
  );
}
