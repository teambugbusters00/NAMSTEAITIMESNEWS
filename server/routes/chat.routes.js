import express from 'express';
import { chatController } from '../controllers/chat.controller.js';
import { verifyFirebaseToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/chat', verifyFirebaseToken, chatController);

export default router;