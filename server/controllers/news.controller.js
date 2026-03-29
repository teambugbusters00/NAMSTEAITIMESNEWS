import { Groq } from "groq-sdk";
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const LLM_MODEL = process.env.LLM_MODEL;

/**
 * Helper: Processes a single article
 */
const processArticle = async (article, targetLanguage) => {
    try {
        const targetUrl = article.link;
        const title = article.title || 'No Title';

        // 1. Scraping with Jina
        const jinaResponse = await fetch(`https://r.jina.ai/${targetUrl}`);
        let content = await jinaResponse.text();

        if (!content || content.length < 200) return null;

        // 2. Token Management (Max 12k chars for Llama 4 Scout 30k TPM limit)
        const MAX_CHARS = 12000; 
        if (content.length > MAX_CHARS) content = content.substring(0, MAX_CHARS);

        // 3. AI Intelligence Briefing
        // We tell the AI to use the SPECIFIC language sent from the frontend
        const prompt = `
        You are an elite intelligence analyst. Generate a structured JSON briefing.
        CRITICAL: All generated content (headline, summary, etc.) MUST be written in the language: '${targetLanguage}'.
        
        Article: ${title}
        Text: ${content}

        Output ONLY valid JSON with these keys:
        {
            "headline": "Brief title",
            "category": "Topic",
            "summary": ["Point 1", "Point 2"],
            "keyPlayers": ["Name: Role"],
            "arc": ["Time - Event"]
        }`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "system", content: "You are an elite intelligence analyst. Generate ONLY valid JSON without any markdown or explanation." }, { role: "user", content: prompt }],
            model: LLM_MODEL,
            response_format: { type: "json_object" }
        });

        let data;
        try {
            const content = completion.choices[0].message.content;
            data = JSON.parse(content);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            return null;
        }
        
        if (!data.headline || !data.summary) {
            console.warn('Incomplete AI response, skipping article');
            return null;
        }
        
        return { ...data, sourceUrl: targetUrl, img: article.image_url };

    } catch (error) {
        console.error('Article processing error:', error);
        return null; 
    }
};

/**
 * Main Dynamic Controller
 */
export const getNewsBriefing = async (req, res) => {
    try {
        // GET EVERYTHING FROM THE FRONTEND REQUEST
        // No more "India" defaults here. 
        const { 
            searchTerm, 
            category, 
            language, 
            region, 
            pageToken 
        } = req.query;

        console.log(`📡 Dynamic Request Received: 
           Query: ${searchTerm || 'None'} 
           Category: ${category || 'All'} 
           Region: ${region || 'Global'} 
           Language: ${language || 'en'}`);

        // 1. Build the NewsData URL dynamically
        let newsUrl = `https://newsdata.io/api/1/news?apikey=${process.env.NEWS_API_KEY}`;
        
        // Append parameters ONLY if they are provided by the frontend
        if (searchTerm) newsUrl += `&q=${encodeURIComponent(searchTerm)}`;
        if (category)   newsUrl += `&category=${category}`;
        if (region)     newsUrl += `&country=${region}`;
        if (language)   newsUrl += `&language=${language}`;
        if (pageToken)  newsUrl += `&page=${pageToken}`;

        const newsResponse = await fetch(newsUrl);
        const newsData = await newsResponse.json();

        if (newsData.status !== 'success' || !newsData.results || newsData.results.length === 0) {
            return res.status(404).json({ error: "No news matches these filters." });
        }

        // 2. Parallel Processing with Llama 4 Scout
        // Pass the 'language' variable so the AI translates to the user's choice
        let successfulBriefings = [];
        
        if (newsData.results && newsData.results.length > 0) {
            const briefingPromises = newsData.results.map(article => 
                processArticle(article, language || 'en')
            );
            
            const results = await Promise.all(briefingPromises);
            successfulBriefings = results.filter(b => b !== null);
        }

        // 3. Response - return empty array instead of 404 for better UX
        res.status(200).json({
            articles: successfulBriefings,
            nextPageToken: newsData.nextPage || null
        });

    } catch (error) {
        console.error("❌ Controller Error:", error);
        res.status(500).json({ error: "The intelligence engine encountered an error." });
    }
};