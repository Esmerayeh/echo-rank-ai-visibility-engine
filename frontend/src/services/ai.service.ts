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
  citationProbability: number;
  topicAuthority: number;
  optimizationAlerts: number;
  trendData: { name: string; score: number }[];
  categoryData: { name: string; value: number }[];
  radarData: { subject: string; A: number; fullMark: number }[];
  strengths: string[];
  weaknesses: string[];
  history?: HistoryItem[];
}

const mockDashboard: DashboardMetrics = {
  isDemo: true,
  visibilityScore: 68,
  citationProbability: 42,
  topicAuthority: 75,
  optimizationAlerts: 12,
  trendData: [
    { name: '10 Mar', score: 45 },
    { name: '11 Mar', score: 52 },
    { name: '12 Mar', score: 48 },
    { name: '13 Mar', score: 61 },
    { name: '14 Mar', score: 55 },
    { name: '15 Mar', score: 68 }
  ],
  categoryData: [
    { name: 'Clarity', value: 85 },
    { name: 'Structure', value: 30 },
    { name: 'Authority', value: 75 },
    { name: 'Depth', value: 80 },
    { name: 'Definitions', value: 0 }
  ],
  radarData: [
    { subject: 'Clarity', A: 85, fullMark: 100 },
    { subject: 'Structure', A: 30, fullMark: 100 },
    { subject: 'Authority', A: 75, fullMark: 100 },
    { subject: 'Depth', A: 80, fullMark: 100 },
    { subject: 'Definitions', A: 0, fullMark: 100 }
  ],
  strengths: [
    'Comprehensive overview of LLM architectures',
    'Clear section headings',
    'High-quality external citations'
  ],
  weaknesses: [
    'Lacks concise definition blocks for technical terms',
    'FAQ section is missing',
    'Some paragraphs are overly dense for LLM summarization'
  ],
  history: [
    { id: '1', url: 'https://openai.com/blog', visibilityScore: 68, timestamp: new Date().toISOString() },
    { id: '2', url: 'https://anthropic.com/news', visibilityScore: 54, timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: '3', url: 'https://perplexity.ai/about', visibilityScore: 72, timestamp: new Date(Date.now() - 172800000).toISOString() }
  ]
};

const mockAnalysis: AnalysisResult = {
  id: 'mock-1',
  isDeepAnalysisComplete: true,
  metrics: {
    visibilityScore: 72,
    citationProbability: 55,
    topicAuthority: 80,
    optimizationAlerts: 4,
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
  ]
};

export const aiService = {
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    if (MOCK_DATA) return mockDashboard;
    const response = await api.get('/ai/dashboard-metrics');
    return response.data;
  },

  getAnalysisHistory: async (): Promise<HistoryItem[]> => {
    if (MOCK_DATA) return mockDashboard.history || [];
    const response = await api.get('/ai/history');
    return response.data;
  },

  analyze: async (payload: AnalysisPayload): Promise<AnalysisResult> => {
    if (MOCK_DATA) return mockAnalysis;
    const response = await api.post('/ai/analyze', payload);
    return response.data;
  },

  getAnalysisStatus: async (id: string): Promise<AnalysisResult> => {
    if (MOCK_DATA) return mockAnalysis;
    const response = await api.get(`/ai/analysis/${id}`);
    return response.data;
  },

  optimize: async (content: string): Promise<OptimizationResult> => {
    if (MOCK_DATA) return {
      improvedTitle: 'Optimized Title',
      explanationSections: [],
      definitionBlock: [],
      faqSection: [],
      bulletInsights: []
    };
    const response = await api.post('/ai/optimize', { content });
    return response.data;
  },

  getTopicMap: async (): Promise<TopicMapData> => {
    if (MOCK_DATA) return { topics: [], connections: [] };
    const response = await api.get('/ai/topic-map');
    return response.data;
  },

  generate: async (payload: GenerationPayload): Promise<GenerationResult> => {
    if (MOCK_DATA) return {
      title: 'Generated Article',
      outline: [],
      article: 'Content goes here...',
      faq: [],
      citationReadyParagraphs: []
    };
    const response = await api.post('/ai/generate', payload);
    return response.data;
  },

  simulateAnswer: async (question: string): Promise<SimulationResult> => {
    if (MOCK_DATA) return {
      simulatedAnswer: 'Mock answer...',
      rankingProbability: 0.8,
      visibilitySuggestions: [],
      citedSources: []
    };
    const response = await api.post('/ai/simulate', { question });
    return response.data;
  },
};

