import { Router } from 'express';
import { chatController } from '../controllers/chatController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

import { optionalAuth } from '../middleware/authMiddleware.js';

// Public / Optional-auth AI Bot endpoints (handles guests and authenticated users via Bearer token or cookie)
router.get('/ai-usage', optionalAuth, chatController.getAiUsage);
router.post('/ai-query', optionalAuth, chatController.queryAiBot);
router.post('/ai', optionalAuth, chatController.queryAiBot);
router.post('/chat', optionalAuth, chatController.queryAiBot);

// Protected Endpoints (Strict RBAC required for Human Live Chat)
router.use(authenticate);

router.get('/contacts', chatController.getContacts);
router.get('/conversations', chatController.getConversations);
router.post('/start', chatController.startConversation);
router.get('/messages/:conversationId', chatController.getMessages);
router.post('/messages/:conversationId/read', chatController.markAsRead);
router.post('/send', chatController.sendMessage);

export default router;
