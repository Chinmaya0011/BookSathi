import api from './api';

export const chatService = {
  /**
   * Get authorized contacts strictly filtered by RBAC relationship
   */
  getContacts: async () => {
    const response = await api.get('/chat/contacts');
    return response.data;
  },

  /**
   * Get active conversation threads
   */
  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },

  /**
   * Start or get conversation thread with recipient
   */
  startConversation: async (recipientUserId) => {
    const response = await api.post('/chat/start', { recipientUserId });
    return response.data;
  },

  /**
   * Get message history for conversation
   */
  getMessages: async (conversationId) => {
    const response = await api.get(`/chat/messages/${conversationId}`);
    return response.data;
  },

  /**
   * Mark conversation messages as read
   */
  markAsRead: async (conversationId) => {
    const response = await api.post(`/chat/messages/${conversationId}/read`);
    return response.data;
  },

  /**
   * Send human message
   */
  sendMessage: async (conversationId, text) => {
    const response = await api.post('/chat/send', { conversationId, text });
    return response.data;
  },

  /**
   * Query role-tailored AI assistant bot
   */
  queryAiBot: async (message, context = {}) => {
    const response = await api.post('/chat/ai-query', { message, context });
    return response.data;
  },
};
