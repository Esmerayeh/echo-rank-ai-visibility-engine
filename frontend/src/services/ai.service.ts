import api from '../lib/api';

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
}

export const aiService = {
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const response = await api.get('/ai/dashboard-metrics');
    return response.data;
  },

  analyze: async (payload: AnalysisPayload): Promise<AnalysisResult> => {
    const response = await api.post('/ai/analyze', payload);
    return response.data;
  },

  getAnalysisStatus: async (id: string): Promise<AnalysisResult> => {
    const response = await api.get(`/ai/analysis/${id}`);
    return response.data;
  },

  optimize: async (content: string): Promise<OptimizationResult> => {
    const response = await api.post('/ai/optimize', { content });
    return response.data;
  },

  getTopicMap: async (): Promise<TopicMapData> => {
    const response = await api.get('/ai/topic-map');
    return response.data;
  },

  generate: async (payload: GenerationPayload): Promise<GenerationResult> => {
    const response = await api.post('/ai/generate', payload);
    return response.data;
  },

  simulateAnswer: async (question: string): Promise<SimulationResult> => {
    const response = await api.post('/ai/simulate', { question });
    return response.data;
  },
};
