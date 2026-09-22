'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { chatService } from '@/services/chat.service';
import { AIChatHeader } from '../ai/AIChatHeader';
import { AIWelcomeScreen } from '../ai/AIWelcomeScreen';
import { AIMessage } from '../ai/AIMessage';
import { AILoadingState } from '../ai/AILoadingState';
import { AIChatInput } from '../ai/AIChatInput';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * Custom Sleek BookSaathi AI Copilot Sparkle Icon
 */
export function AiCopilotIcon({ className = 'w-6 h-6', glowing = false }) {
  return (
    <div className={cn('relative flex items-center justify-center select-none', className)}>
      <svg
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 transition-transform group-hover:scale-105 duration-200"
      >
        <defs>
          <linearGradient id="bs-ai-grad" x1="2" y1="2" x2="26" y2="26" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E0E7FF" />
          </linearGradient>
        </defs>

        {/* Primary 4-pointed curved AI Star */}
        <path
          d="M14 2.5C14.55 8.25 19.25 12.95 25 13.5C25.65 13.55 25.65 14.45 25 14.5C19.25 15.05 14.55 19.75 14 25.5C13.45 19.75 8.75 15.05 3 14.5C2.35 14.45 2.35 13.55 3 13.5C8.75 12.95 13.45 8.25 14 2.5Z"
          fill="url(#bs-ai-grad)"
        />

        {/* Top-Right Sparkle */}
        <path
          d="M22.5 3C22.75 4.85 24.15 6.25 26 6.5C26.4 6.55 26.4 7.25 26 7.3C24.15 7.55 22.75 8.95 22.5 10.8C22.25 8.95 20.85 7.55 19 7.3C18.6 7.25 18.6 6.55 19 6.5C20.85 6.25 22.25 4.85 22.5 3Z"
          fill="#FDE047"
        />

        {/* Center core */}
        <circle cx="14" cy="14" r="2.2" fill="#4F46E5" />
      </svg>
    </div>
  );
}

export default function FloatingChatWidget() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dedicated AI Bot State
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiUsage, setAiUsage] = useState(null);

  const messagesEndRef = useRef(null);

  const role = user?.role || 'GUEST';

  // Fetch daily AI message quota on mount
  useEffect(() => {
    if (mounted) {
      chatService
        .getAiUsage()
        .then((res) => {
          if (res?.data) setAiUsage(res.data);
        })
        .catch(() => {});
    }
  }, [mounted, user]);

  const roleLabel = useMemo(() => {
    if (role === 'USER') return 'Care & Appointment Assistant';
    if (role === 'PROFESSIONAL') return 'Practice & Schedule Assistant';
    if (role === 'ADMIN') return 'Platform Operations Assistant';
    return 'BookSaathi Assistant';
  }, [role]);

  // Global event listener to trigger AI assistant
  useEffect(() => {
    const handleOpenEvent = () => {
      setIsOpen(true);
    };
    window.addEventListener('open:ai_bot', handleOpenEvent);
    return () => {
      window.removeEventListener('open:ai_bot', handleOpenEvent);
    };
  }, []);

  // Keyboard shortcut listener (Escape to close, Cmd/Ctrl+K to toggle)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto-scroll messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, isOpen, aiLoading]);

  // Send AI Query
  const handleSendAiMessage = async (textToSend) => {
    const text = (textToSend || aiInput).trim();
    if (!text || aiLoading) return;

    const userMsg = {
      id: `ai-u-${Date.now()}`,
      sender: 'user',
      name: user?.name || 'You',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = [...aiMessages, userMsg];
    setAiMessages(nextMessages);
    if (!textToSend) setAiInput('');
    setAiLoading(true);

    try {
      const history = nextMessages.slice(-6).map((m) => ({
        id: m.id,
        sender: m.sender,
        text: m.text || m.message || '',
      }));

      const res = await chatService.queryAiBot(text, { history });
      const data = res.data;

      if (data?.usage) {
        setAiUsage(data.usage);
      }

      setAiMessages((prev) => [
        ...prev,
        {
          id: `ai-b-${Date.now()}`,
          sender: 'bot',
          name: 'BookSaathi AI',
          message: data?.message || data?.reply || 'Information retrieved.',
          text: data?.reply || data?.message || '',
          sections: Array.isArray(data?.sections) ? data.sections : [],
          prompts: data?.quickPrompts || [],
          actions: data?.quickActions || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      let fallbackText = "I'm having trouble connecting to the AI server. Please try again or use the navigation sidebar.";
      if (text.toLowerCase().includes('reschedule') || text.toLowerCase().includes('cancel')) {
        fallbackText = 'To reschedule or cancel an appointment, navigate to "Appointments" in your dashboard, select the consultation, and click Reschedule.';
      }

      setAiMessages((prev) => [
        ...prev,
        {
          id: `ai-b-${Date.now()}`,
          sender: 'bot',
          name: 'BookSaathi AI',
          message: fallbackText,
          text: fallbackText,
          sections: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [{ label: 'View Dashboard', action: 'VIEW_ANALYTICS', href: '/dashboard' }],
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleClearAiChat = () => {
    setAiMessages([]);
    toast.info('Conversation history cleared');
  };

  // Allow AI assistant widget site-wide across all pages
  const isExcludedPage = pathname?.startsWith('/(auth)') && (pathname === '/login' || pathname === '/register');

  if (!mounted || isExcludedPage) {
    return null;
  }

  const isUnlimited = aiUsage?.isUnlimited;
  const limit = aiUsage?.limit || 10;
  const count = aiUsage?.count || 0;
  const remaining = isUnlimited ? 'Unlimited' : Math.max(0, limit - count);
  const isExhausted = !isUnlimited && remaining === 0;

  return (
    <>
      {/* 1. Backdrop for full-screen or mobile drawer view */}
      {isOpen && isFullScreen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          onClick={() => setIsFullScreen(false)}
        />
      )}

      {/* 2. Sleek Floating AI Chat Popup (Anchored Bottom-Right) */}
      {isOpen && (
        <div
          className={cn(
            'fixed z-50 bg-white shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden font-sans transition-all duration-200 animate-in fade-in zoom-in-95',
            isFullScreen
              ? 'inset-3 sm:inset-6 md:inset-10 sm:max-w-4xl sm:mx-auto rounded-2xl'
              : 'bottom-[76px] right-3 left-3 sm:left-auto sm:right-6 sm:bottom-24 w-auto sm:w-[420px] h-[540px] sm:h-[630px] max-h-[calc(100dvh-92px)] rounded-2xl'
          )}
        >
          {/* Header */}
          <AIChatHeader
            roleLabel={roleLabel}
            isFullScreen={isFullScreen}
            onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
            onClearChat={handleClearAiChat}
            onClose={() => setIsOpen(false)}
            hasMessages={aiMessages.length > 0}
          />

          {/* Conversation Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 overscroll-contain bg-slate-50/70">
            {aiMessages.length === 0 ? (
              <AIWelcomeScreen
                role={role}
                userName={user?.name || ''}
                onSelectPrompt={handleSendAiMessage}
              />
            ) : (
              aiMessages.map((msg) => (
                <AIMessage
                  key={msg.id}
                  msg={msg}
                  onPromptClick={handleSendAiMessage}
                  onActionClick={() => setIsOpen(false)}
                />
              ))
            )}

            {/* Thinking Animation */}
            {aiLoading && <AILoadingState />}

            <div ref={messagesEndRef} />
          </div>

          {/* Clean Input Dock */}
          <AIChatInput
            input={aiInput}
            setInput={setAiInput}
            onSend={() => handleSendAiMessage()}
            loading={aiLoading}
            isExhausted={isExhausted}
            remaining={remaining}
            limit={limit}
            isUnlimited={isUnlimited}
            role={role}
            plan={aiUsage?.plan || 'FREE'}
            suggestions={aiMessages.length > 0 ? aiMessages[aiMessages.length - 1]?.prompts : []}
            onSelectSuggestion={(s) => handleSendAiMessage(s.replace(/^[^\w\s]+/, '').trim())}
          />
        </div>
      )}

      {/* 3. Fixed AI Squircle Button (Bottom Right - safely above mobile bottom nav) */}
      {!isOpen && (
        <div className="fixed bottom-20 right-3.5 sm:bottom-6 sm:right-6 z-40 font-sans flex items-center gap-2 select-none pointer-events-auto">
          {/* Desktop Hover Tooltip */}
          {isTooltipVisible && (
            <div className="hidden sm:flex items-center px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-medium shadow-md border border-slate-700/60 animate-in fade-in slide-in-from-right-1 duration-150 whitespace-nowrap">
              <span>Ask BookSaathi AI</span>
              <kbd className="ml-1.5 px-1 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                ⌘K
              </kbd>
            </div>
          )}

          {/* Fixed AI Action Button */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            onMouseEnter={() => setIsTooltipVisible(true)}
            onMouseLeave={() => setIsTooltipVisible(false)}
            title="BookSaathi AI (⌘K)"
            aria-label="Open BookSaathi AI Assistant"
            className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500/40 transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          >
            <div className="relative flex items-center justify-center">
              <AiCopilotIcon className="w-5 h-5 sm:w-6 sm:h-6" glowing={false} />
            </div>

            {/* Subtle Active Indicator Dot */}
            <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 flex h-2 sm:h-2.5 w-2 sm:w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-full w-full bg-emerald-400 border border-indigo-600" />
            </span>
          </button>
        </div>
      )}
    </>
  );
}
