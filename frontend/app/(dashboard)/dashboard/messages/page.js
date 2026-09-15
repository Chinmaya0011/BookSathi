'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Users,
  Search,
  Send,
  ShieldCheck,
  Headphones,
  Check,
  CheckCheck,
  ChevronLeft,
  RefreshCw,
  Phone,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { connectSocket } from '@/lib/socket';
import { chatService } from '@/services/chat.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMin / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / (1000 * 60 * 60 * 24));

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState(null);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeContact, setActiveContact] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSyncingMessages, setIsSyncingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // In-memory cache references for instant switching
  const convCacheRef = useRef({});
  const messagesCacheRef = useRef({});
  const activeRequestIdRef = useRef(0);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const activeContactRef = useRef(null);
  activeContactRef.current = activeContact;

  useEffect(() => {
    loadContacts(false);

    const socket = connectSocket();
    if (socket) {
      socketRef.current = socket;

      const handleIncomingMessage = (data) => {
        const currentConv = activeConversation;
        const currentContact = activeContactRef.current;

        if (currentConv && data.conversationId === currentConv._id) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === data._id)) return prev;

            const currentUserId = (user?._id || user?.id)?.toString();
            const senderIdStr = (data.senderId?._id || data.senderId)?.toString();

            if (currentUserId && senderIdStr === currentUserId) {
              const tempIdx = prev.findIndex((m) => String(m._id).startsWith('temp-') && m.text === data.text);
              if (tempIdx !== -1) {
                const next = [...prev];
                next[tempIdx] = data;
                return next;
              }
            }

            const newMsg = {
              _id: data._id || `msg-${Date.now()}`,
              conversationId: data.conversationId,
              senderId: data.senderId,
              senderName: data.senderName,
              text: data.text,
              readBy: data.readBy || [data.senderId],
              createdAt: data.createdAt || new Date().toISOString(),
            };

            const updated = [...prev, newMsg];
            if (currentContact?.contactId) {
              messagesCacheRef.current[currentContact.contactId] = updated;
            }
            return updated;
          });

          // Mark as read immediately on active view
          if (currentConv._id) {
            chatService.markAsRead(currentConv._id).catch(() => {});
          }
        }

        // Silent refresh of contacts list
        loadContacts(true);
      };

      const handleTyping = (data) => {
        if (activeConversation && data.conversationId === activeConversation._id) {
          setIsTyping(data.isTyping);
          if (data.isTyping) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
          }
        }
      };

      const handleChatRead = (data) => {
        if (activeConversation && data.conversationId === activeConversation._id) {
          setMessages((prev) => {
            const updated = prev.map((msg) => {
              const currentUserId = (user?._id || user?.id)?.toString();
              const senderIdStr = (msg.senderId?._id || msg.senderId)?.toString();
              if (currentUserId && senderIdStr === currentUserId) {
                const alreadyRead = Array.isArray(msg.readBy) && msg.readBy.some((r) => r.toString() === data.readerId?.toString());
                if (!alreadyRead) {
                  return {
                    ...msg,
                    readBy: [...(msg.readBy || []), data.readerId],
                  };
                }
              }
              return msg;
            });
            if (activeContact?.contactId) {
              messagesCacheRef.current[activeContact.contactId] = updated;
            }
            return updated;
          });
        }
      };

      socket.on('chat:message', handleIncomingMessage);
      socket.on('chat:typing', handleTyping);
      socket.on('chat:read', handleChatRead);

      return () => {
        socket.off('chat:message', handleIncomingMessage);
        socket.off('chat:typing', handleTyping);
        socket.off('chat:read', handleChatRead);
      };
    }
  }, [user, activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const loadContacts = async (isBackground = false) => {
    if (!isBackground && !contacts) {
      setLoadingContacts(true);
    }
    try {
      const res = await chatService.getContacts();
      setContacts(res.data);

      if (!isBackground && !activeContactRef.current && typeof window !== 'undefined' && window.innerWidth >= 768) {
        if (res.data?.supportDesk) {
          handleSelectContact(res.data.supportDesk, false);
        } else if (res.data?.bookedProfessionals?.[0]) {
          handleSelectContact(res.data.bookedProfessionals[0], false);
        } else if (res.data?.clients?.[0]) {
          handleSelectContact(res.data.clients[0], false);
        }
      }
    } catch (err) {
      if (!isBackground) {
        toast.error('Failed to load contacts');
      }
    } finally {
      if (!isBackground) {
        setLoadingContacts(false);
      }
    }
  };

  const handleSelectContact = async (contact, showMobile = true) => {
    if (!contact) return;

    setActiveContact(contact);
    if (showMobile) {
      setMobileShowChat(true);
    }

    const contactId = contact.contactId;
    const reqId = ++activeRequestIdRef.current;

    // Instant switch from in-memory cache
    if (messagesCacheRef.current[contactId]) {
      setMessages(messagesCacheRef.current[contactId]);
      if (convCacheRef.current[contactId]) {
        setActiveConversation(convCacheRef.current[contactId]);
      }
    } else {
      setMessages([]);
      setActiveConversation(null);
    }

    setIsSyncingMessages(true);

    try {
      const res = await chatService.startConversation(contactId);
      if (activeRequestIdRef.current !== reqId) return;

      const conv = res.data?.conversation;
      setActiveConversation(conv);
      if (conv) {
        convCacheRef.current[contactId] = conv;
      }

      if (socketRef.current && conv?._id) {
        socketRef.current.emit('join:conversation', conv._id);
        socketRef.current.emit('chat:read', { conversationId: conv._id, recipientId: contactId });
      }

      if (conv?._id) {
        const msgRes = await chatService.getMessages(conv._id);
        if (activeRequestIdRef.current !== reqId) return;

        const fetchedMessages = msgRes.data?.messages || [];
        setMessages(fetchedMessages);
        messagesCacheRef.current[contactId] = fetchedMessages;
      }
    } catch (err) {
      if (activeRequestIdRef.current === reqId) {
        toast.error(err.response?.data?.message || 'Unable to open conversation.');
      }
    } finally {
      if (activeRequestIdRef.current === reqId) {
        setIsSyncingMessages(false);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const text = inputMessage.trim();
    if (!text || !activeConversation?._id || !activeContact) return;

    const currentUserId = (user?._id || user?.id)?.toString();
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      conversationId: activeConversation._id,
      senderId: currentUserId,
      senderName: user?.name || 'You',
      text,
      readBy: [currentUserId],
      createdAt: new Date().toISOString(),
    };

    const updated = [...messages, optimisticMsg];
    setMessages(updated);
    if (activeContact?.contactId) {
      messagesCacheRef.current[activeContact.contactId] = updated;
    }
    setInputMessage('');

    try {
      const res = await chatService.sendMessage(activeConversation._id, text);
      const savedMsg = res.data?.message;
      if (savedMsg) {
        setMessages((prev) => {
          const synced = prev.map((m) => (m._id === tempId ? savedMsg : m));
          if (activeContact?.contactId) {
            messagesCacheRef.current[activeContact.contactId] = synced;
          }
          return synced;
        });
      }
    } catch (err) {
      toast.error('Failed to deliver message.');
      setMessages((prev) => {
        const reverted = prev.filter((m) => m._id !== tempId);
        if (activeContact?.contactId) {
          messagesCacheRef.current[activeContact.contactId] = reverted;
        }
        return reverted;
      });
    }
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0 flex-1 overflow-hidden font-sans">
      {/* Main Messaging Container: 100% Fixed Header & Footer, ONLY Message Stream Scrolls */}
      <div className="flex-1 min-h-0 h-full flex overflow-hidden rounded-none sm:rounded-3xl border-0 sm:border border-slate-200/90 shadow-none sm:shadow-xl bg-white relative">
        
        {/* Left Contacts Directory: Full-width on mobile list, fixed column on desktop */}
        <div
          className={cn(
            'w-full sm:w-80 lg:w-96 border-r border-slate-200 flex flex-col min-h-0 shrink-0 bg-slate-50/70 transition-all duration-200',
            mobileShowChat ? 'hidden sm:flex' : 'flex'
          )}
        >
          {/* Top Directory Header */}
          <div className="p-3 sm:p-4 border-b border-slate-200 bg-white space-y-2.5 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-black text-slate-900 tracking-tight">Messages</h2>
              </div>
              <button
                type="button"
                onClick={() => loadContacts(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Refresh contacts"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Contact Lists (Scrollable) */}
          <div className="flex-1 min-h-0 overflow-y-auto p-2.5 sm:p-3 space-y-3 overscroll-contain">
            {loadingContacts ? (
              <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
                <span>Loading conversations...</span>
              </div>
            ) : (
              <>
                {/* 1. Official Support Desk */}
                {contacts?.supportDesk && (
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 mb-1.5 block">
                      Platform Support
                    </span>
                    <div
                      onClick={() => handleSelectContact(contacts.supportDesk)}
                      className={cn(
                        'p-2.5 sm:p-3 rounded-2xl transition-all flex items-center justify-between cursor-pointer border',
                        activeContact?.contactId === contacts.supportDesk.contactId
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25'
                          : contacts.supportDesk.unreadCount > 0
                          ? 'bg-amber-50/90 border-amber-300 text-slate-900 font-semibold'
                          : 'bg-white hover:bg-slate-100/80 border-slate-200/90 text-slate-900'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Headphones className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold truncate">{contacts.supportDesk.name}</h4>
                            {contacts.supportDesk.lastMessage && (
                              <span
                                className={cn(
                                  'text-[10px] whitespace-nowrap',
                                  activeContact?.contactId === contacts.supportDesk.contactId ? 'text-indigo-200' : 'text-slate-400'
                                )}
                              >
                                {formatRelativeTime(contacts.supportDesk.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          <p
                            className={cn(
                              'text-[11px] truncate mt-0.5',
                              activeContact?.contactId === contacts.supportDesk.contactId ? 'text-indigo-100' : 'text-slate-500'
                            )}
                          >
                            {contacts.supportDesk.lastMessage?.text || 'Official Help & Grievances'}
                          </p>
                        </div>
                      </div>
                      {contacts.supportDesk.unreadCount > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full shadow-xs animate-pulse">
                          {contacts.supportDesk.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. USER VIEW: Booked Specialists */}
                {user?.role === 'USER' && (
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 mb-1.5 block">
                      Booked Specialists ({contacts?.bookedProfessionals?.length || 0})
                    </span>
                    {contacts?.bookedProfessionals?.length === 0 ? (
                      <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center">
                        <p className="text-xs text-slate-700 font-bold">No Specialists Booked</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Book an on-visit appointment with your practitioner to chat.</p>
                        <Link href="/dashboard/appointments" className="inline-block mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700">
                          View My Appointments →
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {contacts?.bookedProfessionals
                          ?.filter((p) => p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.profession?.toLowerCase().includes(searchQuery.toLowerCase()))
                          ?.map((pro) => (
                            <div
                              key={pro.profileId}
                              onClick={() => handleSelectContact(pro)}
                              className={cn(
                                'p-2.5 sm:p-3 rounded-2xl transition-all flex items-center justify-between cursor-pointer border',
                                activeContact?.contactId === pro.contactId
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25'
                                  : pro.unreadCount > 0
                                  ? 'bg-amber-50/90 border-amber-300 text-slate-900 font-semibold'
                                  : 'bg-white hover:bg-slate-100/80 border-slate-200/90 text-slate-900'
                              )}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                                  {pro.name?.charAt(0)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <h4 className="text-xs font-bold truncate">{pro.name}</h4>
                                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    </div>
                                    {pro.lastMessage && (
                                      <span
                                        className={cn(
                                          'text-[10px] whitespace-nowrap',
                                          activeContact?.contactId === pro.contactId ? 'text-indigo-200' : 'text-slate-400'
                                        )}
                                      >
                                        {formatRelativeTime(pro.lastMessage.createdAt)}
                                      </span>
                                    )}
                                  </div>
                                  <p
                                    className={cn(
                                      'text-[11px] truncate mt-0.5',
                                      activeContact?.contactId === pro.contactId ? 'text-indigo-100' : 'text-slate-500'
                                    )}
                                  >
                                    {pro.lastMessage?.text || `${pro.profession || 'Specialist'} Consultation`}
                                  </p>
                                </div>
                              </div>
                              {pro.unreadCount > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full shadow-xs animate-pulse">
                                  {pro.unreadCount}
                                </span>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. PROFESSIONAL VIEW: Clients */}
                {user?.role === 'PROFESSIONAL' && (
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 mb-1.5 block">
                      Clients ({contacts?.clients?.length || 0})
                    </span>
                    {contacts?.clients?.length === 0 ? (
                      <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center">
                        <p className="text-xs text-slate-700 font-bold">No Client Messages Yet</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">When customers book consultations, their chat threads will appear here.</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {contacts?.clients
                          ?.filter((c) => c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone?.includes(searchQuery))
                          ?.map((cli) => (
                            <div
                              key={cli.contactId}
                              onClick={() => handleSelectContact(cli)}
                              className={cn(
                                'p-2.5 sm:p-3 rounded-2xl transition-all flex items-center justify-between cursor-pointer border',
                                activeContact?.contactId === cli.contactId
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25'
                                  : cli.unreadCount > 0
                                  ? 'bg-amber-50/90 border-amber-300 text-slate-900 font-semibold'
                                  : 'bg-white hover:bg-slate-100/80 border-slate-200/90 text-slate-900'
                              )}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                                  {cli.name?.charAt(0)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <h4 className="text-xs font-bold truncate">{cli.name}</h4>
                                    {cli.lastMessage && (
                                      <span
                                        className={cn(
                                          'text-[10px] whitespace-nowrap',
                                          activeContact?.contactId === cli.contactId ? 'text-indigo-200' : 'text-slate-400'
                                        )}
                                      >
                                        {formatRelativeTime(cli.lastMessage.createdAt)}
                                      </span>
                                    )}
                                  </div>
                                  <p
                                    className={cn(
                                      'text-[11px] truncate mt-0.5',
                                      activeContact?.contactId === cli.contactId ? 'text-indigo-100' : 'text-slate-500'
                                    )}
                                  >
                                    {cli.lastMessage?.text || (cli.phone ? `Phone: ${cli.phone}` : 'Client')}
                                  </p>
                                </div>
                              </div>
                              {cli.unreadCount > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full shadow-xs animate-pulse">
                                  {cli.unreadCount}
                                </span>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Active Conversation Canvas */}
        <div
          className={cn(
            'flex-1 flex flex-col min-w-0 min-h-0 h-full bg-white transition-all',
            !mobileShowChat ? 'hidden sm:flex' : 'flex'
          )}
        >
          {activeContact ? (
            <>
              {/* 1. FIXED TOP HEADER (Never scrolls) */}
              <div className="h-14 sm:h-16 px-3 sm:px-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0 z-10">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <button
                    onClick={() => setMobileShowChat(false)}
                    className="sm:hidden p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all flex items-center gap-1 text-xs font-bold shrink-0 cursor-pointer"
                    aria-label="Back to conversations"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                    <span className="text-[11px]">Chats</span>
                  </button>

                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-400 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs shrink-0">
                    {activeContact.name?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{activeContact.name}</h3>
                      {activeContact.isVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">
                      {activeContact.role === 'ADMIN' ? 'Official Support' : activeContact.profession || activeContact.role || 'Active Consultation'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isSyncingMessages && (
                    <div className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin text-indigo-600" />
                      <span>Syncing</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live</span>
                  </div>
                </div>
              </div>

              {/* 2. SCROLLABLE MESSAGES STREAM (ONLY THIS SCROLLS) */}
              <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 space-y-3.5 bg-slate-50/70 overscroll-contain">
                {messages.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center h-full">
                    <MessageSquare className="w-9 h-9 mb-2 text-slate-300" />
                    <p className="text-xs sm:text-sm font-bold text-slate-700">Encrypted Conversation Channel</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Send a message below to start chatting.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const currentUserId = (user?._id || user?.id)?.toString();
                    const senderIdStr = (msg.senderId?._id || msg.senderId)?.toString();
                    const isCurrentUser = Boolean(currentUserId && senderIdStr === currentUserId);

                    const isReadByRecipient = isCurrentUser && Array.isArray(msg.readBy) && msg.readBy.some((r) => r.toString() !== currentUserId);
                    const isUnreadIncoming = !isCurrentUser && (!Array.isArray(msg.readBy) || !msg.readBy.some((r) => r.toString() === currentUserId));

                    return (
                      <div
                        key={msg._id}
                        className={cn(
                          'flex flex-col w-full animate-in fade-in slide-in-from-bottom-2 duration-150',
                          isCurrentUser ? 'items-end' : 'items-start'
                        )}
                      >
                        <div className={cn('flex items-center gap-1.5 mb-1 px-1', isCurrentUser ? 'flex-row-reverse' : 'flex-row')}>
                          <span className="text-[10px] font-bold text-slate-500">
                            {isCurrentUser ? 'You' : msg.senderName || activeContact.name || 'User'}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>

                          {isCurrentUser && (
                            <span className="inline-flex items-center ml-0.5" title={isReadByRecipient ? 'Read' : 'Delivered'}>
                              {isReadByRecipient ? (
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-indigo-400" />
                              )}
                            </span>
                          )}

                          {isUnreadIncoming && (
                            <span className="text-[9px] bg-amber-500 text-white font-extrabold px-1.5 py-0.2 rounded-sm uppercase tracking-wider">
                              NEW
                            </span>
                          )}
                        </div>
                        <div
                          className={cn(
                            'max-w-[85%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 text-xs sm:text-sm leading-relaxed shadow-2xs transition-all',
                            isCurrentUser
                              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-xs font-medium ml-auto'
                              : isUnreadIncoming
                              ? 'bg-amber-50/95 border border-amber-300/80 text-amber-950 rounded-bl-xs mr-auto font-medium'
                              : 'bg-white border border-slate-200/90 text-slate-900 rounded-bl-xs mr-auto'
                          )}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}

                {isTyping && (
                  <div className="flex items-center gap-2 p-2 rounded-2xl bg-white border border-slate-200 shadow-2xs w-fit animate-in fade-in duration-150">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] font-bold text-indigo-700 ml-1">{activeContact.name} is typing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 3. FIXED BOTTOM INPUT COMPOSER (Never scrolls) */}
              <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200 shrink-0 z-10">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => {
                      setInputMessage(e.target.value);
                      if (socketRef.current && activeConversation?._id) {
                        socketRef.current.emit('chat:typing', {
                          conversationId: activeConversation._id,
                          recipientId: activeContact.contactId,
                          isTyping: true,
                        });
                      }
                    }}
                    placeholder={`Message ${activeContact.name}...`}
                    className="flex-1 bg-slate-100/90 border border-slate-200 rounded-xl sm:rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="px-4 py-2.5 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/25 active:scale-95 shrink-0 cursor-pointer"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 mb-3 text-slate-300" />
              <h3 className="text-base font-bold text-slate-700">Select a Conversation</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Choose a contact from the list to begin live messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
