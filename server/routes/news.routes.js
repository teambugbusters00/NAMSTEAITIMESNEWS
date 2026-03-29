import express from 'express';
import { getNewsBriefing } from '../controllers/news.controller.js';
import { verifyFirebaseToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/fetch', verifyFirebaseToken, getNewsBriefing);

export default router;