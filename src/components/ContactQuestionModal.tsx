import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  Check, 
  MessageSquare
} from 'lucide-react';
import { InboxMessage } from '../types';

interface ContactQuestionModalProps {
  onClose: () => void;
  onSendMessage: (msg: Omit<InboxMessage, 'id' | 'timestamp' | 'read'>) => void;
}

export const ContactQuestionModal: React.FC<ContactQuestionModalProps> = ({ 
  onClose,
  onSendMessage
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [question, setQuestion] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !question.trim()) return;

    onSendMessage({
      senderName: name.trim(),
      senderEmail: email.trim() || 'No email provided',
      subject: subject.trim() || 'Art Question / Feedback',
      question: question.trim()
    });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-[#161828] border border-white/15 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">
                Ask Rishi a Question
              </h2>
              <p className="text-xs text-slate-400">
                Send a question directly to Rishi's private inbox.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-2">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white font-display">Message Sent to Private Inbox</h3>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              Thank you, {name}! Your question has been delivered to Rishi's private inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Your Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-black/40 text-xs text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-white/15 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Email Address (optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full bg-black/40 text-xs text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-white/15 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Subject (optional)</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Sketch technique, commission question"
                className="w-full bg-black/40 text-xs text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-white/15 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Your Question / Message *</label>
              <textarea
                rows={4}
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question or message for Rishi here..."
                className="w-full bg-black/40 text-xs text-white placeholder-slate-500 p-3 rounded-xl border border-white/15 focus:border-indigo-500 focus:outline-none resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">🔒 Delivered to private inbox</span>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Question</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
