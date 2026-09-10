'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  MessageSquare,
  Users,
  Search,
  Send,
  ShieldCheck,
  ShieldAlert,
  Headphones,
  Check,
  CheckCheck,
  Calendar,
  Clock,
  Sparkles,
  Bot,
  ArrowRight,
  ChevronLeft,
  RefreshCw,
  User,
  Phone,
  Mail,
  Activity,
  Circle,
} from 'lucide-react';
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
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function AdminMessagesPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState(null);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PROS' | 'USERS'
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

        // If currently open conversation
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
            // Update cache
            if (currentContact?.contactId) {
              messagesCacheRef.current[currentContact.contactId] = updated;
            }
            return updated;
          });

          if (currentConv._id) {
            chatService.markAsRead(currentConv._id).catch(() => {});
          }
        }

        // Silently update contacts directory without full loading screen
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

      // Select first contact on initial load if none selected yet
      if (!isBackground && !activeContactRef.current) {
        const firstContact = res.data?.professionals?.[0] || res.data?.users?.[0];
        if (firstContact) {
          handleSelectContact(firstContact);
        }
      }
    } catch (err) {
      if (!isBackground) {
        toast.error('Failed to load platform contacts');
      }
    } finally {
      if (!isBackground) {
        setLoadingContacts(false);
      }
    }
  };

  const handleSelectContact = async (contact) => {
    if (!contact) return;
    
    // Switch active contact immediately
    setActiveContact(contact);
    setMobileShowChat(true);

    const contactId = contact.contactId;
    const reqId = ++activeRequestIdRef.current;

    // 1. Check if cached messages exist for instantaneous smooth rendering (NO loading screen!)
    if (messagesCacheRef.current[contactId]) {
      setMessages(messagesCacheRef.current[contactId]);
      if (convCacheRef.current[contactId]) {
        setActiveConversation(convCacheRef.current[contactId]);
      }
    } else {
      // Clear previous contact's messages smoothly if uncached
      setMessages([]);
      setActiveConversation(null);
    }

    setIsSyncingMessages(true);

    try {
      // 2. Fetch/Init conversation from backend
      const res = await chatService.startConversation(contactId);
      
      // If user clicked another contact in the meantime, discard stale result
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
      senderName: 'Super Admin',
      text,
      readBy: [currentUserId],
      createdAt: new Date().toISOString(),
    };

    // Optimistically update message state & cache instantly
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

  // Filtered contacts calculation
  const allFilteredPros = useMemo(() => {
    return (contacts?.professionals || []).filter((p) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.profession?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contacts, searchQuery]);

  const allFilteredUsers = useMemo(() => {
    return (contacts?.users || []).filter((u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contacts, searchQuery]);

  const totalUnreadCount = useMemo(() => {
    let count = 0;
    (contacts?.professionals || []).forEach((p) => { count += p.unreadCount || 0; });
    (contacts?.users || []).forEach((u) => { count += u.unreadCount || 0; });
    return count;
  }, [contacts]);

  return (
    <div className="space-y-3 sm:space-y-4 max-w-7xl mx-auto h-[calc(100dvh-130px)] sm:h-[calc(100vh-125px)] min-h-[500px] flex flex-col font-sans">
      {/* Top Header Bar */}
      <div
        className={cn(
          'flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0',
          mobileShowChat ? 'hidden sm:flex' : 'flex'
        )}
      >
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Omni-Channel Communications Hub
            </h1>
            {totalUnreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase animate-pulse">
                {totalUnreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Encrypted direct communications with registered professionals and clients with zero latency.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => loadContacts(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 border border-slate-800 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Sync Contacts</span>
          </button>
        </div>
      </div>

      {/* Main Messaging Container */}
      <div className="flex-1 bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800/90 shadow-2xl overflow-hidden flex min-h-0 relative">
        
        {/* Left Directory Sidebar */}
        <div
          className={`w-full sm:w-80 lg:w-96 border-r border-slate-800/80 flex flex-col shrink-0 bg-slate-950/70 transition-all duration-200 ${
            mobileShowChat ? 'hidden sm:flex' : 'flex'
          }`}
        >
          {/* Search Box & Filters */}
          <div className="p-3.5 border-b border-slate-800/80 space-y-2.5 bg-slate-900/80">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search professionals, users..."
                className="w-full pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] font-bold">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`flex-1 py-1 rounded-lg text-center transition-all cursor-pointer ${
                  activeTab === 'ALL' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({allFilteredPros.length + allFilteredUsers.length})
              </button>
              <button
                onClick={() => setActiveTab('PROS')}
                className={`flex-1 py-1 rounded-lg text-center transition-all cursor-pointer ${
                  activeTab === 'PROS' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pros ({allFilteredPros.length})
              </button>
              <button
                onClick={() => setActiveTab('USERS')}
                className={`flex-1 py-1 rounded-lg text-center transition-all cursor-pointer ${
                  activeTab === 'USERS' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Users ({allFilteredUsers.length})
              </button>
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-3 overscroll-contain divide-y divide-slate-800/40">
            {loadingContacts ? (
              <div className="p-8 text-center space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin text-rose-500 mx-auto" />
                <p className="text-xs font-semibold text-slate-500">Loading directory...</p>
              </div>
            ) : allFilteredPros.length === 0 && allFilteredUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No matching contacts found.
              </div>
            ) : (
              <>
                {/* 1. Professionals Group */}
                {(activeTab === 'ALL' || activeTab === 'PROS') && allFilteredPros.length > 0 && (
                  <div className="pt-2 first:pt-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-400/90 px-2.5 mb-1.5 block">
                      Verified Professionals ({allFilteredPros.length})
                    </span>
                    <div className="space-y-1">
                      {allFilteredPros.map((pro) => {
                        const isSelected = activeContact?.contactId === pro.contactId;
                        return (
                          <div
                            key={pro.contactId || pro.profileId}
                            onClick={() => handleSelectContact(pro)}
                            className={`p-2.5 rounded-2xl transition-all duration-150 flex items-center justify-between cursor-pointer border ${
                              isSelected
                                ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/25'
                                : pro.unreadCount > 0
                                ? 'bg-amber-500/15 border-amber-500/30 text-white font-bold'
                                : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/80 text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-inner ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-rose-400 border border-slate-700/60'
                              }`}>
                                {pro.name?.charAt(0) || 'P'}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1 min-w-0">
                                    <h4 className="text-xs font-bold truncate">{pro.name}</h4>
                                    <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-400'}`} />
                                  </div>
                                  {pro.lastMessage && (
                                    <span className={`text-[10px] whitespace-nowrap shrink-0 ${isSelected ? 'text-rose-100' : 'text-slate-500'}`}>
                                      {formatRelativeTime(pro.lastMessage.createdAt)}
                                    </span>
                                  )}
                                </div>
                                <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-rose-100' : 'text-slate-400'}`}>
                                  {pro.lastMessage?.text || `${pro.profession} • ${pro.city || 'India'}`}
                                </p>
                              </div>
                            </div>
                            {pro.unreadCount > 0 && (
                              <span className="ml-2 px-1.5 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full shadow-xs animate-pulse shrink-0">
                                {pro.unreadCount}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Registered Users Group */}
                {(activeTab === 'ALL' || activeTab === 'USERS') && allFilteredUsers.length > 0 && (
                  <div className="pt-2 first:pt-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400/90 px-2.5 mb-1.5 block">
                      Platform Users ({allFilteredUsers.length})
                    </span>
                    <div className="space-y-1">
                      {allFilteredUsers.map((u) => {
                        const isSelected = activeContact?.contactId === u.contactId;
                        return (
                          <div
                            key={u.contactId}
                            onClick={() => handleSelectContact(u)}
                            className={`p-2.5 rounded-2xl transition-all duration-150 flex items-center justify-between cursor-pointer border ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/25'
                                : u.unreadCount > 0
                                ? 'bg-amber-500/15 border-amber-500/30 text-white font-bold'
                                : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/80 text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-inner ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/50'
                              }`}>
                                {u.name?.charAt(0) || 'U'}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                  <h4 className="text-xs font-bold truncate">{u.name}</h4>
                                  {u.lastMessage && (
                                    <span className={`text-[10px] whitespace-nowrap shrink-0 ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                                      {formatRelativeTime(u.lastMessage.createdAt)}
                                    </span>
                                  )}
                                </div>
                                <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                                  {u.lastMessage?.text || u.email}
                                </p>
                              </div>
                            </div>
                            {u.unreadCount > 0 && (
                              <span className="ml-2 px-1.5 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full shadow-xs animate-pulse shrink-0">
                                {u.unreadCount}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Active Conversation Canvas */}
        <div
          className={`flex-1 flex flex-col min-w-0 bg-slate-900/70 transition-all ${
            !mobileShowChat ? 'hidden sm:flex' : 'flex'
          }`}
        >
          {activeContact ? (
            <>
              {/* Active Header */}
              <div className="p-3.5 sm:p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/70 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setMobileShowChat(false)}
                    className="sm:hidden p-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 active:scale-95 transition-all flex items-center gap-1 text-xs font-bold shrink-0"
                    aria-label="Back to directory"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                    <span className="text-[11px]">Chats</span>
                  </button>

                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
                    {activeContact.name?.charAt(0) || 'U'}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-white truncate">{activeContact.name}</h3>
                      {activeContact.isVerified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {activeContact.role || 'USER'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate flex items-center gap-2 mt-0.5">
                      <span>{activeContact.email || activeContact.profession}</span>
                      {activeContact.phone && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span>{activeContact.phone}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {isSyncingMessages && (
                    <div className="hidden md:flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/60 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin text-rose-400" />
                      <span>Syncing thread...</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="hidden sm:inline">Admin Direct</span>
                  </div>
                </div>
              </div>

              {/* Messages Flow */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-950/50 overscroll-contain">
                {messages.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 my-auto">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-200">Start Conversation with {activeContact.name}</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Send a secure message to assist with inquiries, billing questions, or verified pro support.
                    </p>
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
                        className={`flex flex-col w-full ${isCurrentUser ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-1 duration-150`}
                      >
                        <div className={`flex items-center gap-1.5 mb-1 px-1 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                          <span className="text-[11px] font-bold text-slate-400">
                            {isCurrentUser ? 'Super Admin' : msg.senderName || activeContact.name || 'User'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>

                          {isCurrentUser && (
                            <span className="inline-flex items-center ml-0.5" title={isReadByRecipient ? 'Read' : 'Delivered'}>
                              {isReadByRecipient ? (
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-rose-300" />
                              )}
                            </span>
                          )}

                          {isUnreadIncoming && (
                            <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded-sm uppercase tracking-wider">
                              NEW
                            </span>
                          )}
                        </div>

                        <div
                          className={`max-w-[78%] sm:max-w-[68%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-md transition-all ${
                            isCurrentUser
                              ? 'bg-gradient-to-tr from-rose-600 to-rose-700 text-white rounded-br-xs font-medium ml-auto shadow-rose-600/15'
                              : isUnreadIncoming
                              ? 'bg-amber-500/20 border border-amber-500/40 text-amber-100 rounded-bl-xs mr-auto font-medium'
                              : 'bg-slate-800/90 border border-slate-700/80 text-slate-100 rounded-bl-xs mr-auto'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}

                {isTyping && (
                  <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-md w-fit animate-in fade-in duration-150">
                    <span className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-rose-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 bg-rose-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span className="text-xs font-bold text-rose-400 ml-1">{activeContact.name} is typing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer Footer */}
              <div className="p-3.5 sm:p-4 bg-slate-950/80 border-t border-slate-800/80 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2.5">
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
                    placeholder={`Reply to ${activeContact.name} as Administrator...`}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:bg-slate-950 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:opacity-40 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-rose-600/25 active:scale-95 shrink-0 cursor-pointer"
                  >
                    <span>Send</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <div className="w-16 h-16 rounded-3xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-center text-slate-500 mb-4">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-200">Select a Conversation</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Choose a professional or user from the directory to start or continue direct support.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
