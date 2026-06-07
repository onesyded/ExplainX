import { useState, FormEvent } from 'react';
import { X, Film, Clock, HelpCircle } from 'lucide-react';

interface UploadVideoModalProps {
  onClose: () => void;
  onAddLesson: (moduleId: string, lessonData: {
    title: string;
    duration: string;
    overview: string;
  }) => void;
  moduleOptions: { id: string; title: string }[];
}

export default function UploadVideoModal({ onClose, onAddLesson, moduleOptions }: UploadVideoModalProps) {
  const [title, setTitle] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState(moduleOptions[0]?.id || '');
  const [minutes, setMinutes] = useState('05');
  const [seconds, setSeconds] = useState('00');
  const [overview, setOverview] = useState('');
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Please enter a lecture title';
    }
    if (!overview.trim()) {
      newErrors.overview = 'Please enter a quick lecture overview';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const duration = `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;

    onAddLesson(selectedModuleId, {
      title: title.trim(),
      duration,
      overview: overview.trim()
    });

    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs select-none animate-fade-in" id="upload-dialog-box">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 transform scale-100 transition-all" id="dialog-content">
        
        {/* Header segment of dialog */}
        <div className="bg-[#0D1E36] text-white px-6 py-4 flex items-center justify-between" id="dialog-header">
          <div className="flex items-center space-x-2" id="header-combo">
            <Film className="w-5 h-5 text-[#E97426]" />
            <span className="text-base font-bold font-sans tracking-tight">Upload Lecture Material</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            id="close-dialog-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-4" id="success-state">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
              <Film className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-slate-800 font-sans">Lecture Added Successfully!</h4>
            <p className="text-xs text-slate-400">Your custom React video has been registered in the syllabus catalog.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left" id="upload-form">
            {/* Title field */}
            <div className="flex flex-col space-y-1" id="fld-title-group">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">
                Lecture Title
              </label>
              <input
                type="text"
                placeholder="e.g. Lesson 1.6: Context Providers and Consuming State"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors(prev => ({ ...prev, title: '' }));
                }}
                className={`w-full border rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 ${
                  errors.title ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-[#0D1E36]'
                }`}
                id="input-title"
              />
              {errors.title && <p className="text-[10px] text-rose-500 font-semibold">{errors.title}</p>}
            </div>

            {/* Select Destination Module */}
            <div className="flex flex-col space-y-1" id="fld-module-group">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">
                Target Chapter / Module
              </label>
              <select
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D1E36]"
                id="select-target-mod"
              >
                {moduleOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration layout */}
            <div className="flex space-x-4" id="fld-duration-row">
              <div className="flex-1 flex flex-col space-y-1" id="fld-mins-grp">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Duration (Minutes)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D1E36]"
                  id="input-duration-min"
                />
              </div>

              <div className="flex-1 flex flex-col space-y-1" id="fld-secs-grp">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Duration (Seconds)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D1E36]"
                  id="input-duration-sec"
                />
              </div>
            </div>

            {/* Overview / Brief brief text field */}
            <div className="flex flex-col space-y-1" id="fld-overview-group">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">
                Syllabus Brief Overview
              </label>
              <textarea
                rows={3}
                placeholder="Briefly state structural key concepts, dependencies, or references covered in this session..."
                value={overview}
                onChange={(e) => {
                  setOverview(e.target.value);
                  setErrors(prev => ({ ...prev, overview: '' }));
                }}
                className={`w-full border rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 ${
                  errors.overview ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-[#0D1E36]'
                }`}
                id="input-overview"
              />
              {errors.overview && <p className="text-[10px] text-rose-500 font-semibold">{errors.overview}</p>}
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100" id="dialog-footer-actions">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                id="cancel-upload-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#E97426] hover:bg-[#d6631b] text-white rounded-lg text-sm font-medium transition-colors shadow-sm active:scale-95 cursor-pointer"
                id="submit-upload-btn"
              >
                Register Lecture
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
