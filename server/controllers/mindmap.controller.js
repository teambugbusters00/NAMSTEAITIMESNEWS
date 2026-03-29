import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini - use for mind map generation to avoid GROQ rate limits
const hasGeminiApiKey = Boolean(process.env.GEMINI_API_KEY);
const genAI = hasGeminiApiKey ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const geminiModel = hasGeminiApiKey ? genAI.getGenerativeModel({ model: "models/gemini-flash-latest" }) : null;

export const buildFallbackMindMap = ({ headline, category, summary, keyPlayers, arc }) => {
    const headlineText = headline || 'Main Topic';
    const centerText = category ? `${category} Insight` : 'Central Theme';

    const summaryItems = Array.isArray(summary) ? summary : summary ? [summary] : [];
    const keyPlayersItems = Array.isArray(keyPlayers) ? keyPlayers : keyPlayers ? [keyPlayers] : [];
    const arcItems = Array.isArray(arc) ? arc : arc ? [arc] : [];

    const nodes = [
        { id: 'root', type: 'root', text: headlineText, x: 400, y: 50 },
        { id: 'center', type: 'center', text: centerText, x: 400, y: 180 },
    ];

    const edges = [{ source: 'root', target: 'center' }];

    const branchXs = [200, 400, 600];
    const leafOffsetX = [150, 250, 450, 550, 650];

    // Summary branches
    summaryItems.slice(0, 3).forEach((item, index) => {
        const branchId = `branch-summary-${index + 1}`;
        nodes.push({ id: branchId, type: 'branch', text: String(item).slice(0, 40), x: branchXs[index], y: 320 });
        edges.push({ source: 'center', target: branchId });

        // Add leaf for the summary
        const leafId = `leaf-summary-${index + 1}`;
        nodes.push({ id: leafId, type: 'leaf', text: String(item).slice(0, 80), x: Math.min(700, branchXs[index] + 50), y: 450 });
        edges.push({ source: branchId, target: leafId });
    });

    // Key players as leaves attached to center
    keyPlayersItems.slice(0, 3).forEach((player, index) => {
        const leafId = `leaf-player-${index + 1}`;
        nodes.push({ id: leafId, type: 'leaf', text: `Player: ${String(player)}`, x: leafOffsetX[index], y: 510 });
        edges.push({ source: 'center', target: leafId });
    });

    // Story arc as leaves attached to center
    arcItems.slice(0, 3).forEach((item, index) => {
        const leafId = `leaf-arc-${index + 1}`;
        const x = leafOffsetX[index + 3] || (350 + index * 80);
        nodes.push({ id: leafId, type: 'leaf', text: `Arc: ${String(item)}`, x, y: 560 });
        edges.push({ source: 'center', target: leafId });
    });

    if (nodes.length === 2) {
        // provide fallback branch if no data
        nodes.push({ id: 'branch-default', type: 'branch', text: 'Key Insight', x: 400, y: 320 });
        edges.push({ source: 'center', target: 'branch-default' });
    }

    return { nodes, edges };
};

/**
 * Generate mind map structure from article content
 */
export const generateMindMap = async (req, res) => {
    try {
        const { headline, category, summary, keyPlayers, arc } = req.body;

        if (!headline || !summary) {
            return res.status(400).json({ success: false, error: 'Missing required article data', details: 'headline and summary are required' });
        }

        // Local fallback path (no AI key or should not rely on external API)
        if (!hasGeminiApiKey) {
            console.warn('⚠️ GEMINI API key missing; using local mind map generation fallback');
            const mindMapData = buildFallbackMindMap({ headline, category, summary, keyPlayers, arc });
            return res.status(200).json({ success: true, mindMap: mindMapData, fallback: true });
        }

        console.log(`🧠 Mind Map Request: ${headline}`);

        const summaryArray = Array.isArray(summary) ? summary : [summary];
        const keyPlayersArray = Array.isArray(keyPlayers) ? keyPlayers : keyPlayers ? [keyPlayers] : [];
        const arcArray = Array.isArray(arc) ? arc : arc ? [arc] : [];

        const prompt = `
You are an elite intelligence analyst creating visual mind maps. Generate a hierarchical mind map structure from this news article.

Article Headline: ${headline}
Category: ${category || 'General'}

Summary Points:
${summaryArray.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Key Players:
${keyPlayersArray.length > 0 ? keyPlayersArray.map(p => `- ${p}`).join('\n') : 'None specified'}

Story Arc:
${arcArray.length > 0 ? arcArray.map(a => `- ${a}`).join('\n') : 'None specified'}

Output ONLY valid JSON in this exact format - no markdown, no explanation:
{
  "nodes": [
    {"id": "root", "type": "root", "text": "Main Topic", "x": 400, "y": 50},
    {"id": "center", "type": "center", "text": "Central Theme", "x": 400, "y": 180},
    {"id": "branch1", "type": "branch", "text": "Branch Topic", "x": 200, "y": 320},
    {"id": "branch2", "type": "branch", "text": "Another Branch", "x": 600, "y": 320},
    {"id": "leaf1", "type": "leaf", "text": "Detail Point", "x": 100, "y": 450}
  ],
  "edges": [
    {"source": "root", "target": "center"},
    {"source": "center", "target": "branch1"},
    {"source": "center", "target": "branch2"},
    {"source": "branch1", "target": "leaf1"}
  ]
}

Create meaningful mind map structure:
- Root: The main headline/topic (center-top)
- Center: The core insight or central theme
- Branches: Key aspects (summary points, key players, story arc items)
- Leaves: Specific details under each branch

Use positions to create a balanced tree layout:
- root at y: 50
- center at y: 180
- branches at y: 320
- leaves at y: 450+
- Left nodes x: 100-250
- Center nodes x: 350-450
- Right nodes x: 550-700`;

        const result = await geminiModel.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: 'application/json'
            }
        });

        const response = result.response;
        const text = response.text();

        let mindMapData;
        try {
            mindMapData = JSON.parse(text);
        } catch (parseError) {
            console.error('Failed to parse mind map JSON:', parseError);
            throw new Error('Invalid JSON response from AI');
        }

        if (!mindMapData.nodes || !mindMapData.edges) {
            throw new Error('Invalid mind map structure from LLM');
        }

        return res.status(200).json({ success: true, mindMap: mindMapData, fallback: false });
    } catch (error) {
        console.error('❌ Mind Map Error:', error);

        // If AI fails, provide fallback
        if (error instanceof Error && !hasGeminiApiKey === false) {
            console.warn('⚠️ AI generation failed; using local fallback:', error.message);
            const { headline, category, summary, keyPlayers, arc } = req.body;
            const mindMapData = buildFallbackMindMap({ headline, category, summary, keyPlayers, arc });
            return res.status(200).json({ success: true, mindMap: mindMapData, fallback: true, error: error.message });
        }

        let errorMessage = 'Unknown error occurred';
        let errorDetails = 'Failed to generate mind map';

        if (error instanceof Error) {
            errorMessage = error.message;
            errorDetails = errorMessage;

            if (errorMessage.includes('API key') || errorMessage.includes('not configured')) {
                errorDetails = 'AI API key is not configured. Please check your environment variables.';
            } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
                errorDetails = 'Rate limit exceeded. Please wait a moment and try again.';
            } else if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
                errorDetails = 'API quota exceeded. Please check your API usage limits.';
            }
        }

        res.status(500).json({
            success: false,
            error: errorMessage,
            details: errorDetails
        });
    }
};