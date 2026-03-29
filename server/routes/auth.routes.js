import express from 'express';
import { syncUserProfile } from '../controllers/auth.controller.js'; 
import { verifyFirebaseToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/sync', verifyFirebaseToken, syncUserProfile);
router.get('/verify', verifyFirebaseToken, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;