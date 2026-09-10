import { Router } from 'express';
import { chatController } from '../controllers/chatController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Public / Optional-auth AI Bot endpoint (handles guests and authenticated users)
router.post('/ai-query', async (req, res, next) => {
  // Try authenticating if header present, else proceed as GUEST
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authenticate(req, res, () => chatController.queryAiBot(req, res, next));
    }
  } catch (e) {}
  return chatController.queryAiBot(req, res, next);
});

// Protected Endpoints (Strict RBAC required for Human Live Chat)
router.use(authenticate);

router.get('/contacts', chatController.getContacts);
router.get('/conversations', chatController.getConversations);
router.post('/start', chatController.startConversation);
router.get('/messages/:conversationId', chatController.getMessages);
router.post('/messages/:conversationId/read', chatController.markAsRead);
router.post('/send', chatController.sendMessage);

export default router;
