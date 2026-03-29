import { Groq } from "groq-sdk";
import dotenv from 'dotenv';

dotenv.config();

// --- YOUR API KEYS ---
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const LLM_MODEL = process.env.LLM_MODEL;

// Initialize the Groq client
const groq = new Groq({ apiKey: GROQ_API_KEY });

async function fetchAndAnalyzeNews(searchTerm) {
    console.log(`📡 Step 1: Fetching article for '${searchTerm}' from NewsData.io...`);

    try {
        // 1. Fetch the raw article data
        const url = `https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&q=${encodeURIComponent(searchTerm)}&language=en`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'success' || data.totalResults === 0) {
            console.log("❌ No articles found or API error.");
            return;
        }

        // Grab the top article
        const topArticle = data.results[0];
        const title = topArticle.title || 'No Title';
        const publishDate = topArticle.pubDate || 'Unknown Date';
        
        // NewsData provides 'content' (full text) or 'description' (summary text)
        const articleText = topArticle.content || topArticle.description;

        if (!articleText) {
            console.log("❌ The API returned an article, but it has no readable text.");
            return;
        }

        console.log(`✅ Article acquired: ${title}`);
        console.log("🧠 Step 2: Sending text to Groq for Intelligence Extraction...\n");

        // 3. Prompt Engineering
        const prompt = `
        You are an elite intelligence analyst. Read the following news article text and generate a structured briefing. 
        Do not include any introductory or concluding text. Only output the exact format requested.

        Article Title: ${title}
        Publication Date: ${publishDate}
        Article Text: ${articleText}

        Format your output EXACTLY like this:

        📰 HEADLINE: [Write a clear, concise headline]
        📂 CATEGORY: [Classify the topic, e.g., FINANCE, AI, GEOPOLITICS]
        --------------------------------------------------
        📝 SUMMARY PARAGRAPHS (n):
        [Break the summary of the article down into as many short, digestible paragraphs as naturally needed based on the text length]

        🎯 KEY PLAYERS & ENTITIES (n):
        [List every major person, company, or organization mentioned in the text]
        - [Player 1]
        - [Player 2]
        - [etc.]

        ⏳ STORY ARC & BULLETIN:
        [Construct a chronological timeline based on the events in the text. Include dates/times if mentioned, and write a punchy bulletin for each step in the arc.]
        📍 [Date/Time/Relative Time] - [Bulletin]
        📍 [Date/Time/Relative Time] - [Bulletin]
        `;

        // 4. Call the Groq API
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a professional intelligence briefer." },
                { role: "user", content: prompt }
            ],
            model: LLM_MODEL,
            temperature: 0.3, 
        });

        // Print the final generated dossier
        console.log(completion.choices[0].message.content);
        
        console.log("-".repeat(50));
        console.log(`🔗 Source URL: ${topArticle.link}`);

    } catch (error) {
        console.error("❌ An error occurred during processing:", error.message);
    }
}

// With ES Modules, we can use top-level await!
await fetchAndAnalyzeNews("Artificial Intelligence");