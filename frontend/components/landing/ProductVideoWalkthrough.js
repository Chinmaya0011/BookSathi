'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  CreditCard,
  Share2,
  MessageCircle,
  Smartphone,
  ShieldCheck,
  Send,
  User,
  IndianRupee,
  ChevronRight,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function ProductVideoWalkthrough() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 0.5 (slow) or 1 (normal)
  const [progress, setProgress] = useState(0);

  const steps = [
    {
      id: 0,
      title: '1. Share Smart Link',
      shortDesc: 'Doctor sends link via WhatsApp',
      duration: 5000,
    },
    {
      id: 1,
      title: '2. Real-Time Slot Pick',
      shortDesc: 'Patient selects time with zero double booking',
      duration: 5500,
    },
    {
      id: 2,
      title: '3. Instant Checkout',
      shortDesc: 'Pay online via UPI or Pay at Clinic',
      duration: 5000,
    },
    {
      id: 3,
      title: '4. WhatsApp & Calendar Sync',
      shortDesc: 'Automated ticket & calendar confirmation',
      duration: 5500,
    },
  ];

  // Auto-progression loop
  useEffect(() => {
    if (!isPlaying) return;

    const currentDuration = (steps[currentStep].duration) / playbackSpeed;
    const intervalMs = 50;
    const increment = (intervalMs / currentDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentStep((s) => (s + 1) % steps.length);
          return 0;
        }
        return prev + increment;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, currentStep, playbackSpeed]);

  const handleStepClick = (index) => {
    setCurrentStep(index);
    setProgress(0);
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-slate-900 text-white shadow-2xl border border-slate-800 overflow-hidden">
      {/* Video Mockup Header Bar */}
      <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="ml-3 text-[11px] text-slate-400 font-mono hidden sm:inline-block">
            https://booksaathi.in/dr-rajesh
          </span>
        </div>

        {/* Video Speed & Playback Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPlaybackSpeed((s) => (s === 1 ? 0.5 : 1))}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-indigo-300 border border-slate-700 transition-colors"
          >
            {playbackSpeed === 0.5 ? '🐌 0.5x Slow Motion' : '⚡ 1.0x Speed'}
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            title={isPlaying ? 'Pause Video' : 'Play Video'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Video Screen Area */}
      <div className="relative min-h-[380px] sm:min-h-[440px] p-6 sm:p-10 flex items-center justify-center bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-900 overflow-hidden">
        {/* Animated Background Ambience Glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute w-[450px] h-[450px] rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"
        />

        <AnimatePresence mode="wait">
          {/* SCENE 1: WhatsApp Invitation Link */}
          {currentStep === 0 && (
            <motion.div
              key="scene-0"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-full max-w-md bg-slate-800/90 backdrop-blur-md rounded-3xl border border-slate-700 p-6 shadow-2xl space-y-4"
            >
              {/* WhatsApp Mockup Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-700/60">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
                  👨‍⚕️
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Dr. Rajesh Sharma (Clinic)</h4>
                  <p className="text-[10px] text-emerald-400 font-semibold">Online • Typically replies instantly</p>
                </div>
              </div>

              {/* Chat Bubble Simulation */}
              <div className="space-y-2.5">
                <motion.div
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="bg-slate-700/80 p-3 rounded-2xl rounded-tl-xs max-w-[85%] text-xs text-slate-200"
                >
                  Hello! Can I book an appointment for tomorrow evening?
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0, duration: 0.6 }}
                  className="ml-auto bg-indigo-600/90 p-3.5 rounded-2xl rounded-tr-xs max-w-[90%] text-xs text-white shadow-lg space-y-1.5"
                >
                  <p>Sure! Please select your preferred time slot here:</p>
                  <div className="p-2 rounded-xl bg-black/20 border border-white/10 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-indigo-200 font-bold">booksaathi.in/dr-rajesh</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-bold">
                      Tap to open
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Simulated Clicking Finger */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 2.2, duration: 0.4 }}
                className="flex items-center justify-center gap-2 pt-2 text-xs text-indigo-300 font-semibold"
              >
                <span className="animate-bounce">👆</span>
                <span>Patient taps link • Opens in 0.4s without app installation</span>
              </motion.div>
            </motion.div>
          )}

          {/* SCENE 2: Real-Time Slot Locking */}
          {currentStep === 1 && (
            <motion.div
              key="scene-1"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-full max-w-md bg-slate-800/90 backdrop-blur-md rounded-3xl border border-slate-700 p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    Real-Time Availability
                  </span>
                  <h4 className="text-sm font-bold text-white mt-0.5">Select Time for Tomorrow</h4>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  Live Slots
                </span>
              </div>

              {/* Slot Grid Animation */}
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                {['09:30 AM', '10:30 AM', '11:45 AM', '05:00 PM', '06:15 PM', '07:30 PM'].map(
                  (time, i) => (
                    <motion.div
                      key={time}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{
                        scale: i === 1 ? [1, 1.05, 1] : 1,
                        opacity: 1,
                        backgroundColor: i === 1 ? '#059669' : '#1e293b',
                        borderColor: i === 1 ? '#10b981' : '#334155',
                      }}
                      transition={{
                        delay: 0.2 + i * 0.1,
                        duration: 0.4,
                      }}
                      className="py-3 px-2 rounded-xl text-center border text-white shadow-xs"
                    >
                      {time}
                      {i === 1 && <span className="block text-[8px] text-emerald-200 mt-0.5">Selected</span>}
                    </motion.div>
                  )
                )}
              </div>

              {/* Concurrency Lock Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8, duration: 0.5 }}
                className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300"
              >
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  <strong>Atomic Lock Activated:</strong> 10:30 AM is reserved instantly. Double-booking is impossible.
                </span>
              </motion.div>
            </motion.div>
          )}

          {/* SCENE 3: Payment & Receipt Processing */}
          {currentStep === 2 && (
            <motion.div
              key="scene-2"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-full max-w-md bg-slate-800/90 backdrop-blur-md rounded-3xl border border-slate-700 p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    Hybrid Payment Engine
                  </span>
                  <h4 className="text-sm font-bold text-white mt-0.5">Choose Payment Method</h4>
                </div>
                <span className="text-xs font-bold text-indigo-300 font-mono">₹500.00</span>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2.5">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-3.5 rounded-2xl bg-indigo-600/30 border border-indigo-500 text-white flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 font-bold">
                    <CreditCard className="w-4 h-4 text-indigo-400" />
                    <span>Pay Online (UPI, GPay, PhonePe, Cards)</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="p-3.5 rounded-2xl bg-slate-700/50 border border-slate-600 text-slate-300 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 font-medium">
                    <IndianRupee className="w-4 h-4 text-slate-400" />
                    <span>Pay at Clinic Reception (Cash/Offline)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Supported</span>
                </motion.div>
              </div>

              {/* Payment Successful Ripple */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Payment Confirmed • Tax Invoice #INV-2026-8821 Generated</span>
              </motion.div>
            </motion.div>
          )}

          {/* SCENE 4: Instant Confirmation & WhatsApp Sync */}
          {currentStep === 3 && (
            <motion.div
              key="scene-3"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-full max-w-md bg-slate-800/90 backdrop-blur-md rounded-3xl border border-slate-700 p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-inner">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  Booking Confirmed
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">Appointment Code: BK-9942</h4>
                <p className="text-[11px] text-slate-400 mt-1">Tomorrow at 10:30 AM with Dr. Rajesh Sharma</p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-2.5 rounded-xl bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Calendar (.ics)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp Alert</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400">
                Both doctor and patient receive automatic calendar reminders & coordinates.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Step Progress Scrub Bar */}
      <div className="p-4 sm:p-6 bg-slate-950 border-t border-slate-800">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {steps.map((step, idx) => {
            const isActive = currentStep === idx;
            const isCompleted = currentStep > idx;

            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(idx)}
                className={`text-left p-3 rounded-2xl border transition-all ${
                  isActive
                    ? 'bg-slate-800/90 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold truncate">{step.title}</span>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </div>

                {/* Progress bar inside active step */}
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-75 ease-linear"
                    style={{
                      width: isActive ? `${progress}%` : isCompleted ? '100%' : '0%',
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
