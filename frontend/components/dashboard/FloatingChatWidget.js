'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Minimize2,
  Maximize2,
  Copy,
  Trash2,
  ExternalLink,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { chatService } from '@/services/chat.service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function FloatingChatWidget() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Dedicated AI Bot State
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);
  const aiInputRef = useRef(null);

  const role = user?.role || 'GUEST';

  // Role-tailored initial prompts & welcome message
  const initialRoleData = useMemo(() => {
    let welcomeText = 'Namaste! Welcome to BookSaathi. How can I assist you with doctor discovery, appointments, or consultation bookings today?';
    let initialPrompts = ['🔍 How does booking work?', '💼 Register as a Professional', '🔐 Is patient data secure?'];

    if (role === 'USER') {
      welcomeText = `Namaste ${user.name || 'there'}! 🙏 I am your Patient & Client AI Assistant. How can I assist you with scheduling, doctor discovery, or appointment management today?`;
      initialPrompts = ['📅 How do I reschedule?', '🩺 Find a Doctor or CA', '💳 Cancellation & Refund terms', '🧾 Where are my invoices?'];
    } else if (role === 'PROFESSIONAL') {
      welcomeText = `Namaste Doctor/Consultant! 🙏 I am your Practice AI Assistant. How can I help you optimize your schedule, QR standee kit, tariffs, or booking link?`;
      initialPrompts = ['⏰ Set weekly shifts', '🪧 Reception QR Standee order', '💎 Pro subscription features', '📝 Add consultation walk-in'];
    } else if (role === 'ADMIN') {
      welcomeText = `Admin AI Assistant online. I am ready to help summarize platform metrics, user verifications, or dispute resolutions.`;
      initialPrompts = ['📊 Command center metrics', '🛡️ Review pending verifications', '⚖️ Grievance resolution flow'];
    }

    return { welcomeText, initialPrompts };
  }, [role, user]);

  // Initialize AI Welcome Message
  useEffect(() => {
    setAiMessages([
      {
        id: 'ai-welcome',
        sender: 'bot',
        name: role === 'ADMIN' ? 'Admin AI' : role === 'PROFESSIONAL' ? 'Practice AI Assistant' : 'BookSaathi AI',
        text: initialRoleData.welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        prompts: initialRoleData.initialPrompts,
      },
    ]);
  }, [initialRoleData, role]);

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

  // Auto-scroll messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, isOpen, aiLoading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => aiInputRef.current?.focus(), 200);
    }
  }, [isOpen]);

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

    setAiMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setAiInput('');
    setAiLoading(true);

    try {
      const res = await chatService.queryAiBot(text);
      const data = res.data;

      setAiMessages((prev) => [
        ...prev,
        {
          id: `ai-b-${Date.now()}`,
          sender: 'bot',
          name: user?.role === 'ADMIN' ? 'Admin AI' : user?.role === 'PROFESSIONAL' ? 'Practice AI Assistant' : 'BookSaathi Assistant',
          text: data?.reply || 'I am processing your query. Please let me know if you need further assistance with your practice or appointments.',
          prompts: data?.quickPrompts || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      // Graceful offline fallback
      let fallbackText = "I'm having trouble connecting to the AI server. For practice management, use your left sidebar or visit Settings.";
      if (text.toLowerCase().includes('reschedule') || text.toLowerCase().includes('cancel')) {
        fallbackText = 'To reschedule or cancel an appointment, navigate to "Appointments" in your dashboard, select the consultation, and click Reschedule.';
      } else if (text.toLowerCase().includes('qr') || text.toLowerCase().includes('standee')) {
        fallbackText = 'You can order or download your Reception QR Standee Kit from the "Practice Setup → QR Kit" section.';
      }

      setAiMessages((prev) => [
        ...prev,
        {
          id: `ai-b-${Date.now()}`,
          sender: 'bot',
          name: 'BookSaathi AI',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Response copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearAiChat = () => {
    setAiMessages([
      {
        id: 'ai-welcome-reset',
        sender: 'bot',
        name: role === 'ADMIN' ? 'Admin AI' : role === 'PROFESSIONAL' ? 'Practice AI Assistant' : 'BookSaathi AI',
        text: initialRoleData.welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        prompts: initialRoleData.initialPrompts,
      },
    ]);
    toast.info('AI session reset');
  };

  const messagesPageLink = role === 'ADMIN' ? '/admin/messages' : '/dashboard/messages';

  // Only render the AI Chat-Bot icon on the main dashboard page
  const isDashboardPage = pathname === '/dashboard' || pathname === '/admin';
  if (!isDashboardPage) {
    return null;
  }

  return (
    <>
      {/* 1. Backdrop for mobile or full-screen mode */}
      {isOpen && (
        <div
          className={cn(
            'fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity sm:hidden',
            isFullScreen && 'sm:block'
          )}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 2. Redesigned AI Bot Window (Mobile Responsive Sheet / Desktop Floating Dialog) */}
      {isOpen && (
        <div
          className={cn(
            'fixed z-50 bg-white shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden transition-all duration-300 font-sans',
            isFullScreen
              ? 'inset-2 sm:inset-6 md:inset-10 rounded-3xl'
              : 'inset-x-2 top-3 bottom-[76px] sm:inset-auto sm:bottom-22 sm:right-6 sm:w-[440px] sm:h-[600px] sm:max-h-[85vh] rounded-3xl'
          )}
        >
          {/* Top Header */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-3.5 sm:p-4 flex items-center justify-between gap-2 border-b border-indigo-900/40 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-black text-white tracking-tight flex items-center gap-1.5">
                  <span>BookSaathi AI Assistant</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                </h3>
                <p className="text-[10px] text-slate-300 truncate">
                  {role === 'ADMIN'
                    ? 'Admin Operations Assistant'
                    : role === 'PROFESSIONAL'
                    ? 'Practice & Consultation Assistant'
                    : 'Patient & Discovery Assistant'}
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1 shrink-0">
              {aiMessages.length > 1 && (
                <button
                  type="button"
                  onClick={handleClearAiChat}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                  title="Clear conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors hidden sm:inline-flex cursor-pointer"
                title={isFullScreen ? 'Exit full screen' : 'Expand full screen'}
              >
                {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-white/20 active:scale-95 rounded-xl transition-all cursor-pointer"
                title="Close AI Assistant"
                aria-label="Close AI Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick link to Live Messages Page */}
          {user && (
            <div className="bg-indigo-50/80 px-3.5 py-1.5 border-b border-indigo-100 flex items-center justify-between text-[11px] shrink-0">
              <span className="text-indigo-900 font-medium truncate">
                Need to chat with booked clients/doctors?
              </span>
              <Link
                href={messagesPageLink}
                onClick={() => setIsOpen(false)}
                className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0 ml-2"
              >
                <span>Live Messages</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* AI Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 overscroll-contain bg-slate-50/60">
            {aiMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-150 group',
                    isUser ? 'items-end' : 'items-start'
                  )}
                >
                  <div className={cn('flex items-center gap-1.5 mb-1 px-1', isUser ? 'flex-row-reverse' : 'flex-row')}>
                    <span className="text-[10px] font-bold text-slate-500">{msg.name}</span>
                    <span className="text-[9px] text-slate-400">{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-indigo-600 transition-opacity"
                        title="Copy response"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={cn(
                      'max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs',
                      isUser
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-xs font-medium ml-auto shadow-indigo-600/20'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs mr-auto'
                    )}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                    {/* Interactive Quick Prompts Chips */}
                    {msg.prompts && msg.prompts.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {msg.prompts.map((p, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => handleSendAiMessage(p.replace(/^[^\w\s]+/, '').trim())}
                            className="text-[10px] font-semibold bg-indigo-50/80 hover:bg-indigo-600 hover:text-white text-indigo-700 px-2.5 py-1 rounded-xl transition-all border border-indigo-100/80 active:scale-95 cursor-pointer shadow-2xs"
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* AI Writing / Generating Indicator */}
            {aiLoading && (
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white border border-indigo-100 shadow-2xs max-w-[80%] animate-in fade-in duration-200">
                <div className="w-6 h-6 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-indigo-950">AI is composing response...</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* AI Input Dock */}
          <div className="p-3 bg-white border-t border-slate-200/80 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendAiMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={aiInputRef}
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder={`Ask AI (${role === 'PROFESSIONAL' ? 'Practice & Shifts' : role === 'USER' ? 'Doctor & Bookings' : 'Assistant'})...`}
                className="flex-1 bg-slate-100/90 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!aiInput.trim() || aiLoading}
                className="w-10 h-10 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-md shadow-indigo-600/30 active:scale-95 shrink-0 cursor-pointer"
                title="Send query to AI"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Floating Action Button (FAB): Only rendered when chat modal is CLOSED */}
      {!isOpen && (
        <div className="fixed bottom-20 right-3.5 sm:bottom-6 sm:right-6 z-50 font-sans flex items-center gap-2.5 pointer-events-auto animate-in fade-in zoom-in-90 duration-200">
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-950 text-white text-xs font-bold shadow-xl border border-slate-800 cursor-pointer hover:bg-slate-900 transition-all active:scale-95"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {role === 'PROFESSIONAL'
                ? 'Practice AI Assistant'
                : role === 'USER'
                ? 'Doctor AI Assistant'
                : 'BookSaathi AI Assistant'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            title="Open BookSaathi AI Assistant"
            className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 hover:from-indigo-500 hover:to-sky-300 text-white shadow-xl shadow-indigo-600/40 hover:shadow-indigo-600/60 transition-all transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            aria-label="Open AI Assistant"
          >
            <Bot className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
          </button>
        </div>
      )}
    </>
  );
}
