import mongoose from 'mongoose';
import { Conversation } from '../models/Conversation.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { User } from '../models/User.js';
import { ProfessionalProfile } from '../models/ProfessionalProfile.js';
import { Appointment } from '../models/Appointment.js';
import { Notification } from '../models/Notification.js';
import { getIO } from '../socket/index.js';

export const chatService = {
  /**
   * Get authorized contacts list based on strict RBAC relationship matrix,
   * sorted with latest conversation / message on top.
   */
  getAuthorizedContacts: async (currentUser) => {
    const userId = currentUser._id;
    const role = currentUser.role;

    // Find all existing conversations for currentUser
    const existingConversations = await Conversation.find({
      'participants.user': userId,
    }).lean();

    const conversationMap = new Map();
    for (const conv of existingConversations) {
      const otherPart = conv.participants.find(
        (p) => p.user && p.user.toString() !== userId.toString()
      );
      if (otherPart) {
        const otherIdStr = otherPart.user.toString();
        const unread = (conv.unreadCounts && conv.unreadCounts[userId.toString()]) || 0;
        conversationMap.set(otherIdStr, {
          conversationId: conv._id,
          lastMessage: conv.lastMessage || null,
          unreadCount: unread,
          updatedAt: conv.updatedAt || conv.createdAt,
        });
      }
    }

    // Find system Admin user for support desk
    const adminUser = await User.findOne({ role: 'ADMIN', isActive: true }).select('_id name email role avatar');
    const adminConvData = adminUser ? conversationMap.get(adminUser._id.toString()) : null;

    if (role === 'ADMIN') {
      // 1. ADMIN can chat with ALL Professionals and ALL Users
      const professionals = await ProfessionalProfile.find({})
        .populate('userId', 'name email phone avatar role isActive')
        .select('name profession businessName profileImage city isVerified bookingSlug rating reviewCount userId');

      const users = await User.find({ role: 'USER', isActive: true })
        .select('name email phone avatar role createdAt');

      const mappedPros = professionals
        .map((p) => {
          const cId = p.userId?._id?.toString();
          const convData = cId ? conversationMap.get(cId) : null;
          return {
            contactId: p.userId?._id,
            profileId: p._id,
            name: p.name || p.userId?.name,
            email: p.userId?.email,
            profession: p.profession,
            businessName: p.businessName,
            avatar: p.profileImage || p.userId?.avatar,
            city: p.city,
            role: 'PROFESSIONAL',
            isVerified: p.isVerified,
            conversationId: convData?.conversationId || null,
            lastMessage: convData?.lastMessage || null,
            unreadCount: convData?.unreadCount || 0,
            lastActive: convData?.lastMessage?.createdAt || convData?.updatedAt || null,
          };
        })
        .filter((p) => p.contactId)
        .sort((a, b) => {
          const timeA = a.lastActive ? new Date(a.lastActive).getTime() : 0;
          const timeB = b.lastActive ? new Date(b.lastActive).getTime() : 0;
          return timeB - timeA;
        });

      const mappedUsers = users
        .map((u) => {
          const cId = u._id.toString();
          const convData = conversationMap.get(cId);
          return {
            contactId: u._id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            avatar: u.avatar,
            role: 'USER',
            conversationId: convData?.conversationId || null,
            lastMessage: convData?.lastMessage || null,
            unreadCount: convData?.unreadCount || 0,
            lastActive: convData?.lastMessage?.createdAt || convData?.updatedAt || null,
          };
        })
        .sort((a, b) => {
          const timeA = a.lastActive ? new Date(a.lastActive).getTime() : 0;
          const timeB = b.lastActive ? new Date(b.lastActive).getTime() : 0;
          return timeB - timeA;
        });

      return {
        role: 'ADMIN',
        supportDesk: null,
        professionals: mappedPros,
        users: mappedUsers,
      };
    }

    if (role === 'PROFESSIONAL') {
      // 2. PROFESSIONAL can chat with Admin Support AND clients who booked with them
      const proProfile = await ProfessionalProfile.findOne({ userId });
      if (!proProfile) {
        return {
          role: 'PROFESSIONAL',
          supportDesk: adminUser
            ? {
                contactId: adminUser._id,
                name: 'BookSaathi Admin Support Desk',
                email: adminUser.email,
                role: 'ADMIN',
                isSupport: true,
                conversationId: adminConvData?.conversationId || null,
                lastMessage: adminConvData?.lastMessage || null,
                unreadCount: adminConvData?.unreadCount || 0,
              }
            : null,
          clients: [],
        };
      }

      // Find all distinct clients who booked an appointment with this professional
      const appointments = await Appointment.find({ professionalId: proProfile._id })
        .populate('userId', 'name email phone avatar role')
        .sort({ createdAt: -1 });

      const clientMap = new Map();
      for (const apt of appointments) {
        if (apt.userId && !clientMap.has(apt.userId._id.toString())) {
          const cIdStr = apt.userId._id.toString();
          const convData = conversationMap.get(cIdStr);

          clientMap.set(cIdStr, {
            contactId: apt.userId._id,
            name: apt.customerName || apt.userId.name,
            email: apt.customerEmail || apt.userId.email,
            phone: apt.customerPhone || apt.userId.phone,
            avatar: apt.userId.avatar,
            role: 'USER',
            lastAppointmentDate: apt.dateString,
            lastAppointmentStatus: apt.status,
            lastAppointmentId: apt._id,
            conversationId: convData?.conversationId || null,
            lastMessage: convData?.lastMessage || null,
            unreadCount: convData?.unreadCount || 0,
            lastActive: convData?.lastMessage?.createdAt || convData?.updatedAt || apt.createdAt,
          });
        }
      }

      const sortedClients = Array.from(clientMap.values()).sort((a, b) => {
        const timeA = a.lastActive ? new Date(a.lastActive).getTime() : 0;
        const timeB = b.lastActive ? new Date(b.lastActive).getTime() : 0;
        return timeB - timeA;
      });

      return {
        role: 'PROFESSIONAL',
        supportDesk: adminUser
          ? {
              contactId: adminUser._id,
              name: 'BookSaathi Admin Support Desk',
              email: adminUser.email,
              role: 'ADMIN',
              isSupport: true,
              conversationId: adminConvData?.conversationId || null,
              lastMessage: adminConvData?.lastMessage || null,
              unreadCount: adminConvData?.unreadCount || 0,
            }
          : null,
        clients: sortedClients,
      };
    }

    // 3. USER (Customer) can chat with Admin Support AND booked professionals only
    const userAppointments = await Appointment.find({ userId })
      .populate({
        path: 'professionalId',
        select: 'name profession businessName profileImage city isVerified bookingSlug userId',
        populate: { path: 'userId', select: 'name email avatar' },
      })
      .sort({ createdAt: -1 });

    const proMap = new Map();
    for (const apt of userAppointments) {
      if (apt.professionalId && !proMap.has(apt.professionalId._id.toString())) {
        const p = apt.professionalId;
        const cIdStr = p.userId?._id?.toString();
        const convData = cIdStr ? conversationMap.get(cIdStr) : null;

        proMap.set(p._id.toString(), {
          contactId: p.userId?._id,
          profileId: p._id,
          name: p.name || p.userId?.name,
          email: p.userId?.email,
          profession: p.profession,
          businessName: p.businessName,
          avatar: p.profileImage || p.userId?.avatar,
          city: p.city,
          role: 'PROFESSIONAL',
          isVerified: p.isVerified,
          lastAppointmentDate: apt.dateString,
          lastAppointmentStatus: apt.status,
          lastAppointmentId: apt._id,
          conversationId: convData?.conversationId || null,
          lastMessage: convData?.lastMessage || null,
          unreadCount: convData?.unreadCount || 0,
          lastActive: convData?.lastMessage?.createdAt || convData?.updatedAt || apt.createdAt,
        });
      }
    }

    const sortedBookedPros = Array.from(proMap.values())
      .filter((p) => p.contactId)
      .sort((a, b) => {
        const timeA = a.lastActive ? new Date(a.lastActive).getTime() : 0;
        const timeB = b.lastActive ? new Date(b.lastActive).getTime() : 0;
        return timeB - timeA;
      });

    return {
      role: 'USER',
      supportDesk: adminUser
        ? {
            contactId: adminUser._id,
            name: 'BookSaathi Support & Helpdesk',
            email: adminUser.email,
            role: 'ADMIN',
            isSupport: true,
            conversationId: adminConvData?.conversationId || null,
            lastMessage: adminConvData?.lastMessage || null,
            unreadCount: adminConvData?.unreadCount || 0,
          }
        : null,
      bookedProfessionals: sortedBookedPros,
    };
  },

  /**
   * Validate if sender is strictly authorized to chat with recipient
   */
  validateChatAccess: async (senderUser, recipientUserId) => {
    if (senderUser._id.toString() === recipientUserId.toString()) {
      throw new Error('Cannot start a conversation with yourself.');
    }

    const recipient = await User.findById(recipientUserId);
    if (!recipient || !recipient.isActive) {
      throw new Error('Recipient user does not exist or is inactive.');
    }

    // Admin has universal chat privileges
    if (senderUser.role === 'ADMIN' || recipient.role === 'ADMIN') {
      return { allowed: true, recipient, type: 'SUPPORT' };
    }

    // Professional -> User verification
    if (senderUser.role === 'PROFESSIONAL' && recipient.role === 'USER') {
      const proProfile = await ProfessionalProfile.findOne({ userId: senderUser._id });
      if (!proProfile) {
        throw new Error('Professional profile not configured.');
      }
      const hasAppointment = await Appointment.exists({
        professionalId: proProfile._id,
        userId: recipient._id,
      });
      if (!hasAppointment) {
        throw new Error('Access Denied: Professionals can only chat with clients who have an appointment booking.');
      }
      return { allowed: true, recipient, type: 'DIRECT', professionalProfileId: proProfile._id };
    }

    // User -> Professional verification
    if (senderUser.role === 'USER' && recipient.role === 'PROFESSIONAL') {
      const proProfile = await ProfessionalProfile.findOne({ userId: recipient._id });
      if (!proProfile) {
        throw new Error('Professional profile not found.');
      }
      const hasAppointment = await Appointment.exists({
        userId: senderUser._id,
        professionalId: proProfile._id,
      });
      if (!hasAppointment) {
        throw new Error('Access Denied: Users can only chat with professionals they have booked an appointment with.');
      }
      return { allowed: true, recipient, type: 'DIRECT', professionalProfileId: proProfile._id };
    }

    throw new Error('Access Denied: Direct chat between these roles is not authorized.');
  },

  /**
   * Get or Create Conversation Thread
   */
  getOrCreateConversation: async (currentUser, recipientUserId) => {
    const authCheck = await chatService.validateChatAccess(currentUser, recipientUserId);

    // Look for existing thread
    let conversation = await Conversation.findOne({
      'participants.user': { $all: [currentUser._id, recipientUserId] },
    }).populate('participants.user', 'name email avatar role');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [
          { user: currentUser._id, role: currentUser.role },
          { user: authCheck.recipient._id, role: authCheck.recipient.role },
        ],
        type: authCheck.type,
        professionalProfileId: authCheck.professionalProfileId || null,
        unreadCounts: new Map([
          [currentUser._id.toString(), 0],
          [recipientUserId.toString(), 0],
        ]),
      });

      conversation = await Conversation.findById(conversation._id).populate(
        'participants.user',
        'name email avatar role'
      );
    }

    return conversation;
  },

  /**
   * Get user's active conversations list, sorted with latest message first
   */
  getUserConversations: async (currentUser) => {
    const conversations = await Conversation.find({
      'participants.user': currentUser._id,
    })
      .populate('participants.user', 'name email avatar role')
      .populate('professionalProfileId', 'name profession businessName profileImage isVerified')
      .sort({ updatedAt: -1 });

    return conversations.map((c) => {
      const otherParticipant = c.participants.find(
        (p) => p.user && p.user._id.toString() !== currentUser._id.toString()
      );
      const unread = (c.unreadCounts && c.unreadCounts.get(currentUser._id.toString())) || 0;

      return {
        _id: c._id,
        type: c.type,
        updatedAt: c.updatedAt,
        lastMessage: c.lastMessage,
        unreadCount: unread,
        otherUser: otherParticipant?.user
          ? {
              _id: otherParticipant.user._id,
              name: otherParticipant.user.name,
              email: otherParticipant.user.email,
              avatar: otherParticipant.user.avatar,
              role: otherParticipant.role,
            }
          : null,
        professionalProfile: c.professionalProfileId,
      };
    });
  },

  /**
   * Get Message History for Conversation and automatically mark unread messages as read
   */
  getMessages: async (conversationId, currentUser) => {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.user': currentUser._id,
    }).populate('participants.user', 'name email avatar role');

    if (!conversation) {
      throw new Error('Conversation not found or unauthorized.');
    }

    // Mark unread incoming messages as read in DB
    await ChatMessage.updateMany(
      {
        conversationId,
        senderId: { $ne: currentUser._id },
        readBy: { $ne: currentUser._id },
      },
      {
        $addToSet: { readBy: currentUser._id },
      }
    );

    // Reset unread count for current user
    if (conversation.unreadCounts) {
      conversation.unreadCounts.set(currentUser._id.toString(), 0);
      await conversation.save();
    }

    const messages = await ChatMessage.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(200);

    // Real-time socket broadcast to other participant that messages were read
    const otherParticipant = conversation.participants.find(
      (p) => p.user && p.user._id.toString() !== currentUser._id.toString()
    );

    const io = getIO();
    if (io && otherParticipant && otherParticipant.user) {
      const otherUserId = otherParticipant.user._id.toString();
      io.to(`user:${otherUserId}`).emit('chat:read', {
        conversationId,
        readerId: currentUser._id,
      });
      io.to(`conversation:${conversationId}`).emit('chat:read', {
        conversationId,
        readerId: currentUser._id,
      });
    }

    return {
      conversation,
      messages,
    };
  },

  /**
   * Mark Conversation as Read explicitly
   */
  markAsRead: async (conversationId, currentUser) => {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.user': currentUser._id,
    }).populate('participants.user', 'name email avatar role');

    if (!conversation) {
      throw new Error('Conversation not found.');
    }

    await ChatMessage.updateMany(
      {
        conversationId,
        senderId: { $ne: currentUser._id },
        readBy: { $ne: currentUser._id },
      },
      {
        $addToSet: { readBy: currentUser._id },
      }
    );

    if (conversation.unreadCounts) {
      conversation.unreadCounts.set(currentUser._id.toString(), 0);
      await conversation.save();
    }

    const otherParticipant = conversation.participants.find(
      (p) => p.user && p.user._id.toString() !== currentUser._id.toString()
    );

    const io = getIO();
    if (io && otherParticipant && otherParticipant.user) {
      const otherUserId = otherParticipant.user._id.toString();
      io.to(`user:${otherUserId}`).emit('chat:read', {
        conversationId,
        readerId: currentUser._id,
      });
    }

    return { success: true };
  },

  /**
   * Send a message in a conversation
   */
  sendMessage: async (currentUser, conversationId, text) => {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.user': currentUser._id,
    }).populate('participants.user', 'name email avatar role');

    if (!conversation) {
      throw new Error('Conversation not found or unauthorized.');
    }

    const recipientParticipant = conversation.participants.find(
      (p) => p.user && p.user._id.toString() !== currentUser._id.toString()
    );

    const senderName = currentUser.name || currentUser.email?.split('@')[0] || 'User';

    const message = await ChatMessage.create({
      conversationId: conversation._id,
      senderId: currentUser._id,
      senderRole: currentUser.role,
      senderName,
      text: text.trim(),
      readBy: [currentUser._id],
    });

    // Update conversation lastMessage & unread count
    conversation.lastMessage = {
      text: text.trim(),
      senderId: currentUser._id,
      senderName,
      createdAt: message.createdAt,
    };

    if (recipientParticipant && recipientParticipant.user) {
      const recipientId = recipientParticipant.user._id.toString();
      const currentUnread = (conversation.unreadCounts && conversation.unreadCounts.get(recipientId)) || 0;
      if (!conversation.unreadCounts) conversation.unreadCounts = new Map();
      conversation.unreadCounts.set(recipientId, currentUnread + 1);
    }

    await conversation.save();

    // Broadcast via Socket.IO
    const io = getIO();
    if (io && recipientParticipant && recipientParticipant.user) {
      const recipientId = recipientParticipant.user._id.toString();

      const payload = {
        _id: message._id,
        conversationId: conversation._id,
        senderId: currentUser._id,
        senderName,
        senderRole: currentUser.role,
        text: message.text,
        readBy: [currentUser._id],
        createdAt: message.createdAt,
      };

      // Emit strictly to conversation room and to recipient's personal user room
      io.to(`conversation:${conversation._id.toString()}`).emit('chat:receive_message', payload);
      io.to(`conversation:${conversation._id.toString()}`).emit('chat:message', payload);
      io.to(`user:${recipientId}`).emit('chat:receive_message', payload);
      io.to(`user:${recipientId}`).emit('chat:message', payload);
    }

    // In-app notification for recipient
    if (recipientParticipant && recipientParticipant.user) {
      try {
        await Notification.create({
          userId: recipientParticipant.user._id,
          recipientRole: recipientParticipant.role,
          title: `New message from ${senderName}`,
          message: text.length > 80 ? text.substring(0, 77) + '...' : text,
          type: 'SYSTEM_UPDATE',
          data: {
            conversationId: conversation._id,
            senderId: currentUser._id,
          },
        });
      } catch (err) {}
    }

    return message;
  },
};
