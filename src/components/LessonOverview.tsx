import { useState, useEffect } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { Lesson } from '../types';

interface LessonOverviewProps {
  lesson: Lesson;
  onUpdateOverview: (lessonId: string, text: string) => void;
}

export default function LessonOverview({ lesson, onUpdateOverview }: LessonOverviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableText, setEditableText] = useState(lesson.overview);

  useEffect(() => {
    setEditableText(lesson.overview);
    setIsEditing(false);
  }, [lesson.id, lesson.overview]);

  const handleSave = () => {
    onUpdateOverview(lesson.id, editableText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditableText(lesson.overview);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col group" id="lesson-overview-card">
      <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2.5" id="overview-card-header">
        <h3 className="text-base font-bold text-slate-900 font-sans tracking-tight">
          Lesson Overview
        </h3>
        
        {isEditing ? (
          <div className="flex items-center space-x-2" id="editing-actions-set">
            <button
              onClick={handleSave}
              className="text-emerald-600 hover:text-emerald-700 p-1 rounded hover:bg-emerald-50 transition-colors cursor-pointer"
              title="Save Changes"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="text-rose-600 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
              title="Discard Changes"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded hover:bg-slate-50 cursor-pointer"
            title="Edit Description"
            id="overview-edit-trigger"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isEditing ? (
        <textarea
          value={editableText}
          onChange={(e) => setEditableText(e.target.value)}
          rows={3}
          className="w-full text-slate-600 text-[13px] leading-relaxed font-sans border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#0D1E36] focus:border-[#0D1E36] bg-slate-50/50"
          id="overview-textarea"
        />
      ) : (
        <p className="text-slate-600 text-[13.5px] leading-relaxed font-sans whitespace-pre-wrap select-text" id="overview-body-content">
          {lesson.overview}
        </p>
      )}
    </div>
  );
}
