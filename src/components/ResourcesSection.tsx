import { useState } from 'react';
import { FileText, Download, Check, Loader2, FileCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Resource } from '../types';

interface ResourcesSectionProps {
  resources: Resource[];
}

export default function ResourcesSection({ resources }: ResourcesSectionProps) {
  // Store download completion states per resource ID
  const [downloadingIds, setDownloadingIds] = useState<Record<string, boolean>>({});
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({});

  const triggerDownload = (res: Resource) => {
    if (downloadingIds[res.id]) return;

    // Start loading state
    setDownloadingIds(prev => ({ ...prev, [res.id]: true }));

    setTimeout(() => {
      // Toggle to complete
      setDownloadingIds(prev => ({ ...prev, [res.id]: false }));
      setCompletedIds(prev => ({ ...prev, [res.id]: true }));

      // Create simulated mock file download
      const element = document.createElement("a");
      const file = new Blob([`Mock file contents for LearnFlow: ${res.name}. Provided for evaluation purposes.`], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = res.name;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      // Clean checkmark state after 3 seconds
      setTimeout(() => {
        setCompletedIds(prev => ({ ...prev, [res.id]: false }));
      }, 3000);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col h-full transition-shadow duration-300" id="resources-panel-card">
      <div className="mb-4 text-left" id="resources-title-wrapper">
        <h3 className="text-sm font-extrabold text-slate-900 font-sans uppercase tracking-wider leading-tight">
          Companion Material
        </h3>
        <p className="text-xs text-slate-400 font-medium font-sans">Resources and files</p>
      </div>

      <div className="space-y-3 flex-1 flex flex-col justify-center" id="resources-list-stack">
        {resources.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4 font-sans">No companion files for this lesson</p>
        ) : (
          resources.map((res) => {
            const isPdf = res.name.toLowerCase().endsWith('.pdf');
            const isZip = res.name.toLowerCase().endsWith('.zip');
            const isDownloading = downloadingIds[res.id];
            const isCompleted = completedIds[res.id];

            return (
              <motion.div
                key={res.id}
                onClick={() => triggerDownload(res)}
                whileHover={{ y: -3, scale: 1.01, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
                whileTap={{ scale: 0.99 }}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-200 transition-colors cursor-pointer group"
                id={`resource-row-${res.id}`}
              >
                <div className="flex items-center space-x-3 min-w-0" id={`resource-meta-${res.id}`}>
                  {/* File Type Color Badges with active rotate hover */}
                  <div
                    className={`p-2 rounded-lg shrink-0 transition-transform duration-300 group-hover:rotate-6 ${
                      isPdf
                        ? 'bg-rose-50 text-rose-500 shadow-sm shadow-rose-100'
                        : isZip
                        ? 'bg-amber-50 text-amber-500 shadow-sm shadow-amber-100'
                        : 'bg-blue-50 text-blue-500 shadow-sm shadow-blue-100'
                    }`}
                    id={`fbadge-${res.id}`}
                  >
                    {isPdf ? (
                      <FileText className="w-5 h-5" />
                    ) : (
                      <FileCode className="w-5 h-5" />
                    )}
                  </div>

                  <div className="truncate text-left" id="name-type-wrap">
                    <p className="text-[13px] font-bold text-slate-800 truncate leading-tight font-sans">
                      {res.name}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-none font-sans mt-1">
                      {isPdf ? 'PDF document' : isZip ? 'ZIP archive' : 'Linked attachments'}
                    </p>
                  </div>
                </div>

                {/* Download indicator action states */}
                <button
                  className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 group-hover:text-slate-700 transition-colors shrink-0 cursor-pointer"
                  id={`attach-dl-bin-${res.id}`}
                >
                  <AnimatePresence mode="wait">
                    {isDownloading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                      </motion.div>
                    ) : isCompleted ? (
                      <motion.div
                        key="completed"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1.1 }}
                        exit={{ opacity: 0 }}
                        type="spring"
                      >
                        <Check className="w-4 h-4 text-emerald-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ y: 1 }}
                      >
                        <Download className="w-4 h-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
