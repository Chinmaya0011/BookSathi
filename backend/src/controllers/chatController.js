import { chatService } from '../services/chatService.js';
import { aiChatService } from '../services/aiChatService.js';
import { consumeAiQuery, checkAiUsage } from '../services/aiRateLimitService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const chatController = {
  /**
   * Get authorized contacts list according to RBAC
   */
  getContacts: async (req, res, next) => {
    try {
      const contacts = await chatService.getAuthorizedContacts(req.user);
      return successResponse(res, 200, 'Authorized contacts retrieved successfully', contacts);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get active conversations for current user
   */
  getConversations: async (req, res, next) => {
    try {
      const conversations = await chatService.getUserConversations(req.user);
      return successResponse(res, 200, 'User conversations retrieved successfully', { conversations });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get or start conversation with an authorized user
   */
  startConversation: async (req, res, next) => {
    try {
      const { recipientUserId } = req.body;
      if (!recipientUserId) {
        return errorResponse(res, 400, 'recipientUserId is required');
      }

      const conversation = await chatService.getOrCreateConversation(req.user, recipientUserId);
      return successResponse(res, 200, 'Conversation started/retrieved successfully', { conversation });
    } catch (error) {
      return errorResponse(res, 403, error.message || 'Unable to start conversation.');
    }
  },

  /**
   * Get message history for conversation
   */
  getMessages: async (req, res, next) => {
    try {
      const { conversationId } = req.params;
      const data = await chatService.getMessages(conversationId, req.user);
      return successResponse(res, 200, 'Messages retrieved successfully', data);
    } catch (error) {
      return errorResponse(res, 403, error.message || 'Unable to retrieve messages.');
    }
  },

  /**
   * Send human message to a conversation
   */
  sendMessage: async (req, res, next) => {
    try {
      const { conversationId, text } = req.body;
      if (!conversationId || !text || !text.trim()) {
        return errorResponse(res, 400, 'conversationId and non-empty text are required');
      }

      const message = await chatService.sendMessage(req.user, conversationId, text);
      return successResponse(res, 201, 'Message sent successfully', { message });
    } catch (error) {
      return errorResponse(res, 403, error.message || 'Unable to send message.');
    }
  },

  /**
   * Mark conversation messages as read
   */
  markAsRead: async (req, res, next) => {
    try {
      const { conversationId } = req.params;
      const result = await chatService.markAsRead(conversationId, req.user);
      return successResponse(res, 200, 'Conversation marked as read', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get current user's daily AI message usage and remaining quota
   */
  getAiUsage: async (req, res, next) => {
    try {
      const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const usage = await checkAiUsage({
        user: req.user || null,
        profile: req.profile || null,
        ip,
      });

      return successResponse(res, 200, 'AI usage retrieved successfully', usage);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Process query for role-tailored AI assistant bot with live DB, Gemini context, and daily quota enforcement
   */
  queryAiBot: async (req, res, next) => {
    try {
      const { message, text, query, context, history } = req.body;
      const userMessage = (message || text || query || '').trim();
      const role = req.user ? req.user.role : 'GUEST';
      const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

      if (!userMessage) {
        return errorResponse(res, 400, 'Message text is required');
      }

      // 1. Enforce Role & Plan Daily Rate Limit (User: 10/day, Pro Free: 5/day, Pro Paid: 25/day, Admin: Unlimited)
      const usageCheck = await consumeAiQuery({
        user: req.user || null,
        profile: req.profile || null,
        ip,
      });

      if (!usageCheck.isAllowed) {
        return successResponse(res, 200, 'Daily AI limit reached', {
          reply: usageCheck.reason,
          limitReached: true,
          usage: usageCheck,
          quickPrompts: [],
          quickActions:
            usageCheck.plan === 'FREE' && usageCheck.role === 'PROFESSIONAL'
              ? [{ label: '⭐ Upgrade to Pro (25 queries/day)', href: '/dashboard/subscription' }]
              : [],
        });
      }

      // 2. Process AI Query with DB Context & Gemini Flash
      const response = await aiChatService.processQuery({
        role,
        user: req.user || null,
        profile: req.profile || null,
        message: userMessage,
        context: context || {},
        history: history || context?.history || [],
      });

      // 3. Attach real-time remaining quota metadata to response
      response.usage = usageCheck;

      return successResponse(res, 200, 'AI response generated', response);
    } catch (error) {
      next(error);
    }
  },
};

