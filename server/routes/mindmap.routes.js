import express from 'express';
import { generateMindMap } from '../controllers/mindmap.controller.js';
import { verifyFirebaseToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/generate', verifyFirebaseToken, generateMindMap);

export default router;