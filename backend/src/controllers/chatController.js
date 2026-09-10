import { chatService } from '../services/chatService.js';
import { aiChatService } from '../services/aiChatService.js';
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
   * Process query for role-tailored AI assistant bot
   */
  queryAiBot: async (req, res, next) => {
    try {
      const { message, context } = req.body;
      const role = req.user ? req.user.role : 'GUEST';

      const response = await aiChatService.processQuery({
        role,
        message,
        context,
      });

      return successResponse(res, 200, 'AI response generated', response);
    } catch (error) {
      next(error);
    }
  },
};
