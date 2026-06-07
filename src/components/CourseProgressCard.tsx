import { ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';

interface CourseProgressCardProps {
  completionPercentage: number;
  totalLessonsCount: number;
  completedLessonsCount: number;
  activeModuleIndex: number; // 0 to 3
  onModuleTimelineSelect: (modIndex: number) => void;
}

export default function CourseProgressCard({
  completionPercentage,
  totalLessonsCount,
  completedLessonsCount,
  activeModuleIndex,
  onModuleTimelineSelect
}: CourseProgressCardProps) {
  // 4 steps corresponding to our 4 modules
  const timelineStages = [
    { label: 'Low', value: 0 },
    { label: 'Basic', value: 1 },
    { label: 'Core', value: 2 },
    { label: 'High', value: 3 }
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-full space-y-5 transition-all duration-300" id="progress-card-container">
      {/* 1. Progress Metric Layout Block */}
      <div id="progress-metric-block">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-sans uppercase tracking-wider mb-3">
          Course Progress
        </h3>
        
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5" id="pct-row-labels">
          <span className="text-slate-500 dark:text-slate-400" id="pct-left-label">
            {completionPercentage}% complete
          </span>
          <span className="text-[#00A896] dark:text-[#2dd4bf] bg-[#00A896]/10 dark:bg-[#00A896]/20 px-2 py-0.5 rounded-md font-mono text-[11px]" id="pct-right-label">
            {completedLessonsCount}/{totalLessonsCount} Lessons
          </span>
        </div>

        {/* Rounded Progress Tube */}
        <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden" id="tube-wrapper">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-gradient-to-r from-[#00A896] to-[#00c2ad] h-full rounded-full shadow-sm shadow-[#00A896]/30"
            id="tube-filler"
          />
        </div>
      </div>

      {/* 2. Timeline Sizing Indicator Widget */}
      <div className="pt-2 border-t border-slate-50 dark:border-slate-700/50 relative animate-fade-in" id="timeline-indicator-block">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-sans mb-3 block uppercase tracking-wider">
          Timeline Stage
        </span>

        {/* Floating cursor indicator pointing down */}
        <div className="relative h-6" id="triangle-tracker-row">
          <motion.div
            animate={{ left: `${(activeModuleIndex / 3) * 100}%` }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            className="absolute -translate-x-1/2 flex flex-col items-center"
            id="cursor-tracker-puck"
          >
            <span className="text-[#00A896] dark:text-[#2dd4bf] text-[11px] leading-none mb-0.5 animate-bounce">▼</span>
          </motion.div>
        </div>

        {/* Absolute Horizontal timeline line with nodes */}
        <div className="relative flex items-center justify-between px-1" id="nodes-row-wrapper">
          {/* Gray track running background */}
          <div className="absolute left-1 right-1 h-1 bg-slate-200 dark:bg-slate-700 top-1/2 -translate-y-1/2 -z-10" />
          
          {/* Teal track running background based on active state */}
          <motion.div
            animate={{ width: `calc(${(activeModuleIndex / 3) * 100}% - 4px)` }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            className="absolute left-1 h-1 bg-gradient-to-r from-[#00A896] to-[#00c2ad] top-1/2 -translate-y-1/2 -z-10"
          />

          {timelineStages.map((stage, idx) => {
            const isCompletedOrActive = idx <= activeModuleIndex;
            const isCurrent = idx === activeModuleIndex;

            return (
              <button
                key={stage.label}
                onClick={() => onModuleTimelineSelect(idx)}
                className="flex flex-col items-center cursor-pointer group relative"
                id={`timeline-node-${idx}`}
              >
                {/* Node Dot circle */}
                <motion.span
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-300 transform ${
                    isCurrent
                      ? 'bg-white dark:bg-slate-800 border-[#00A896] dark:border-[#2dd4bf] scale-110 shadow-lg shadow-[#00A896]/50'
                      : isCompletedOrActive
                      ? 'bg-[#00A896] border-[#00A896]'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Low / High Text markers underneath layout */}
        <div className="flex justify-between items-center mt-2.5 px-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono uppercase tracking-widest" id="low-high-labels-row">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
}
