import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckSquare, Square, Search, Settings } from 'lucide-react';
import { Module, Lesson } from '../types';

interface CourseContentProps {
  modules: Module[];
  activeLesson: Lesson;
  onSelectLesson: (lesson: Lesson) => void;
  onToggleComplete: (lessonId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function CourseContent({
  modules,
  activeLesson,
  onSelectLesson,
  onToggleComplete,
  searchQuery,
  setSearchQuery
}: CourseContentProps) {
  // Store expanded modules state
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    m1: false,
    m2: true, // "Component Lifecycle" is expanded by default as seen in mockup
    m3: true,
    m4: true
  });

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  // Filter modules/lessons based on searchQuery
  const filteredModules = modules.map(mod => {
    const matchedLessons = mod.lessons.filter(less =>
      less.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      ...mod,
      lessons: matchedLessons,
      hasMatches: matchedLessons.length > 0 || mod.title.toLowerCase().includes(searchQuery.toLowerCase())
    };
  }).filter(mod => mod.hasMatches);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden h-full" id="course-content-container">
      {/* Search Header Container */}
      <div className="p-4 border-b border-slate-50 flex items-center space-x-2 shrink-0" id="course-content-search-sec">
        <div className="relative flex-1" id="search-input-wrap">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search lectures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0D1E36] focus:border-[#0D1E36] text-slate-800 transition-all font-sans"
            id="content-search-input"
          />
        </div>
        <button
          className="p-2 sm:p-2.5 bg-[#0D1E36] hover:bg-[#1a3a63] text-white rounded-lg transition-colors cursor-pointer"
          title="Search Settings"
          id="search-filter-btn"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Accordion Module Content */}
      <div className="p-4 flex-1 overflow-y-auto space-y-3 max-h-[580px]" id="content-scroller">
        <h3 className="text-base font-bold text-slate-900 mb-2 px-1 font-sans">Course Content</h3>
        
        {filteredModules.length === 0 ? (
          <div className="text-center py-8 px-4" id="empty-search-alert">
            <p className="text-sm text-slate-400">No matching lessons found</p>
          </div>
        ) : (
          filteredModules.map((mod) => {
            const isExpanded = expandedModules[mod.id];
            return (
              <div key={mod.id} className="border border-slate-100 rounded-lg overflow-hidden bg-slate-50/50" id={`module-block-${mod.id}`}>
                {/* Module Section Header */}
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full px-4 py-3 pb-3 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between text-left select-none cursor-pointer"
                  id={`module-hdr-${mod.id}`}
                >
                  <span className="text-sm font-bold text-slate-800 font-sans tracking-tight">
                    {mod.title}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4.5 h-4.5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4.5 h-4.5 text-slate-500" />
                  )}
                </button>

                {/* Lessons list wrapper with transition heights */}
                {isExpanded && (
                  <div className="p-1 px-2 pb-2 space-y-1 border-t border-slate-100 bg-white" id={`lessons-list-${mod.id}`}>
                    {mod.lessons.map((less) => {
                      const isActive = activeLesson.id === less.id;
                      return (
                        <div
                          key={less.id}
                          className={`flex items-center justify-between p-2.5 rounded-lg transition-all text-xs border ${
                            isActive
                              ? 'bg-slate-50 border-slate-100 shadow-sm text-slate-900 font-semibold'
                              : 'border-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-800'
                          }`}
                          id={`lesson-row-${less.id}`}
                        >
                          {/* Checkbox state toggler */}
                          <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleComplete(less.id);
                              }}
                              className="text-[#00A896] hover:scale-105 transition-transform cursor-pointer shrink-0"
                              id={`checkbox-btn-${less.id}`}
                            >
                              {less.completed ? (
                                <CheckSquare className="w-4.5 h-4.5 fill-emerald-500/10 text-emerald-500" />
                              ) : (
                                <Square className="w-4.5 h-4.5 text-slate-300" />
                              )}
                            </button>

                            {/* Active lesson title anchor */}
                            <button
                              onClick={() => onSelectLesson(less)}
                              className="text-left font-medium text-[13px] truncate flex-1 hover:text-[#00A896] transition-colors cursor-pointer leading-tight"
                              id={`title-trigger-${less.id}`}
                            >
                              {less.title}
                            </button>
                          </div>

                          {/* Time duration readout */}
                          <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-2">
                            {less.duration}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
