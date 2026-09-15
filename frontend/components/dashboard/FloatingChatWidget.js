'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Send,
  Sparkles,
  Minimize2,
  Maximize2,
  Copy,
  RotateCcw,
  Check,
  ShieldCheck,
  MessageSquare,
  ChevronRight,
  ArrowUpRight,
  Zap,
  Crown,
  Lock,
  User as UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@/hooks/useAuth';
import { chatService } from '@/services/chat.service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * Custom Sleek Enterprise AI Copilot Icon Component
 * High-definition multi-layer gradient star + orbital nexus design (Apple Intelligence / Gemini style)
 */
export function AiCopilotIcon({ className = 'w-6 h-6', glowing = true }) {
  return (
    <div className={cn('relative flex items-center justify-center select-none', className)}>
      {glowing && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/60 via-sky-400/50 to-fuchsia-500/60 blur-[4px] animate-pulse pointer-events-none" />
      )}
      <svg
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_2px_8px_rgba(99,102,241,0.35)] transition-transform group-hover:scale-110 duration-300"
      >
        <defs>
          <linearGradient id="copilot-primary-grad" x1="2" y1="2" x2="26" y2="26" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="30%" stopColor="#6366F1" />
            <stop offset="65%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          <linearGradient id="copilot-sparkle-grad" x1="18" y1="2" x2="27" y2="11" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
          <radialGradient id="copilot-core-light" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="45%" stopColor="#E0E7FF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="copilot-ambient-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#818CF8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient background disc */}
        <circle cx="14" cy="14" r="12" fill="url(#copilot-ambient-glow)" />

        {/* Primary 4-pointed curved AI Star */}
        <path
          d="M14 2.5C14.55 8.25 19.25 12.95 25 13.5C25.65 13.55 25.65 14.45 25 14.5C19.25 15.05 14.55 19.75 14 25.5C13.45 19.75 8.75 15.05 3 14.5C2.35 14.45 2.35 13.55 3 13.5C8.75 12.95 13.45 8.25 14 2.5Z"
          fill="url(#copilot-primary-grad)"
        />

        {/* Center core light node */}
        <circle cx="14" cy="14" r="3.2" fill="url(#copilot-core-light)" />
        <circle cx="14" cy="14" r="1.3" fill="#FFFFFF" />

        {/* Top-Right Satellite Sparkle */}
        <path
          d="M22.5 3C22.75 4.85 24.15 6.25 26 6.5C26.4 6.55 26.4 7.25 26 7.3C24.15 7.55 22.75 8.95 22.5 10.8C22.25 8.95 20.85 7.55 19 7.3C18.6 7.25 18.6 6.55 19 6.5C20.85 6.25 22.25 4.85 22.5 3Z"
          fill="url(#copilot-sparkle-grad)"
        />

        {/* Bottom-Left Micro Star Node */}
        <circle cx="5.5" cy="22.5" r="1.5" fill="#38BDF8" opacity="0.95" />
        <circle cx="5.5" cy="22.5" r="0.6" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

/**
 * Sleek SVG Circular Progress Meter (Graphical gauge for remaining quota e.g. 2 / 5 left)
 */
function AiQuotaRing({ remaining = 0, limit = 10, isUnlimited = false, size = 18, strokeWidth = 2.5 }) {
  if (isUnlimited) {
    return <Crown className="w-3.5 h-3.5 text-amber-300 shrink-0" />;
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const fraction = limit > 0 ? Math.min(1, Math.max(0, remaining / limit)) : 0;
  const strokeDashoffset = circumference - fraction * circumference;
  const isExhausted = remaining === 0;
  const isLow = remaining <= 2 && remaining > 0;

  const strokeColor = isExhausted
    ? '#F43F5E' // Rose 500
    : isLow
    ? '#F59E0B' // Amber 500
    : '#38BDF8'; // Sky 400

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(148, 163, 184, 0.25)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Active Remaining Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-700 ease-out"
        />
      </svg>
    </div>
  );
}

/**
 * Graphical Segmented / Linear Meter Bar
 * Displays individual graphical slots (e.g. 5 ticks for 5 query limit) or smooth continuous fill
 */
function AiQuotaSegmentedBar({ remaining = 0, limit = 5, isUnlimited = false, className = '' }) {
  if (isUnlimited) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <div className="h-1.5 w-12 rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 animate-pulse" />
      </div>
    );
  }

  const safeLimit = Math.max(1, limit);
  const used = Math.max(0, safeLimit - remaining);
  const isExhausted = remaining === 0;
  const isLow = remaining <= 2 && remaining > 0;

  // For limits <= 10, render discrete graphical segment chips for maximum visual clarity
  if (safeLimit <= 10) {
    return (
      <div className={cn('flex items-center gap-1 shrink-0', className)} title={`${remaining} of ${safeLimit} queries remaining`}>
        {Array.from({ length: safeLimit }).map((_, idx) => {
          // Slots from left to right: first (limit - remaining) are consumed, rest are remaining
          const isSlotAvailable = idx >= used;
          return (
            <span
              key={idx}
              className={cn(
                'h-1.5 w-2.5 rounded-xs transition-all duration-500',
                isSlotAvailable
                  ? isExhausted
                    ? 'bg-rose-500 shadow-xs shadow-rose-500/50'
                    : isLow
                    ? 'bg-amber-400 shadow-xs shadow-amber-400/50'
                    : 'bg-sky-400 shadow-xs shadow-sky-400/50'
                  : 'bg-slate-300/40 dark:bg-slate-700/60'
              )}
            />
          );
        })}
      </div>
    );
  }

  // For larger limits (e.g., 25), render a smooth proportional gradient bar
  const pct = Math.min(100, Math.max(0, (remaining / safeLimit) * 100));
  return (
    <div className={cn('h-1.5 w-16 bg-slate-200/80 dark:bg-slate-700/80 rounded-full overflow-hidden shrink-0', className)}>
      <div
        className={cn(
          'h-full transition-all duration-700 rounded-full',
          isExhausted
            ? 'bg-rose-500'
            : isLow
            ? 'bg-gradient-to-r from-amber-500 to-orange-400'
            : 'bg-gradient-to-r from-sky-400 to-indigo-500'
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function FloatingChatWidget() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dedicated AI Bot State
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [aiUsage, setAiUsage] = useState(null);
  const [showQuotaCard, setShowQuotaCard] = useState(false);

  const messagesEndRef = useRef(null);
  const aiInputRef = useRef(null);

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

  // Role-tailored initial prompts & welcome message
  const initialRoleData = useMemo(() => {
    let welcomeText = 'Namaste! Welcome to **BookSaathi AI Copilot**. How can I assist you with professional discovery, appointments, or consultation bookings today?';
    let initialPrompts = ['🔍 How does booking work?', '💼 Register as a Professional', '🔐 Is customer data secure?'];
    let roleLabel = 'Customer Discovery Assistant';

    if (role === 'USER') {
      welcomeText = `Namaste **${user?.name || 'there'}**! 🙏 I am your **Personal Care & Appointment Copilot**.\n\nI have real-time access to your booked appointments, doctor schedules, and cancellation policies. How can I assist you today?`;
      initialPrompts = [
        '📅 What appointments do I have tomorrow?',
        '🩺 Who is my next appointment with?',
        '📊 How many appointments do I have this month?',
        '💳 Refund & Cancellation policy',
      ];
      roleLabel = 'Patient & Client Copilot';
    } else if (role === 'PROFESSIONAL') {
      welcomeText = `Namaste **${user?.name || 'Professional'}**! 🙏 I am your **Practice & Schedule Copilot**.\n\nI can analyze your live patient queue, upcoming consultation bookings, weekly shift hours, and service tariffs.`;
      initialPrompts = [
        '📋 How many bookings do I have today?',
        '📅 Show my upcoming appointments',
        '⏰ What is my weekly availability?',
        '📈 How many appointments completed this week?',
      ];
      roleLabel = 'Practice Intelligence Copilot';
    } else if (role === 'ADMIN') {
      welcomeText = `**Command Center Copilot online.** I can summarize platform activity, registered user metrics, active verified professionals, and system health status.`;
      initialPrompts = [
        '📊 Give me a summary of platform activity',
        '👥 How many users are registered?',
        '📅 How many bookings were created this month?',
        '🛡️ Review pending grievances',
      ];
      roleLabel = 'Platform Operations Copilot';
    }

    return { welcomeText, initialPrompts, roleLabel };
  }, [role, user]);

  // Initialize AI Welcome Message
  useEffect(() => {
    setAiMessages([
      {
        id: 'ai-welcome',
        sender: 'bot',
        name: 'BookSaathi Copilot',
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

    const nextMessages = [...aiMessages, userMsg];
    setAiMessages(nextMessages);
    if (!textToSend) setAiInput('');
    setAiLoading(true);

    try {
      // Build lightweight conversation history for multi-turn context
      const history = nextMessages.slice(-6).map((m) => ({
        id: m.id,
        sender: m.sender,
        text: m.text,
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
          name: 'BookSaathi Copilot',
          text: data?.reply || 'I am processing your query. Please let me know if you need further assistance with your practice or appointments.',
          prompts: data?.quickPrompts || [],
          actions: data?.quickActions || [],
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
          name: 'BookSaathi Copilot',
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
        name: 'BookSaathi Copilot',
        text: initialRoleData.welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        prompts: initialRoleData.initialPrompts,
      },
    ]);
    toast.info('Conversation history cleared');
  };

  const messagesPageLink = role === 'ADMIN' ? '/admin/messages' : '/dashboard/messages';

  // Only render on dashboard/admin routes
  const isDashboardPage = pathname === '/dashboard' || pathname === '/admin';
  if (!mounted || !isDashboardPage) {
    return null;
  }

  const isUnlimited = aiUsage?.isUnlimited;
  const limit = aiUsage?.limit || 10;
  const count = aiUsage?.count || 0;
  const remaining = isUnlimited ? 'Unlimited' : Math.max(0, limit - count);
  const isExhausted = !isUnlimited && remaining === 0;
  const isLow = !isUnlimited && remaining <= 2 && remaining > 0;

  return (
    <>
      {/* 1. Backdrop for mobile or full-screen mode */}
      {isOpen && (
        <div
          className={cn(
            'fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity sm:hidden',
            isFullScreen && 'sm:block sm:bg-slate-950/70 sm:backdrop-blur-sm'
          )}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 2. Sleek Minimalist Professional AI Chat Window */}
      {isOpen && (
        <div
          className={cn(
            'fixed z-50 bg-white shadow-[0_24px_80px_-15px_rgba(15,23,42,0.45)] border border-slate-200/90 flex flex-col overflow-hidden transition-all duration-300 font-sans animate-in fade-in zoom-in-95',
            isFullScreen
              ? 'inset-2 sm:inset-4 md:inset-8 lg:inset-10 sm:max-w-5xl sm:mx-auto rounded-2xl sm:rounded-3xl'
              : 'inset-0 sm:inset-auto sm:bottom-20 sm:right-6 sm:w-[460px] md:w-[480px] sm:h-[660px] sm:max-h-[86vh] rounded-none sm:rounded-3xl'
          )}
        >
          {/* Clean Professional Header */}
          <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white px-4 py-3.5 flex items-center justify-between gap-3 border-b border-white/10 shrink-0 shadow-md">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />

            {/* Left: Brand Identity */}
            <div className="flex items-center gap-3 min-w-0 relative z-10">
              <div className="relative flex items-center justify-center">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-900 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30 shrink-0">
                  <AiCopilotIcon className="w-5 h-5" glowing={false} />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-950" />
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight truncate">
                    BookSaathi Copilot
                  </h3>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/25 text-indigo-200 border border-indigo-400/30 shadow-2xs">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300 shrink-0" />
                    <span>Gemini 3.7</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate font-medium mt-0.5">
                  {initialRoleData.roleLabel}
                </p>
              </div>
            </div>

            {/* Right: Clean Header Controls */}
            <div className="flex items-center gap-1.5 shrink-0 relative z-10">
              {aiMessages.length > 1 && (
                <button
                  type="button"
                  onClick={handleClearAiChat}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                  title="Clear conversation"
                  aria-label="Clear conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all hidden sm:inline-flex cursor-pointer"
                title={isFullScreen ? 'Exit full screen' : 'Expand full screen'}
                aria-label="Toggle full screen"
              >
                {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/20 active:scale-95 rounded-xl transition-all cursor-pointer"
                title="Close AI Copilot"
                aria-label="Close AI Copilot"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Graphical AI Quota Details Overlay Card */}
          {showQuotaCard && aiUsage && (
            <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950 text-white p-4 border-b border-indigo-500/30 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 relative z-20">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-400/20">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <span className="text-xs font-bold text-white tracking-tight">AI Message Quota & Usage</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuotaCard(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title="Close Quota Details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Big Radial Progress & Graphical Breakdown */}
              <div className="py-3 flex items-center justify-between gap-4">
                {/* Visual SVG Donut Gauge */}
                <div className="flex items-center gap-3.5">
                  <div className="relative flex items-center justify-center p-1 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                    <AiQuotaRing remaining={remaining} limit={limit} isUnlimited={isUnlimited} size={50} strokeWidth={4.5} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xs font-black tracking-tight text-white">
                        {isUnlimited ? '∞' : remaining}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black text-white tracking-tight">
                        {isUnlimited ? 'Unlimited Access' : `${remaining} of ${limit} left today`}
                      </span>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[9px] font-bold border shadow-2xs',
                          isExhausted
                            ? 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                            : isLow
                            ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                        )}
                      >
                        {isExhausted ? 'Exhausted' : isLow ? 'Low Quota' : 'Healthy'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">
                      Daily limits reset automatically at midnight (12:00 AM IST)
                    </p>
                  </div>
                </div>

                {/* Graphical Linear Meter */}
                {!isUnlimited && (
                  <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[10px] font-semibold text-slate-300">
                      Used: <strong className="text-white font-bold">{count}</strong> / {limit}
                    </span>
                    <AiQuotaSegmentedBar remaining={remaining} limit={limit} isUnlimited={isUnlimited} />
                  </div>
                )}
              </div>

              {/* Account Tier & Upgrade CTA */}
              <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] gap-2">
                <span className="text-slate-400 truncate">
                  Role Tier:{' '}
                  <strong className="text-slate-200 font-bold">
                    {role === 'ADMIN'
                      ? 'Super Admin (Unlimited)'
                      : role === 'PROFESSIONAL'
                      ? aiUsage?.plan === 'PRO'
                        ? 'Pro Practice (25 msgs/day)'
                        : 'Free Solo (5 msgs/day)'
                      : 'Verified User (10 msgs/day)'}
                  </strong>
                </span>

                {role === 'PROFESSIONAL' && aiUsage?.plan === 'FREE' && (
                  <Link
                    href="/dashboard/subscription"
                    onClick={() => {
                      setShowQuotaCard(false);
                      setIsOpen(false);
                    }}
                    className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 underline underline-offset-2 shrink-0"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>Upgrade to Pro (25/day)</span>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Context Ribbon: Quick Link to Live Human Conversations */}
          {user && (
            <div className="bg-gradient-to-r from-indigo-50/90 via-slate-50 to-indigo-50/70 px-4 py-2 border-b border-indigo-100/80 flex items-center justify-between text-[11px] shrink-0">
              <div className="flex items-center gap-1.5 text-slate-700 min-w-0">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate font-medium">
                  Need to speak directly with clients or doctors?
                </span>
              </div>
              <Link
                href={messagesPageLink}
                onClick={() => setIsOpen(false)}
                className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0 ml-2 group cursor-pointer"
              >
                <span>Live Messages</span>
                <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          )}

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 overscroll-contain bg-slate-50/60">
            {aiMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200 group',
                    isUser ? 'items-end' : 'items-start'
                  )}
                >
                  {/* Message Author Badge */}
                  <div
                    className={cn(
                      'flex items-center gap-2 mb-1 px-1',
                      isUser ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    {!isUser ? (
                      <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center shadow-xs border border-indigo-500/20 shrink-0">
                        <AiCopilotIcon className="w-3.5 h-3.5" glowing={false} />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-lg bg-slate-800 text-white flex items-center justify-center shadow-xs shrink-0">
                        <UserIcon className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <span className="text-[11px] font-bold text-slate-700">{msg.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-200/60 transition-all cursor-pointer"
                        title="Copy response"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Message Card */}
                  <div
                    className={cn(
                      'max-w-[94%] sm:max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed transition-all',
                      isUser
                        ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 text-white rounded-tr-xs font-normal ml-auto shadow-md shadow-indigo-600/15'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs mr-auto shadow-sm'
                    )}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-line leading-relaxed text-white/95">{msg.text}</p>
                    ) : (
                      <div className="prose-xs max-w-none text-slate-800 leading-relaxed overflow-x-auto">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ node, ...props }) => (
                              <h1 className="text-sm font-black text-indigo-950 mt-2.5 mb-1.5" {...props} />
                            ),
                            h2: ({ node, ...props }) => (
                              <h2 className="text-xs font-black text-indigo-950 mt-2 mb-1 flex items-center gap-1.5 border-b border-slate-100 pb-1" {...props} />
                            ),
                            h3: ({ node, ...props }) => (
                              <h3 className="text-xs font-bold text-slate-900 mt-2 mb-1" {...props} />
                            ),
                            p: ({ node, ...props }) => (
                              <p className="mb-2 last:mb-0 leading-relaxed text-slate-800" {...props} />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul className="list-disc list-inside space-y-1.5 my-2 text-slate-700 ml-1" {...props} />
                            ),
                            ol: ({ node, ...props }) => (
                              <ol className="list-decimal list-inside space-y-1.5 my-2 text-slate-700 ml-1" {...props} />
                            ),
                            li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                            strong: ({ node, ...props }) => (
                              <strong className="font-bold text-slate-950" {...props} />
                            ),
                            blockquote: ({ node, ...props }) => (
                              <blockquote className="border-l-3 border-indigo-500 pl-3 py-1 my-2 bg-indigo-50/50 rounded-r-xl text-slate-700 italic" {...props} />
                            ),
                            table: ({ node, ...props }) => (
                              <div className="overflow-x-auto my-3 rounded-2xl border border-slate-200/90 shadow-xs bg-white">
                                <table className="w-full text-[11px] text-left border-collapse" {...props} />
                              </div>
                            ),
                            thead: ({ node, ...props }) => (
                              <thead className="bg-slate-100/90 text-slate-800 font-bold border-b border-slate-200" {...props} />
                            ),
                            th: ({ node, ...props }) => (
                              <th className="px-3.5 py-2.5 text-[10px] uppercase tracking-wider font-bold text-slate-700" {...props} />
                            ),
                            td: ({ node, ...props }) => (
                              <td className="px-3.5 py-2.5 border-t border-slate-100 text-slate-700 font-normal hover:bg-slate-50/60 transition-colors" {...props} />
                            ),
                            code: ({ node, inline, ...props }) =>
                              inline ? (
                                <code
                                  className="bg-slate-100 text-indigo-700 font-mono text-[10px] px-1.5 py-0.5 rounded-md font-semibold border border-slate-200/80"
                                  {...props}
                                />
                              ) : (
                                <code
                                  className="block bg-slate-900 text-slate-100 p-3 rounded-2xl text-[10px] font-mono overflow-x-auto my-2.5 shadow-inner"
                                  {...props}
                                />
                              ),
                            a: ({ node, ...props }) => (
                              <a
                                className="text-indigo-600 hover:text-indigo-800 font-bold underline underline-offset-2"
                                target="_blank"
                                rel="noopener noreferrer"
                                {...props}
                              />
                            ),
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    )}

                    {/* Action Link Buttons */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex flex-wrap gap-2">
                        {msg.actions.map((act, actIdx) =>
                          act.href ? (
                            <Link
                              key={actIdx}
                              href={act.href}
                              onClick={() => setIsOpen(false)}
                              className="text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 group"
                            >
                              <span>{act.label}</span>
                              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </Link>
                          ) : null
                        )}
                      </div>
                    )}

                    {/* Interactive Quick Prompts Chips */}
                    {msg.prompts && msg.prompts.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {msg.prompts.map((p, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => handleSendAiMessage(p.replace(/^[^\w\s]+/, '').trim())}
                            className="text-[11px] font-semibold bg-white hover:bg-indigo-50 text-indigo-700 hover:text-indigo-900 px-3 py-1.5 rounded-xl transition-all border border-indigo-200/90 hover:border-indigo-400 active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1 text-left"
                          >
                            <span>{p}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* AI Composing / Thinking Pulse */}
            {aiLoading && (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-indigo-100 shadow-sm max-w-[90%] sm:max-w-[85%] animate-in fade-in duration-200">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-900 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/30 border border-indigo-400/30">
                  <AiCopilotIcon className="w-5 h-5" glowing={true} />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 truncate">
                      Analyzing verified database records...
                    </span>
                    <Sparkles className="w-3 h-3 text-amber-500 animate-spin shrink-0" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                    Synthesizing real-time verified data with Gemini
                  </p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}

            {/* Polite Quota Exhaustion Alert Card (Only rendered when 0 queries left) */}
            {isExhausted && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-indigo-500/30 text-white shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300 my-2">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400 shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-white">
                        Daily Query Limit Reached ({limit}/{limit})
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      You have used all {limit} queries for today. Your daily limit will refresh automatically at midnight (12:00 AM IST).
                    </p>

                    {role === 'PROFESSIONAL' && aiUsage?.plan === 'FREE' && (
                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
                        <Link
                          href="/dashboard/subscription"
                          onClick={() => setIsOpen(false)}
                          className="text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 px-3 py-1.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                        >
                          <Crown className="w-3.5 h-3.5" />
                          <span>Upgrade to Pro for 25 queries/day</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Clean Input Dock */}
          <div className="p-3.5 bg-white border-t border-slate-200/90 shrink-0 shadow-xs">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendAiMessage();
              }}
              className="flex items-center gap-2 relative"
            >
              <div className="relative flex-1">
                <input
                  ref={aiInputRef}
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder={
                    isExhausted
                      ? 'Daily message limit reached (resets at midnight IST)...'
                      : `Ask Copilot (${role === 'PROFESSIONAL' ? 'Practice & Shifts' : role === 'USER' ? 'Doctor & Bookings' : 'Assistant'})...`
                  }
                  disabled={isExhausted}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl pl-4 pr-12 py-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 focus:bg-white transition-all shadow-inner font-medium disabled:opacity-60"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none hidden sm:flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs">
                    ↵
                  </kbd>
                </div>
              </div>

              <button
                type="submit"
                disabled={!aiInput.trim() || aiLoading || isExhausted}
                className="w-11 h-11 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-md shadow-indigo-600/25 active:scale-95 shrink-0 cursor-pointer"
                title="Send query to Copilot"
                aria-label="Send query to Copilot"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Dock Footer: DPDP Security & Graphical Quota View */}
            <div className="mt-2.5 flex items-center justify-between px-1 text-[10px] text-slate-400 font-medium flex-wrap gap-2">
              <span className="flex items-center gap-1.5 text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="hidden sm:inline">Role-Isolated DB Access • </span>
                <span>DPDP Act Compliant</span>
              </span>

              {/* Graphical Quota Counter Badge */}
              {aiUsage && (
                <div className="flex items-center gap-2">
                  {isUnlimited ? (
                    <button
                      type="button"
                      onClick={() => setShowQuotaCard(!showQuotaCard)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs active:scale-95"
                      title="Click to view quota details"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      <span>Unlimited Quota</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowQuotaCard(!showQuotaCard)}
                      className={cn(
                        'px-2.5 py-1 rounded-xl border flex items-center gap-2 shadow-2xs transition-all cursor-pointer active:scale-95 group',
                        isExhausted
                          ? 'bg-rose-50 border-rose-200 hover:bg-rose-100 text-rose-700 animate-pulse'
                          : isLow
                          ? 'bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-800'
                          : 'bg-slate-100/90 border-slate-200 hover:bg-slate-200/80 text-slate-800'
                      )}
                      title={`Daily AI Quota: ${remaining} of ${limit} remaining today. Click for details.`}
                    >
                      <AiQuotaRing remaining={remaining} limit={limit} isUnlimited={isUnlimited} size={15} strokeWidth={2.4} />
                      <span className="font-bold tracking-tight">
                        {remaining} / {limit} left today
                      </span>
                      <AiQuotaSegmentedBar remaining={remaining} limit={limit} isUnlimited={isUnlimited} className="hidden xs:flex" />
                    </button>
                  )}

                  {/* Pro upgrade shortcut for Free Pros only */}
                  {role === 'PROFESSIONAL' && aiUsage.plan === 'FREE' && (
                    <Link
                      href="/dashboard/subscription"
                      onClick={() => setIsOpen(false)}
                      className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 px-2 py-0.5 rounded-lg shadow-xs transition-transform hover:scale-105 active:scale-95"
                    >
                      <Crown className="w-3 h-3" />
                      <span>Pro (25/day)</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Sleek Glassmorphic Floating Action Button (FAB) */}
      {!isOpen && (
        <div className="fixed bottom-20 right-3.5 sm:bottom-6 sm:right-6 z-50 font-sans flex items-center gap-2.5 pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          {/* Floating Pill Trigger (Desktop / Tablet) */}
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2.5 pl-3 pr-3.5 py-2 rounded-2xl bg-slate-950/95 hover:bg-slate-900 text-white text-xs font-bold shadow-2xl border border-slate-800/90 backdrop-blur-md cursor-pointer transition-all hover:scale-105 active:scale-95 group hover:border-indigo-500/40"
          >
            <div className="w-5 h-5 rounded-lg bg-indigo-950/80 flex items-center justify-center border border-indigo-400/20">
              <AiCopilotIcon className="w-3.5 h-3.5" glowing={false} />
            </div>
            <span className="tracking-tight text-slate-100 group-hover:text-indigo-200 transition-colors">
              {role === 'PROFESSIONAL'
                ? 'Practice AI Copilot'
                : role === 'USER'
                ? 'Care & Booking Copilot'
                : 'BookSaathi Copilot'}
            </span>
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
              AI
            </span>
          </div>

          {/* Main Floating Icon Button */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            title="Open BookSaathi AI Copilot (⌘K)"
            className="group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 hover:from-slate-900 hover:to-indigo-900 text-white shadow-[0_12px_40px_-5px_rgba(79,70,229,0.45)] hover:shadow-[0_16px_50px_rgba(79,70,229,0.65)] border border-indigo-400/40 hover:border-indigo-300/70 transition-all transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            aria-label="Open AI Copilot"
          >
            {/* Ambient Background Radial Glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-500/30 via-sky-400/20 to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity blur-[2px]" />

            <div className="relative flex items-center justify-center">
              <AiCopilotIcon className="w-7 h-7" glowing={true} />
            </div>

            {/* Live Indicator Dot */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-950" />
            </span>
          </button>
        </div>
      )}
    </>
  );
}
