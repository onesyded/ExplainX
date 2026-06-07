import React, { useState, useEffect } from 'react';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface CommentData {
  id: string;
  lessonId: string;
  courseId: string;
  userId: string;
  userName: string;
  text: string;
  replyText?: string;
  createdAt: any;
  updatedAt: any;
}

export default function LessonComments({ lesson, user, isAdmin = false }: { lesson: any, user: User | null, isAdmin?: boolean }) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check if the user is the custom admin to write their admins doc (bootstrapping metadata)
    const bootstrapAdminDoc = async () => {
      if (user && user.email === 'richmond006mensah@gmail.com') {
        try {
          await setDoc(doc(db, 'admins', user.uid), { email: user.email });
        } catch (e) {
          // Ignore
        }
      }
    };
    bootstrapAdminDoc();
  }, [user]);

  useEffect(() => {
    if (!lesson?.id) return;
    const q = query(
      collection(db, 'comments'),
      where('courseId', '==', lesson.courseId || 'thermo-ii'),
      where('lessonId', '==', lesson.id),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: CommentData[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() } as CommentData);
      });
      setComments(data);
    }, (error) => {
      console.error("Comments subscribe error", error);
      handleFirestoreError(error, OperationType.LIST, 'comments');
    });
    return () => unsubscribe();
  }, [lesson?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    try {
      const id = 'comment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, 'comments', id), {
        id,
        lessonId: lesson.id,
        courseId: 'thermo-ii', // Or extract from context if available
        userId: user.uid,
        userName: user.displayName || 'Student',
        text: newComment.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setNewComment('');
    } catch (err: any) {
      alert("Error adding comment: " + err.message);
    }
  };

  const handleReply = async (commentId: string) => {
    const text = replyTextMap[commentId];
    if (!text?.trim()) return;
    try {
      await updateDoc(doc(db, 'comments', commentId), {
        replyText: text.trim(),
        updatedAt: serverTimestamp()
      });
      setReplyTextMap(prev => ({ ...prev, [commentId]: '' }));
    } catch (err: any) {
      alert("Error adding reply: " + err.message);
    }
  };

  return (
    <div className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md transition-colors">
      <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">Discussion & Questions</h3>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Ask a question about this lesson..."
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0D1E36] focus:border-transparent outline-none mb-3 resize-none h-24"
        />
        <button
          type="submit"
          className="bg-[#0D1E36] text-white px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide hover:bg-slate-800 transition-colors shadow-sm"
        >
          Post Question
        </button>
      </form>

      <div className="space-y-6">
        {comments.map(c => (
          <div key={c.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                {c.userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{c.userName}</p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleString() : 'Just now'}
                </p>
              </div>
            </div>
            <p className="text-slate-700 text-sm mb-4 leading-relaxed pl-11">{c.text}</p>
            
            {c.replyText && (
              <div className="ml-11 mt-3 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl relative">
                <div className="absolute -left-[23px] top-6 w-5 border-t-2 border-emerald-200"></div>
                <div className="flex items-center space-x-2 mb-1.5">
                  <div className="w-5 h-5 rounded-md bg-emerald-600 flex items-center justify-center text-white font-bold text-[10px]">TA</div>
                  <span className="text-xs font-bold text-emerald-800 tracking-wide uppercase">Teaching Assistant</span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">{c.replyText}</p>
              </div>
            )}

            {isAdmin && !c.replyText && (
              <div className="ml-11 mt-4">
                <textarea
                  value={replyTextMap[c.id] || ''}
                  onChange={(e) => setReplyTextMap(prev => ({ ...prev, [c.id]: e.target.value }))}
                  placeholder="Type reply as admin..."
                  className="w-full text-sm p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none mb-2"
                />
                <button
                  onClick={() => handleReply(c.id)}
                  className="text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-lg"
                >
                  Post Reply
                </button>
              </div>
            )}
          </div>
        ))}
        
        {comments.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm font-medium">
            No questions yet. Be the first to ask!
          </div>
        )}
      </div>
    </div>
  );
}
