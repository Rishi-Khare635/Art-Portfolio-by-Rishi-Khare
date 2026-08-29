import React from 'react';
import { 
  Inbox, 
  Trash2, 
  Mail, 
  Clock, 
  User, 
  CheckCheck,
  PlusCircle,
  ArrowLeft
} from 'lucide-react';
import { InboxMessage } from '../types';

interface PrivateInboxViewProps {
  messages: InboxMessage[];
  onDeleteMessage: (id: string) => void;
  onToggleRead: (id: string) => void;
  onBackToGallery: () => void;
  onOpenUpload: () => void;
}

export const PrivateInboxView: React.FC<PrivateInboxViewProps> = ({
  messages,
  onDeleteMessage,
  onToggleRead,
  onBackToGallery,
  onOpenUpload
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToGallery}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Gallery</span>
          </button>
          <div>
            <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
              <Inbox className="w-5 h-5 text-indigo-400" />
              Private Inbox
            </h1>
            <p className="text-xs text-slate-400">
              Questions and messages sent by visitors through your contact form.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenUpload}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Sketch</span>
        </button>
      </div>

      {/* Messages List */}
      {messages.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 text-slate-500 flex items-center justify-center mx-auto border border-white/10">
            <Mail className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-semibold text-slate-300">Inbox is empty</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When people ask questions using the "Ask a Question" button on your portfolio, their messages will arrive here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-5 rounded-2xl border transition-all ${
                msg.read 
                  ? 'bg-white/[0.02] border-white/10 text-slate-300' 
                  : 'bg-white/[0.06] border-indigo-500/40 text-white shadow-lg'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-xs font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-white flex items-center gap-2">
                      <span>{msg.senderName}</span>
                      {!msg.read && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                          New
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {msg.senderEmail}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(msg.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                  
                  <button
                    onClick={() => onToggleRead(msg.id)}
                    title={msg.read ? "Mark as unread" : "Mark as read"}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-indigo-300 transition-colors"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteMessage(msg.id)}
                    title="Delete message"
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {msg.subject && (
                <div className="text-xs font-semibold text-indigo-300 mb-1.5">
                  Subject: {msg.subject}
                </div>
              )}

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {msg.question}
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
