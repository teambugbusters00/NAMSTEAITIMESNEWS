import express from 'express';
import { 
    getCapabilities, 
    createVideoTask, 
    getVideoTask,
    listTasks 
} from '../controllers/video.controller.js';
import { verifyFirebaseToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public endpoint - check if video API is configured
router.get('/capabilities', getCapabilities);

// Protected endpoints - require authentication
router.post('/create', verifyFirebaseToken, createVideoTask);
router.get('/:taskId', verifyFirebaseToken, getVideoTask);
router.get('/tasks/list', verifyFirebaseToken, listTasks);

export default router;
