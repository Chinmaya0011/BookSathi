'use client';

import React from 'react';
import { X, Minimize2, Maximize2, RotateCcw, Sparkles } from 'lucide-react';
import { AiCopilotIcon } from '../dashboard/FloatingChatWidget';
import { cn } from '@/lib/utils';

export function AIChatHeader({
  roleLabel = 'Appointment Assistant',
  isFullScreen = false,
  onToggleFullScreen,
  onClearChat,
  onClose,
  hasMessages = false,
}) {
  return (
    <div className="relative bg-white border-b border-slate-200/90 px-4 py-3.5 flex items-center justify-between gap-3 shrink-0 select-none">
      {/* Left: AI Brand Identity */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative flex items-center justify-center">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs border border-indigo-500/30 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white" />
          </span>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight truncate">
              BookSaathi AI
            </h3>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
              Copilot
            </span>
          </div>
          <p className="text-[11px] text-slate-500 truncate font-medium mt-0.5">
            {roleLabel}
          </p>
        </div>
      </div>

      {/* Right: Header Controls */}
      <div className="flex items-center gap-1 shrink-0">
        {hasMessages && (
          <button
            type="button"
            onClick={onClearChat}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Clear conversation"
            aria-label="Clear conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={onToggleFullScreen}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors hidden sm:inline-flex cursor-pointer"
          title={isFullScreen ? 'Exit full screen' : 'Expand full screen'}
          aria-label="Toggle full screen"
        >
          {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Close AI Assistant"
          aria-label="Close AI Assistant"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
