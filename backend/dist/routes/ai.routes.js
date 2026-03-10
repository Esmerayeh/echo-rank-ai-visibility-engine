import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { Llm, LlmProvider } from '@uptiqai/integrations-sdk';
import prisma from "../client.js";
import crypto from 'crypto';
const aiRoutes = new Hono();
const analyzeSchema = z.object({
    type: z.enum(['url', 'article', 'competitor']),
    url: z.string().optional(),
    content: z.string().optional(),
    targetUrl: z.string().optional(),
    competitorUrl: z.string().optional(),
});
function calculateHash(body) {
    const str = JSON.stringify({
        type: body.type,
        url: body.url,
        content: body.content,
        targetUrl: body.targetUrl,
        competitorUrl: body.competitorUrl,
    });
    return crypto.createHash('md5').update(str).digest('hex');
}
function runPreliminaryHeuristics(content = '') {
    // Simple heuristic-based preliminary analysis
    const h2Count = (content.match(/<h2/g) || []).length || (content.match(/^## /gm) || []).length;
    const h3Count = (content.match(/<h3/g) || []).length || (content.match(/^### /gm) || []).length;
    const definitionSignals = (content.match(/is defined as|refers to|means|is a/gi) || []).length;
    const wordCount = content.split(/\s+/).length;
    const linkCount = (content.match(/<a\s/g) || []).length || (content.match(/\[.*\]\(.*\)/g) || []).length;
    let score = 50; // Base score
    score += Math.min(h2Count * 5, 15);
    score += Math.min(h3Count * 2, 10);
    score += Math.min(definitionSignals * 10, 20);
    score += Math.min(Math.floor(wordCount / 500) * 5, 15);
    score += Math.min(linkCount * 2, 10);
    const finalScore = Math.min(Math.max(score, 10), 95);
    return {
        metrics: {
            visibilityScore: finalScore,
            citationProbability: Math.floor(finalScore * 0.8),
            topicAuthority: Math.floor(finalScore * 0.7),
        },
        radarData: [
            { "subject": "Clarity", "A": finalScore - 5, "fullMark": 100 },
            { "subject": "Structure", "A": finalScore + 5, "fullMark": 100 },
            { "subject": "Authority", "A": finalScore - 10, "fullMark": 100 },
            { "subject": "Depth", "A": finalScore - 2, "fullMark": 100 },
            { "subject": "Definitions", "A": finalScore + 8, "fullMark": 100 }
        ],
        insights: [],
        recommendations: [],
        citationRadar: [
            { "system": "ChatGPT", "likelihood": finalScore > 70 ? "High" : finalScore > 40 ? "Medium" : "Low" },
            { "system": "Perplexity", "likelihood": finalScore > 75 ? "High" : finalScore > 45 ? "Medium" : "Low" },
            { "system": "Claude", "likelihood": finalScore > 70 ? "High" : finalScore > 40 ? "Medium" : "Low" },
            { "system": "Gemini", "likelihood": finalScore > 65 ? "High" : finalScore > 35 ? "Medium" : "Low" }
        ],
    };
}
async function runDeepAnalysis(analysisId, body) {
    try {
        const llm = new Llm({ provider: process.env.LLM_PROVIDER || LlmProvider.Google });
        const prompt = `
      Analyze the following content for AI Visibility and Citation Likelihood.
      Type: ${body.type}
      ${body.url ? `URL: ${body.url}` : ''}
      ${body.content ? `Content: ${body.content}` : ''}
      ${body.targetUrl ? `Target Website: ${body.targetUrl}` : ''}
      ${body.competitorUrl ? `Competitor Website: ${body.competitorUrl}` : ''}

      Provide a detailed analysis in the following JSON format:
      {
        "metrics": {
          "visibilityScore": number (0-100),
          "citationProbability": number (0-100),
          "topicAuthority": number (0-100)
        },
        "radarData": [
          { "subject": "Clarity", "A": number, "fullMark": 100 },
          { "subject": "Structure", "A": number, "fullMark": 100 },
          { "subject": "Authority", "A": number, "fullMark": 100 },
          { "subject": "Depth", "A": number, "fullMark": 100 },
          { "subject": "Definitions", "A": number, "fullMark": 100 }
        ],
        "insights": [
          { "title": "string", "description": "string", "opportunity": "string" }
        ],
        "recommendations": [
          { "title": "string", "description": "string", "impact": "high" | "medium" | "low" }
        ],
        "citationRadar": [
          { "system": "ChatGPT", "likelihood": "Low" | "Medium" | "High" },
          { "system": "Perplexity", "likelihood": "Low" | "Medium" | "High" },
          { "system": "Claude", "likelihood": "Low" | "Medium" | "High" },
          { "system": "Gemini", "likelihood": "Low" | "Medium" | "High" }
        ],
        "competitorAnalysis": {
          "userMetrics": { "depth": number, "authority": number, "citation": number },
          "competitorMetrics": { "depth": number, "authority": number, "citation": number }
        } (only if type is competitor)
      }

      Respond ONLY with the JSON.
    `;
        const response = await llm.generateText({
            messages: [{ role: 'user', content: prompt }],
            model: process.env.LLM_MODEL,
        });
        const text = response.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            await prisma.analysis.update({
                where: { id: analysisId },
                data: {
                    visibilityScore: result.metrics.visibilityScore,
                    citationProbability: result.metrics.citationProbability,
                    topicAuthority: result.metrics.topicAuthority,
                    radarData: result.radarData,
                    insights: result.insights,
                    recommendations: result.recommendations,
                    citationRadar: result.citationRadar,
                    competitorAnalysis: result.competitorAnalysis,
                    isDeepAnalysisComplete: true,
                }
            });
        }
    }
    catch (error) {
        console.error('Deep analysis failed:', error);
    }
}
aiRoutes.post('/analyze', zValidator('json', analyzeSchema), async (c) => {
    const body = c.req.valid('json');
    const hash = calculateHash(body);
    // Check cache
    const cached = await prisma.analysis.findFirst({
        where: { contentHash: hash, isDeleted: false, isDeepAnalysisComplete: true },
        orderBy: { createdAt: 'desc' }
    });
    if (cached) {
        return c.json({
            id: cached.id,
            isDeepAnalysisComplete: true,
            metrics: {
                visibilityScore: cached.visibilityScore,
                citationProbability: cached.citationProbability,
                topicAuthority: cached.topicAuthority,
            },
            radarData: cached.radarData,
            insights: cached.insights,
            recommendations: cached.recommendations,
            citationRadar: cached.citationRadar,
            competitorAnalysis: cached.competitorAnalysis,
        });
    }
    // Preliminary Analysis
    const prelimResult = runPreliminaryHeuristics(body.content || body.url || '');
    // Create record
    const analysis = await prisma.analysis.create({
        data: {
            type: body.type,
            url: body.url,
            content: body.content,
            targetUrl: body.targetUrl,
            competitorUrl: body.competitorUrl,
            contentHash: hash,
            visibilityScore: prelimResult.metrics.visibilityScore,
            citationProbability: prelimResult.metrics.citationProbability,
            topicAuthority: prelimResult.metrics.topicAuthority,
            radarData: prelimResult.radarData,
            insights: prelimResult.insights,
            recommendations: prelimResult.recommendations,
            citationRadar: prelimResult.citationRadar,
            isDeepAnalysisComplete: false,
        }
    });
    // Trigger background deep analysis
    runDeepAnalysis(analysis.id, body);
    return c.json({
        id: analysis.id,
        isDeepAnalysisComplete: false,
        ...prelimResult
    });
});
aiRoutes.get('/analysis/:id', async (c) => {
    const id = c.req.param('id');
    const analysis = await prisma.analysis.findUnique({
        where: { id, isDeleted: false }
    });
    if (!analysis) {
        return c.json({ error: 'Analysis not found' }, 404);
    }
    return c.json({
        id: analysis.id,
        isDeepAnalysisComplete: analysis.isDeepAnalysisComplete,
        metrics: {
            visibilityScore: analysis.visibilityScore,
            citationProbability: analysis.citationProbability,
            topicAuthority: analysis.topicAuthority,
        },
        radarData: analysis.radarData,
        insights: analysis.insights,
        recommendations: analysis.recommendations,
        citationRadar: analysis.citationRadar,
        competitorAnalysis: analysis.competitorAnalysis,
        createdAt: analysis.createdAt,
    });
});
aiRoutes.get('/dashboard-metrics', async (c) => {
    const analyses = await prisma.analysis.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 10
    });
    if (analyses.length === 0) {
        // Return demo analysis for OpenAI Blog if no data exists
        return c.json({
            isDemo: true,
            visibilityScore: 92,
            visibilityScoreChange: 4.2,
            citationProbability: 88,
            citationProbabilityChange: 12.4,
            topicAuthority: 95,
            topicAuthorityChange: 2.1,
            optimizationAlerts: 2,
            optimizationAlertsChange: -1,
            trendData: [
                { name: 'Mon', score: 85 },
                { name: 'Tue', score: 87 },
                { name: 'Wed', score: 86 },
                { name: 'Thu', score: 89 },
                { name: 'Fri', score: 91 },
                { name: 'Sat', score: 92 },
                { name: 'Sun', score: 92 },
            ],
            categoryData: [
                { name: 'Clarity', value: 94 },
                { name: 'Structure', value: 90 },
                { name: 'Authority', value: 96 },
                { name: 'Depth', value: 92 },
                { name: 'Definitions', value: 88 }
            ],
            radarData: [
                { subject: 'Clarity', A: 94, fullMark: 100 },
                { subject: 'Structure', A: 90, fullMark: 100 },
                { subject: 'Authority', A: 96, fullMark: 100 },
                { subject: 'Depth', A: 92, fullMark: 100 },
                { subject: 'Definitions', A: 88, fullMark: 100 }
            ],
            strengths: [
                { title: 'Exceptional Authority', description: 'Strong signals in AI research found throughout content.' },
                { title: 'Technical Hierarchy', description: 'Highly structured technical explanations and documentation.' },
                { title: 'Semantic Alignment', description: 'Excellent alignment with RAG retrieval architectures.' }
            ],
            weaknesses: [
                { title: 'Definition Coverage', description: 'Moderate coverage for newer AI models and terminology.', recommendation: 'Add definition blocks.' },
                { title: 'FAQ Inconsistency', description: 'Inconsistent FAQ blocks on research updates.', recommendation: 'Implement standardized FAQ sections.' }
            ],
            optimizationOpportunities: [
                { title: "Definitional Clarity", impact: "High", description: "Add structured definition blocks for core entities to capture AI dictionary queries." },
                { title: "Semantic Depth", impact: "Medium", description: "Expand on sub-topics with high semantic density to improve topical authority." },
                { title: "Citation Signals", impact: "High", description: "Integrate authoritative outbound links to signal credibility to LLM evaluators." }
            ]
        });
    }
    const latest = analyses[0];
    const previous = analyses[1] || latest;
    const calculateChange = (current, prev) => {
        if (prev === 0)
            return 0;
        return parseFloat(((current - prev) / prev * 100).toFixed(1));
    };
    const trendData = [...analyses].reverse().map(a => ({
        name: a.createdAt.toLocaleDateString('en-US', { weekday: 'short' }),
        score: a.visibilityScore
    }));
    const radarData = latest.radarData || [];
    const categoryData = radarData.map(r => ({ name: r.subject, value: r.A }));
    const rawStrengths = latest.insights || [];
    const rawWeaknesses = latest.recommendations || [];
    return c.json({
        isDemo: false,
        visibilityScore: latest.visibilityScore,
        visibilityScoreChange: calculateChange(latest.visibilityScore, previous.visibilityScore),
        citationProbability: latest.citationProbability,
        citationProbabilityChange: calculateChange(latest.citationProbability, previous.citationProbability),
        topicAuthority: latest.topicAuthority,
        topicAuthorityChange: calculateChange(latest.topicAuthority, previous.topicAuthority),
        optimizationAlerts: rawWeaknesses.length,
        optimizationAlertsChange: rawWeaknesses.length - (previous.recommendations || []).length,
        trendData,
        categoryData,
        radarData,
        strengths: rawStrengths.map(s => ({
            title: s.title,
            description: s.description
        })),
        weaknesses: rawWeaknesses.filter(w => w.impact === 'high' || w.impact === 'medium').map(w => ({
            title: w.title,
            description: w.description,
            recommendation: `Follow remediation plan for ${w.title}`
        })),
        optimizationOpportunities: [
            { title: "Definitional Clarity", impact: "High", description: "Add structured definition blocks for core entities to capture AI dictionary queries." },
            { title: "Semantic Depth", impact: "Medium", description: "Expand on sub-topics with high semantic density to improve topical authority." },
            { title: "Citation Signals", impact: "High", description: "Integrate authoritative outbound links to signal credibility to LLM evaluators." }
        ]
    });
});
aiRoutes.get('/history', async (c) => {
    const history = await prisma.analysis.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 20
    });
    return c.json(history.map(item => ({
        id: item.id,
        url: item.url || item.targetUrl || 'Article Analysis',
        visibilityScore: item.visibilityScore,
        timestamp: item.createdAt.toISOString()
    })));
});
const optimizeSchema = z.object({
    content: z.string(),
});
aiRoutes.post('/optimize', zValidator('json', optimizeSchema), async (c) => {
    const body = c.req.valid('json');
    const llm = new Llm({ provider: process.env.LLM_PROVIDER || LlmProvider.Google });
    const prompt = `
    Optimize the following article for AI Visibility and LLM Citation.
    Content: ${body.content}

    Provide the optimized architecture in the following JSON format:
    {
      "improvedTitle": "string",
      "explanationSections": [
        { "heading": "string", "content": "string" }
      ],
      "definitionBlock": [
        { "term": "string", "definition": "string" }
      ],
      "faqSection": [
        { "question": "string", "answer": "string" }
      ],
      "bulletInsights": ["string"]
    }

    Respond ONLY with the JSON.
  `;
    const response = await llm.generateText({
        messages: [{ role: 'user', content: prompt }],
        model: process.env.LLM_MODEL,
    });
    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch)
        throw new Error('Failed to parse LLM response');
    return c.json(JSON.parse(jsonMatch[0]));
});
aiRoutes.get('/topic-map', async (c) => {
    const latestAnalysis = await prisma.analysis.findFirst({
        where: { isDeleted: false, isDeepAnalysisComplete: true },
        orderBy: { createdAt: 'desc' }
    });
    const llm = new Llm({ provider: process.env.LLM_PROVIDER || LlmProvider.Google });
    const prompt = `
    Based on this content: "${latestAnalysis?.content || latestAnalysis?.url || 'General AI visibility'}", 
    extract a list of main topics and their authority metrics for a Topic Authority Map.
    
    Format as JSON:
    {
      "topics": [
        { "id": "1", "name": "string", "strength": number (0-100), "relevance": number (0-100), "category": "string" }
      ],
      "connections": [
        { "source": "id", "target": "id", "weight": number (0-1) }
      ]
    }

    Respond ONLY with the JSON.
  `;
    const response = await llm.generateText({
        messages: [{ role: 'user', content: prompt }],
        model: process.env.LLM_MODEL,
    });
    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch)
        throw new Error('Failed to parse LLM response');
    return c.json(JSON.parse(jsonMatch[0]));
});
const generateSchema = z.object({
    topic: z.string(),
    audience: z.string(),
    goal: z.string(),
});
aiRoutes.post('/generate', zValidator('json', generateSchema), async (c) => {
    const body = c.req.valid('json');
    const llm = new Llm({ provider: process.env.LLM_PROVIDER || LlmProvider.Google });
    const prompt = `
    Generate high-authority content engineered for LLM citation.
    Topic: ${body.topic}
    Audience: ${body.audience}
    Goal: ${body.goal}

    Provide the content in the following JSON format:
    {
      "title": "string",
      "outline": ["string"],
      "article": "string",
      "faq": [
        { "question": "string", "answer": "string" }
      ],
      "citationReadyParagraphs": ["string"]
    }

    Respond ONLY with the JSON.
  `;
    const response = await llm.generateText({
        messages: [{ role: 'user', content: prompt }],
        model: process.env.LLM_MODEL,
    });
    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch)
        throw new Error('Failed to parse LLM response');
    return c.json(JSON.parse(jsonMatch[0]));
});
const simulateSchema = z.object({
    question: z.string(),
});
aiRoutes.post('/simulate', zValidator('json', simulateSchema), async (c) => {
    const body = c.req.valid('json');
    const latestAnalysis = await prisma.analysis.findFirst({
        where: { isDeleted: false, isDeepAnalysisComplete: true },
        orderBy: { createdAt: 'desc' }
    });
    const llm = new Llm({ provider: process.env.LLM_PROVIDER || LlmProvider.Google });
    const prompt = `
    Simulate an AI-generated answer to this question: "${body.question}"
    Use the following content context if relevant: "${latestAnalysis?.content || ''}"

    Provide the simulation in the following JSON format:
    {
      "simulatedAnswer": "string",
      "rankingProbability": number (0-100),
      "visibilitySuggestions": ["string"],
      "citedSources": [
        { "name": "string", "relevance": number (0-100) }
      ]
    }

    Respond ONLY with the JSON.
  `;
    const response = await llm.generateText({
        messages: [{ role: 'user', content: prompt }],
        model: process.env.LLM_MODEL,
    });
    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch)
        throw new Error('Failed to parse LLM response');
    return c.json(JSON.parse(jsonMatch[0]));
});
export default aiRoutes;
