import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { getInstance as getLlmInstance } from '../integrations/llm/main.ts';
import { optionalAuthMiddleware } from '../middlewares/authMiddleware.ts';
import prisma from '../client.ts';
import crypto from 'crypto';

const aiRoutes = new Hono<{
  Variables: {
    userId?: string;
    userEmail?: string;
  }
}>();

aiRoutes.use('*', optionalAuthMiddleware);

const analyzeSchema = z.object({
  type: z.enum(['url', 'article', 'competitor']),
  url: z.string().optional(),
  content: z.string().optional(),
  targetUrl: z.string().optional(),
  competitorUrl: z.string().optional(),
});

function calculateHash(body: any): string {
  const str = JSON.stringify({
    type: body.type,
    url: body.url,
    content: body.content,
    targetUrl: body.targetUrl,
    competitorUrl: body.competitorUrl,
  });
  return crypto.createHash('md5').update(str).digest('hex');
}

function runPreliminaryHeuristics(content: string = ''): any {
  // Simple heuristic-based preliminary analysis
  const h2Count = (content.match(/<h2/g) || []).length || (content.match(/^## /gm) || []).length;
  const h3Count = (content.match(/<h3/g) || []).length || (content.match(/^### /gm) || []).length;
  const definitionSignals = (content.match(/is defined as|refers to|means|is a/gi) || []).length;
  const wordCount = content.split(/\s+/).length;
  const linkCount = (content.match(/<a\s/g) || []).length || (content.match(/\[.*\]\(.*\)/g) || []).length;

  let score = 55; // Base score
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
      { subject: "Clarity", A: finalScore - 5, fullMark: 100 },
      { subject: "Structure", A: finalScore + 5, fullMark: 100 },
      { subject: "Authority", A: finalScore - 10, fullMark: 100 },
      { subject: "Depth", A: finalScore - 2, fullMark: 100 },
      { subject: "Definitions", A: finalScore + 8, fullMark: 100 }
    ],
    insights: [
      { title: "Preliminary Content Structure", description: "Found " + h2Count + " major headings.", opportunity: "Increase heading density for better semantic parsing." }
    ],
    recommendations: [
      { title: "Increase Semantic Depth", description: "Current word count is " + wordCount + ".", impact: "high" }
    ],
    citationRadar: [
      { system: "ChatGPT", likelihood: finalScore > 70 ? "High" : finalScore > 40 ? "Medium" : "Low" },
      { system: "Perplexity", likelihood: finalScore > 75 ? "High" : finalScore > 45 ? "Medium" : "Low" },
      { system: "Claude", likelihood: finalScore > 70 ? "High" : finalScore > 40 ? "Medium" : "Low" },
      { system: "Gemini", likelihood: finalScore > 65 ? "High" : finalScore > 35 ? "Medium" : "Low" }
    ],
  };
}

async function runDeepAnalysis(analysisId: string, body: any) {
  try {
    const llm = getLlmInstance();

    const prompt = `
      Analyze the following content for AI Visibility and LLM Citation Likelihood.
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
          radarData: result.radarData as any,
          insights: result.insights as any,
          recommendations: result.recommendations as any,
          citationRadar: result.citationRadar as any,
          competitorAnalysis: result.competitorAnalysis as any,
          isDeepAnalysisComplete: true,
        }
      });
    }
  } catch (error) {
    console.error('Deep analysis failed:', error);
  }
}

aiRoutes.post('/analyze', zValidator('json', analyzeSchema), async (c) => {
  const body = c.req.valid('json');
  const userId = c.get('userId');
  const hash = calculateHash(body);

  // Check cache (global or per user? let's do global for deep analysis, but associate this one with user)
  const cached = await prisma.analysis.findFirst({
    where: { contentHash: hash, isDeleted: false, isDeepAnalysisComplete: true },
    orderBy: { createdAt: 'desc' }
  });

  if (cached) {
    // Associate with user if logged in
    if (userId) {
      const { id, createdAt, updatedAt, userId: cachedUserId, ...rest } = cached;
      await prisma.analysis.create({
        data: {
          ...rest,
          userId: userId,
          isDeepAnalysisComplete: true,
        } as any
      });
    }

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
      userId: userId,
      type: body.type,
      url: body.url,
      content: body.content,
      targetUrl: body.targetUrl,
      competitorUrl: body.competitorUrl,
      contentHash: hash,
      visibilityScore: prelimResult.metrics.visibilityScore,
      citationProbability: prelimResult.metrics.citationProbability,
      topicAuthority: prelimResult.metrics.topicAuthority,
      radarData: prelimResult.radarData as any,
      insights: prelimResult.insights as any,
      recommendations: prelimResult.recommendations as any,
      citationRadar: prelimResult.citationRadar as any,
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
  const userId = c.get('userId');
  
  try {
    const whereClause: any = { isDeleted: false };
    if (userId) {
      whereClause.userId = userId;
    }

    const analyses = await prisma.analysis.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    if (analyses.length === 0) {
      // Return demo analysis for OpenAI Blog if no data exists for this user/globally
      return c.json({
        isDemo: true,
        website: 'https://openai.com/blog',
        visibilityScore: 72,
        visibilityScoreChange: 4.2,
        citationProbability: 64,
        citationProbabilityChange: 12.4,
        topicAuthority: 78,
        topicAuthorityChange: 2.1,
        optimizationAlerts: 4,
        optimizationAlertsChange: -1,
        trendData: [
          { name: 'Mon', score: 45 },
          { name: 'Tue', score: 52 },
          { name: 'Wed', score: 48 },
          { name: 'Thu', score: 61 },
          { name: 'Fri', score: 65 },
          { name: 'Sat', score: 70 },
          { name: 'Sun', score: 72 },
        ],
        categoryData: [
          { name: 'Clarity', value: 85 },
          { name: 'Structure', value: 72 },
          { name: 'Authority', value: 78 },
          { name: 'Depth', value: 80 },
          { name: 'Definitions', value: 64 }
        ],
        radarData: [
          { subject: 'Clarity', A: 85, fullMark: 100 },
          { subject: 'Structure', A: 72, fullMark: 100 },
          { subject: 'Authority', A: 78, fullMark: 100 },
          { subject: 'Depth', A: 80, fullMark: 100 },
          { subject: 'Definitions', A: 64, fullMark: 100 }
        ],
        strengths: [
          { title: 'Semantic Clarity', description: 'Core concepts are explained using clear, unambiguous language.' },
          { title: 'Technical Hierarchy', description: 'Well-structured technical explanations and documentation.' },
          { title: 'Semantic Alignment', description: 'Strong alignment with RAG retrieval architectures.' }
        ],
        weaknesses: [
          { title: 'Definition Coverage', description: 'Missing structured definition blocks for some technical terms.', recommendation: 'Add definition blocks.' },
          { title: 'Heading Hierarchy', description: 'Inconsistent heading nesting in some sections.', recommendation: 'Audit heading structure.' },
          { title: 'Citation Density', description: 'Low outbound link density to authoritative sources.', recommendation: 'Add more outbound citations.' },
          { title: 'Factual Support', description: 'Quantitative claims need more explicit grounding.', recommendation: 'Provide direct source links.' }
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

    const calculateChange = (current: number, prev: number) => {
      if (!prev || prev === 0) return 0;
      return parseFloat(((current - prev) / prev * 100).toFixed(1));
    };

    const trendData = [...analyses].reverse().map(a => ({
      name: a.createdAt ? a.createdAt.toLocaleDateString('en-US', { weekday: 'short' }) : 'Unknown',
      score: a.visibilityScore || 0
    }));

    const radarData = Array.isArray(latest.radarData) ? latest.radarData : [];
    const categoryData = radarData.map((r: any) => ({ name: r.subject || 'Unknown', value: r.A || 0 }));

    const rawStrengths = Array.isArray(latest.insights) ? latest.insights : [];
    const rawWeaknesses = Array.isArray(latest.recommendations) ? latest.recommendations : [];

    const prevWeaknesses = Array.isArray(previous.recommendations) ? previous.recommendations : [];

    return c.json({
      isDemo: false,
      visibilityScore: latest.visibilityScore || 0,
      visibilityScoreChange: calculateChange(latest.visibilityScore, previous.visibilityScore),
      citationProbability: latest.citationProbability || 0,
      citationProbabilityChange: calculateChange(latest.citationProbability, previous.citationProbability),
      topicAuthority: latest.topicAuthority || 0,
      topicAuthorityChange: calculateChange(latest.topicAuthority, previous.topicAuthority),
      optimizationAlerts: rawWeaknesses.length,
      optimizationAlertsChange: rawWeaknesses.length - prevWeaknesses.length,
      trendData,
      categoryData,
      radarData,
      strengths: rawStrengths.map((s: any) => ({
        title: s.title || 'Insight',
        description: s.description || 'No description available'
      })),
      weaknesses: rawWeaknesses.filter((w: any) => w.impact === 'high' || w.impact === 'medium').map((w: any) => ({
        title: w.title || 'Weakness',
        description: w.description || 'No description available',
        recommendation: w.recommendation || `Follow remediation plan for ${w.title || 'this issue'}`
      })),
      optimizationOpportunities: [
        { title: "Definitional Clarity", impact: "High", description: "Add structured definition blocks for core entities to capture AI dictionary queries." },
        { title: "Semantic Depth", impact: "Medium", description: "Expand on sub-topics with high semantic density to improve topical authority." },
        { title: "Citation Signals", impact: "High", description: "Integrate authoritative outbound links to signal credibility to LLM evaluators." }
      ]
    });
  } catch (error) {
    console.error('Failed to fetch dashboard metrics, returning demo data:', error);
    // Return demo analysis for OpenAI Blog if database fails
    return c.json({
      isDemo: true,
      website: 'https://openai.com/blog',
      visibilityScore: 72,
      visibilityScoreChange: 4.2,
      citationProbability: 64,
      citationProbabilityChange: 12.4,
      topicAuthority: 78,
      topicAuthorityChange: 2.1,
      optimizationAlerts: 4,
      optimizationAlertsChange: -1,
      trendData: [
        { name: 'Mon', score: 45 },
        { name: 'Tue', score: 52 },
        { name: 'Wed', score: 48 },
        { name: 'Thu', score: 61 },
        { name: 'Fri', score: 65 },
        { name: 'Sat', score: 70 },
        { name: 'Sun', score: 72 },
      ],
      categoryData: [
        { name: 'Clarity', value: 85 },
        { name: 'Structure', value: 72 },
        { name: 'Authority', value: 78 },
        { name: 'Depth', value: 80 },
        { name: 'Definitions', value: 64 }
      ],
      radarData: [
        { subject: 'Clarity', A: 85, fullMark: 100 },
        { subject: 'Structure', A: 72, fullMark: 100 },
        { subject: 'Authority', A: 78, fullMark: 100 },
        { subject: 'Depth', A: 80, fullMark: 100 },
        { subject: 'Definitions', A: 64, fullMark: 100 }
      ],
      strengths: [
        { title: 'Semantic Clarity', description: 'Core concepts are explained using clear, unambiguous language.' },
        { title: 'Technical Hierarchy', description: 'Well-structured technical explanations and documentation.' },
        { title: 'Semantic Alignment', description: 'Strong alignment with RAG retrieval architectures.' }
      ],
      weaknesses: [
        { title: 'Definition Coverage', description: 'Missing structured definition blocks for some technical terms.', recommendation: 'Add definition blocks.' },
        { title: 'Heading Hierarchy', description: 'Inconsistent heading nesting in some sections.', recommendation: 'Audit heading structure.' },
        { title: 'Citation Density', description: 'Low outbound link density to authoritative sources.', recommendation: 'Add more outbound citations.' },
        { title: 'Factual Support', description: 'Quantitative claims need more explicit grounding.', recommendation: 'Provide direct source links.' }
      ],
      optimizationOpportunities: [
        { title: "Definitional Clarity", impact: "High", description: "Add structured definition blocks for core entities to capture AI dictionary queries." },
        { title: "Semantic Depth", impact: "Medium", description: "Expand on sub-topics with high semantic density to improve topical authority." },
        { title: "Citation Signals", impact: "High", description: "Integrate authoritative outbound links to signal credibility to LLM evaluators." }
      ]
    });
  }
});

aiRoutes.get('/history', async (c) => {
  const userId = c.get('userId');
  const whereClause: any = { isDeleted: false };
  if (userId) {
    whereClause.userId = userId;
  }

  const history = await prisma.analysis.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  if (history.length === 0) {
    return c.json([{
      id: 'demo-1',
      url: 'https://openai.com/blog',
      visibilityScore: 72,
      timestamp: new Date().toISOString()
    }]);
  }

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
  const llm = getLlmInstance();

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
  if (!jsonMatch) throw new Error('Failed to parse LLM response');
  
  return c.json(JSON.parse(jsonMatch[0]));
});

aiRoutes.get('/topic-map', async (c) => {
  const latestAnalysis = await prisma.analysis.findFirst({
    where: { isDeleted: false, isDeepAnalysisComplete: true },
    orderBy: { createdAt: 'desc' }
  });

  const llm = getLlmInstance();
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
  if (!jsonMatch) throw new Error('Failed to parse LLM response');
  
  return c.json(JSON.parse(jsonMatch[0]));
});

const generateSchema = z.object({
  topic: z.string(),
  audience: z.string(),
  goal: z.string(),
});

aiRoutes.post('/generate', zValidator('json', generateSchema), async (c) => {
  const body = c.req.valid('json');
  const llm = getLlmInstance();

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
  if (!jsonMatch) throw new Error('Failed to parse LLM response');
  
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

  const llm = getLlmInstance();

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
  if (!jsonMatch) throw new Error('Failed to parse LLM response');
  
  return c.json(JSON.parse(jsonMatch[0]));
});

const exportSchema = z.object({
  content: z.string(),
  fileName: z.string(),
  fileType: z.string(),
});

aiRoutes.post('/export', zValidator('json', exportSchema), async (c) => {
  const { content, fileType } = c.req.valid('json');
  
  try {
    // Replace cloud storage with a base64 data URI placeholder
    // This allows the frontend to trigger a download without needing a server-side file store
    const mimeType = fileType === 'pdf' ? 'application/pdf' : 'text/plain';
    const base64Data = Buffer.from(content).toString('base64');
    const dataUri = `data:${mimeType};base64,${base64Data}`;
    
    return c.json({ url: dataUri });
  } catch (error) {
    console.error('Export failed:', error);
    return c.json({ error: 'Export failed' }, 500);
  }
});

aiRoutes.post('/upload', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file');

  if (!file || !(file instanceof Blob)) {
    return c.json({ error: 'No file uploaded' }, 400);
  }

  try {
    // Replace cloud storage with a mock URL placeholder
    // In a real local-only app, we might save to disk, but for this request, 
    // we are removing all cloud storage dependencies.
    const fileName = (file as any).name || 'upload';
    const mockUrl = `https://placeholder.com/uploads/${Date.now()}-${fileName}`;
    
    return c.json({ 
      url: mockUrl, 
      key: `local-placeholder-${Date.now()}` 
    });
  } catch (error) {
    console.error('Upload failed:', error);
    return c.json({ error: 'Upload failed' }, 500);
  }
});

export default aiRoutes;