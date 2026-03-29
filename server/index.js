import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import newsRoutes from './routes/news.routes.js';
import authRoutes from './routes/auth.routes.js';
import chatRoutes from './routes/chat.routes.js';
import videoRoutes from './routes/video.routes.js';
import mindmapRoutes from './routes/mindmap.routes.js';

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
    origin: ['http://localhost:5173', 'https://etgenai1.vercel.app', 'https://et-gen-ai.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

app.get('/api', (req, res) => {
    res.json({ 
        message: 'ET Gen AI Server is running',
        version: '1.0.0',
        endpoints: [
            '/api/news/fetch',
            '/api/auth/sync',
            '/api/auth/verify',
            '/api/chat/chat',
            '/api/video/capabilities',
            '/api/video/create',
            '/api/mindmap/generate'
        ]
    });
});

// API Routes
app.use('/api/news', newsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/mindmap', mindmapRoutes);

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

// Only connect to MongoDB in non-serverless environment or if URI is available
if (MONGO_URI && process.env.VERCEL !== 'true') {
    mongoose.connect(MONGO_URI)
      .then(() => {
        console.log('✅ Connected to MongoDB');
      })
      .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
      });
} else if (process.env.VERCEL === 'true') {
    console.log('🔄 Running in serverless mode - MongoDB connection deferred');
}

// For local development
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const port = process.env.PORT || 3000;
    
    mongoose.connect(MONGO_URI)
      .then(() => {
        console.log('✅ Connected to MongoDB');
        
        app.listen(port, () => {
          console.log(`Server is running on port ${port}`);
        });
      })
      .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
      });
}

// Export for Vercel
export default app;