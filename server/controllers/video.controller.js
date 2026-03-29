import dotenv from 'dotenv';

dotenv.config();

const KLING_ACCESS_KEY = process.env.KLING_ACCESS_KEY;
const KLING_SECRET_KEY = process.env.KLING_SECRET_KEY;
const KLING_API_URL = process.env.KLING_API_URL;
const KLING_API_QUERY_URL = process.env.KLING_API_QUERY_URL;

// In-memory task cache (for demo; use Redis in production)
const taskCache = new Map();

/**
 * Helper: Get Bearer token for Kling API
 */
const getBearerToken = () => {
    if (!KLING_ACCESS_KEY || !KLING_SECRET_KEY) {
        return null;
    }
    return `Bearer ${KLING_ACCESS_KEY}:${KLING_SECRET_KEY}`;
};

/**
 * GET /api/video/capabilities
 * Return supported models/features
 */
export const getCapabilities = (req, res) => {
    // Check if credentials exist
    if (!KLING_ACCESS_KEY || !KLING_SECRET_KEY) {
        return res.status(500).json({ 
            error: 'Kling API credentials not configured',
            required: ['KLING_ACCESS_KEY', 'KLING_SECRET_KEY']
        });
    }

    if (!KLING_API_URL || !KLING_API_QUERY_URL) {
        return res.status(500).json({ 
            error: 'Kling API URLs not configured',
            required: ['KLING_API_URL', 'KLING_API_QUERY_URL']
        });
    }

    res.status(200).json({
        provider: 'Kling AI',
        model: 'text-to-video',
        features: [
            'text2video',
            'image2video',
            'motion'
        ],
        maxDuration: '5s',
        aspectRatios: ['16:9', '9:16', '1:1'],
        status: 'ready'
    });
};

/**
 * POST /api/video/create
 * Create a new video generation task
 */
export const createVideoTask = async (req, res) => {
    try {
        const { prompt, aspect_ratio, duration, mode } = req.body;

        // Validate prompt
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Check credentials
        const token = getBearerToken();
        if (!token) {
            return res.status(500).json({ error: 'Kling API credentials not configured' });
        }

        // Build request payload
        const payload = {
            prompt,
            aspect_ratio: aspect_ratio || '16:9',
            duration: duration || '5s',
            mode: mode || 'text2video'
        };

        console.log('🎬 Creating video task:', payload);

        const response = await fetch(KLING_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(payload)
        });

        // Check response status
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Kling API error:', response.status, errorText);
            return res.status(response.status).json({ 
                error: 'Failed to create video task',
                details: errorText 
            });
        }

        const result = await response.json();
        console.log('📡 Kling API response:', result);

        // FIXED: Proper status handling - code === 0 means success
        if (result.code === 0 && result.data && result.data.task_id) {
            const taskId = result.data.task_id;
            
            // Store task in local cache
            taskCache.set(taskId, {
                taskId,
                prompt,
                status: 'submitted',
                createdAt: new Date().toISOString(),
                result: result.data
            });

            return res.status(200).json({
                success: true,
                taskId,
                status: 'submitted',
                message: 'Video generation task created successfully'
            });
        } else {
            // Non-zero code or missing data means error
            console.error('❌ Kling API returned error:', result);
            return res.status(400).json({
                error: result.message || 'Video generation failed',
                code: result.code
            });
        }

    } catch (error) {
        console.error('❌ Controller error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * GET /api/video/:taskId
 * Get video task status/result
 */
export const getVideoTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        if (!taskId) {
            return res.status(400).json({ error: 'Task ID is required' });
        }

        // Check local cache first
        const cachedTask = taskCache.get(taskId);
        
        // Check credentials
        const token = getBearerToken();
        if (!token) {
            return res.status(500).json({ error: 'Kling API credentials not configured' });
        }

        console.log('🔍 Querying video task:', taskId);

        const response = await fetch(`${KLING_API_QUERY_URL}/v1/videos/text2video/${taskId}`, {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        });

        // Check response status
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Kling Query API error:', response.status, errorText);
            
            // If we have cached task, return its status
            if (cachedTask) {
                return res.status(200).json(cachedTask);
            }
            
            return res.status(response.status).json({ 
                error: 'Failed to query video task',
                details: errorText 
            });
        }

        const result = await response.json();
        console.log('📡 Kling Query response:', result);

        // Parse response - code === 0 means success
        if (result.code === 0 && result.data) {
            const taskData = result.data;
            
            // Update cache with latest status
            const updatedTask = {
                taskId,
                status: taskData.task_status || 'processing',
                progress: taskData.task_progress || 0,
                result: taskData,
                updatedAt: new Date().toISOString()
            };
            
            if (cachedTask) {
                taskCache.set(taskId, { ...cachedTask, ...updatedTask });
            }

            return res.status(200).json(updatedTask);
        } else {
            // If query failed but we have cached task, return it
            if (cachedTask) {
                return res.status(200).json(cachedTask);
            }

            return res.status(400).json({
                error: result.message || 'Failed to get video task status',
                code: result.code
            });
        }

    } catch (error) {
        console.error('❌ Controller error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * GET /api/video/tasks
 * List all cached tasks (for debugging)
 */
export const listTasks = (req, res) => {
    const tasks = Array.from(taskCache.values());
    res.status(200).json({
        count: tasks.length,
        tasks
    });
};

export default {
    getCapabilities,
    createVideoTask,
    getVideoTask,
    listTasks
};
