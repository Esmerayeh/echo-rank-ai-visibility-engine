import api from '../lib/api';

const MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export interface AnalysisPayload {
  type: 'url' | 'article' | 'competitor';
  url?: string;
  content?: string;
  targetUrl?: string;
  competitorUrl?: string;
}

export interface AnalysisResult {
  id: string;
  isDeepAnalysisComplete: boolean;
  metrics: {
    visibilityScore: number;
    citationProbability: number;
    topicAuthority: number;
    optimizationAlerts?: number;
  };
  radarData: {
    subject: string;
    A: number;
    fullMark: number;
  }[];
  insights: {
    title: string;
    description: string;
    opportunity: string;
  }[];
  recommendations: {
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    checked?: boolean;
  }[];
  citationRadar: {
    system: string;
    likelihood: 'Low' | 'Medium' | 'High';
  }[];
  competitorAnalysis?: {
    userMetrics: { depth: number; authority: number; citation: number };
    competitorMetrics: { depth: number; authority: number; citation: number };
  };
}

export interface OptimizationResult {
  improvedTitle: string;
  explanationSections: {
    heading: string;
    content: string;
  }[];
  definitionBlock: {
    term: string;
    definition: string;
  }[];
  faqSection: {
    question: string;
    answer: string;
  }[];
  bulletInsights: string[];
}

export interface TopicMapData {
  topics: {
    id: string;
    name: string;
    strength: number;
    relevance: number;
    category: string;
  }[];
  connections: {
    source: string;
    target: string;
    weight: number;
  }[];
}

export interface GenerationPayload {
  topic: string;
  audience: string;
  goal: string;
}

export interface GenerationResult {
  title: string;
  outline: string[];
  article: string;
  faq: {
    question: string;
    answer: string;
  }[];
  citationReadyParagraphs: string[];
}

export interface SimulationResult {
  simulatedAnswer: string;
  rankingProbability: number;
  visibilitySuggestions: string[];
  citedSources: {
    name: string;
    relevance: number;
  }[];
}

export interface HistoryItem {
  id: string;
  url: string;
  visibilityScore: number;
  timestamp: string;
}

export interface DashboardMetrics {
  isDemo?: boolean;
  visibilityScore: number;
  visibilityScoreChange: number;
  citationProbability: number;
  citationProbabilityChange: number;
  topicAuthority: number;
  topicAuthorityChange: number;
  optimizationAlerts: number;
  optimizationAlertsChange: number;
  trendData: { name: string; score: number }[];
  categoryData: { name: string; value: number }[];
  radarData: { subject: string; A: number; fullMark: number }[];
  strengths: { title: string; description: string }[];
  weaknesses: { title: string; description: string; recommendation: string }[];
  optimizationOpportunities: { title: string; impact: 'High' | 'Medium' | 'Low'; description: string }[];
  history?: HistoryItem[];
}

const mockDashboard: DashboardMetrics = {
  isDemo: true,
  visibilityScore: 72,
  visibilityScoreChange: 4.2,
  citationProbability: 64,
  citationProbabilityChange: 12.4,
  topicAuthority: 78,
  topicAuthorityChange: -2.1,
  optimizationAlerts: 4,
  optimizationAlertsChange: 3,
  trendData: [
    { name: '10 Mar', score: 45 },
    { name: '11 Mar', score: 52 },
    { name: '12 Mar', score: 48 },
    { name: '13 Mar', score: 61 },
    { name: '14 Mar', score: 65 },
    { name: '15 Mar', score: 72 }
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
    { title: 'Semantic Clarity', description: 'Core concepts are explained using clear, unambiguous language that LLMs can easily parse.' },
    { title: 'Topical Depth', description: 'Content covers a wide range of sub-topics, signaling high topical authority to retrieval systems.' },
    { title: 'Expert Terminology', description: 'Use of industry-standard terms helps AI models categorize the content as high-authority.' }
  ],
  weaknesses: [
    { title: 'Missing Definition Blocks', description: 'Lack of structured <dfn> or bolded terms makes it harder for AI to extract quick answers.', recommendation: 'Add a glossary or definition section.' },
    { title: 'Poor Heading Hierarchy', description: 'Inconsistent use of H2 and H3 tags confuses semantic parsing of content structure.', recommendation: 'Audit and fix heading nesting.' },
    { title: 'Low Citation Density', description: 'Few outbound links to authoritative sources reduces trust signals for LLM evaluators.', recommendation: 'Add more outbound citations.' },
    { title: 'Factual Grounding', description: 'Some claims lack direct evidential support required for high-trust citations.', recommendation: 'Add specific citations for quantitative data.' }
  ],
  optimizationOpportunities: [
    { title: "Definitional Clarity", impact: "High", description: "Add structured definition blocks for core entities to capture AI dictionary queries." },
    { title: "Semantic Depth", impact: "Medium", description: "Expand on sub-topics with high semantic density to improve topical authority." },
    { title: "Citation Signals", impact: "High", description: "Integrate authoritative outbound links to signal credibility to LLM evaluators." }
  ],
  history: [
    { id: 'demo-1', url: 'https://openai.com/blog', visibilityScore: 72, timestamp: new Date().toISOString() },
    { id: 'demo-2', url: 'https://anthropic.com/news', visibilityScore: 54, timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: 'demo-3', url: 'https://perplexity.ai/about', visibilityScore: 72, timestamp: new Date(Date.now() - 172800000).toISOString() }
  ]
};

const mockAnalysis: AnalysisResult = {
  id: 'mock-' + Math.random().toString(36).substr(2, 9),
  isDeepAnalysisComplete: false,
  metrics: {
    visibilityScore: 68,
    citationProbability: 45,
    topicAuthority: 72,
    optimizationAlerts: 8,
  },
  radarData: [
    { subject: 'Clarity', A: 85, fullMark: 100 },
    { subject: 'Structure', A: 30, fullMark: 100 },
    { subject: 'Authority', A: 75, fullMark: 100 },
    { subject: 'Depth', A: 80, fullMark: 100 },
    { subject: 'Definitions', A: 0, fullMark: 100 }
  ],
  insights: [
    { title: 'Semantic Gap Detected', description: 'Your content covers LLMs but misses the specific "Transformer" connection.', opportunity: 'Add a section on Transformer evolution.' },
    { title: 'Citation Opportunity', description: 'High authority references are missing in the introduction.', opportunity: 'Link to foundational research papers.' }
  ],
  recommendations: [
    { title: 'Add Definitions', description: 'Define key terms in structured blocks.', impact: 'high' },
    { title: 'Improve Hierarchy', description: 'Use semantic H2/H3 tags.', impact: 'medium' }
  ],
  citationRadar: [
    { system: 'ChatGPT', likelihood: 'High' },
    { system: 'Gemini', likelihood: 'Medium' },
    { system: 'Claude', likelihood: 'High' },
    { system: 'Perplexity', likelihood: 'Medium' }
  ],
  competitorAnalysis: {
    userMetrics: { depth: 65, authority: 70, citation: 45 },
    competitorMetrics: { depth: 80, authority: 85, citation: 60 }
  }
};

const mockAnalysisComplete: AnalysisResult = {
  ...mockAnalysis,
  isDeepAnalysisComplete: true,
  metrics: {
    visibilityScore: 74,
    citationProbability: 58,
    topicAuthority: 82,
    optimizationAlerts: 3,
  }
};

let userHasAnalyzed = false;
let currentAnalysis: AnalysisResult | null = null;

export const aiService = {
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    if (MOCK_DATA) {
      if (userHasAnalyzed && currentAnalysis) {
        return {
          ...mockDashboard,
          isDemo: false,
          visibilityScore: currentAnalysis.metrics.visibilityScore,
          citationProbability: currentAnalysis.metrics.citationProbability,
          topicAuthority: currentAnalysis.metrics.topicAuthority,
          optimizationAlerts: currentAnalysis.metrics.optimizationAlerts || 0,
          radarData: currentAnalysis.radarData,
          history: [
            { id: currentAnalysis.id, url: 'Recent Analysis', visibilityScore: currentAnalysis.metrics.visibilityScore, timestamp: new Date().toISOString() },
            ...mockDashboard.history || []
          ]
        };
      }
      return mockDashboard;
    }
    
    try {
      const response = await api.get('/ai/dashboard-metrics');
      const data = response.data;
      
      // Basic validation - fallback if no data at all
      if (!data) return mockDashboard;
      
      // Ensure required properties for Dashboard component don't cause crashes
      return {
        ...data,
        radarData: data.radarData || [],
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
        trendData: data.trendData || [],
        optimizationOpportunities: data.optimizationOpportunities || []
      };
    } catch (error) {
      console.error('Failed to fetch dashboard metrics, falling back to demo data:', error);
      return mockDashboard;
    }
  },

  exportContent: async (content: string, fileName: string, fileType?: string): Promise<{ url: string }> => {
    if (MOCK_DATA) return { url: '#' };
    const response = await api.post('/ai/export', { content, fileName, fileType });
    return response.data;
  },

  uploadFile: async (file: File): Promise<{ url: string }> => {
    if (MOCK_DATA) return { url: '#' };
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/ai/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getAnalysisHistory: async (): Promise<HistoryItem[]> => {
    if (MOCK_DATA) return mockDashboard.history || [];
    try {
      const response = await api.get('/ai/history');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Failed to fetch analysis history:', error);
      return [];
    }
  },

  analyze: async (payload: AnalysisPayload): Promise<AnalysisResult> => {
    userHasAnalyzed = true;
    if (MOCK_DATA) {
      currentAnalysis = { ...mockAnalysis, id: 'mock-' + Math.random().toString(36).substr(2, 9) };
      return currentAnalysis;
    }
    const response = await api.post('/ai/analyze', payload);
    return response.data;
  },

  getAnalysisStatus: async (id: string): Promise<AnalysisResult> => {
    if (MOCK_DATA) {
      if (currentAnalysis) {
        currentAnalysis = { ...mockAnalysisComplete, id };
      }
      return currentAnalysis || mockAnalysisComplete;
    }
    const response = await api.get(`/ai/analysis/${id}`);
    return response.data;
  },

  optimize: async (content: string): Promise<OptimizationResult> => {
    if (MOCK_DATA) return {
      improvedTitle: 'The Architecture of AI Visibility: Engineering Content for LLM Retrieval',
      explanationSections: [
        {
          heading: 'Semantic Grounding',
          content: 'LLMs utilize vector embeddings to determine content relevance. By grounding technical terms in clear context, you improve retrieval accuracy.'
        },
        {
          heading: 'Citation Probability Markers',
          content: 'Structured definition blocks and unambiguous entity descriptions act as signals for RAG systems to select your content as a citation source.'
        }
      ],
      definitionBlock: [
        { term: 'RAG (Retrieval-Augmented Generation)', definition: 'An AI framework for retrieving data from external sources to improve the accuracy and reliability of generative AI models.' },
        { term: 'Semantic Density', definition: 'The concentration of relevant keywords and concepts within a specific passage of text, evaluated for contextual depth.' }
      ],
      faqSection: [
        { question: 'How do LLMs decide which content to cite?', answer: 'LLMs prioritize content with high topical authority, clear semantic structure, and unambiguous factual statements.' },
        { question: 'Why is definition-based content important for AI?', answer: 'Definition blocks provide explicit semantic mappings that help AI models categorize and retrieve information accurately for user queries.' }
      ],
      bulletInsights: [
        'Content structure matches OpenAI GPT-4o citation preferences.',
        'Semantic hierarchy improves probability of inclusion in Google AI Overviews.',
        'Entity definition blocks are correctly formatted for structured data extraction.'
      ]
    };
    const response = await api.post('/ai/optimize', { content });
    return response.data;
  },

  getTopicMap: async (): Promise<TopicMapData> => {
    if (MOCK_DATA) return {
      topics: [
        { id: '1', name: 'Machine Learning', strength: 85, relevance: 95, category: 'Core AI' },
        { id: '2', name: 'Deep Learning', strength: 70, relevance: 90, category: 'Core AI' },
        { id: '3', name: 'NLP', strength: 90, relevance: 85, category: 'Application' },
        { id: '4', name: 'LLMs', strength: 95, relevance: 98, category: 'Trending' }
      ],
      connections: [
        { source: '1', target: '2', weight: 0.8 },
        { source: '3', target: '4', weight: 0.95 }
      ]
    };
    const response = await api.get('/ai/topic-map');
    return response.data;
  },

  generate: async (payload: GenerationPayload): Promise<GenerationResult> => {
    if (MOCK_DATA) return {
      title: 'The Enterprise Guide to LLM Optimization',
      outline: [
        'Understanding Semantic Retrieval',
        'Engineering for RAG Architectures',
        'Citation Signal Optimization',
        'The Future of AI-First Content'
      ],
      article: 'Semantic retrieval represents the next evolution in how information is accessed and processed. Unlike traditional keyword-based search, Large Language Models (LLMs) evaluate content based on its contextual depth and semantic grounding...\n\nBy implementing structured definition blocks and clear heading hierarchies, enterprises can ensure their high-authority content is accurately indexed and cited by generative AI systems.',
      faq: [
        { question: 'What is semantic grounding?', answer: 'It is the process of mapping technical concepts to clear, unambiguous natural language descriptions.' },
        { question: 'How can I improve my LLM citation score?', answer: 'Focus on providing clear definitions, using structured semantic headers, and maintaining high topical depth.' }
      ],
      citationReadyParagraphs: [
        'Retrieval-Augmented Generation (RAG) bridges the gap between static model weights and dynamic enterprise data.',
        'AI visibility is quantified through the EchoRank semantic authority index, measuring topical depth and clarity.'
      ]
    };
    const response = await api.post('/ai/generate', payload);
    return response.data;
  },

  simulateAnswer: async (question: string): Promise<SimulationResult> => {
    if (MOCK_DATA) return {
      simulatedAnswer: 'Large Language Models (LLMs) are AI systems trained on massive datasets to understand and generate human-like text. According to EchoRank insights, their visibility depends heavily on semantic grounding and structural clarity.',
      rankingProbability: 0.85,
      visibilitySuggestions: [
        'Add more structured definition blocks for technical terms.',
        'Improve the semantic hierarchy of your main article headings.',
        'Incorporate authoritative outbound links to signal topical depth.'
      ],
      citedSources: [
        { name: 'EchoRank Analysis', relevance: 0.95 },
        { name: 'AI Research Journal', relevance: 0.88 }
      ]
    };
    const response = await api.post('/ai/simulate', { question });
    return response.data;
  },
};