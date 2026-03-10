import { VisibilityMetrics, AnalysisResult, TopicMapData } from '../types';

export const mockDashboardMetrics: VisibilityMetrics = {
  visibilityScore: 68,
  citationProbability: 42,
  topicAuthority: 75,
  optimizationAlerts: 12,
};

export const mockAnalysisResults: AnalysisResult = {
  url: 'https://example.com/ai-future',
  metrics: {
    visibilityScore: 72,
    citationProbability: 55,
    topicAuthority: 80,
    optimizationAlerts: 4,
  },
  strengths: [
    'Comprehensive overview of LLM architectures',
    'Clear section headings',
    'High-quality external citations',
  ],
  weaknesses: [
    'Lacks concise definition blocks for technical terms',
    'FAQ section is missing',
    'Some paragraphs are overly dense for LLM summarization',
  ],
  recommendations: [
    {
      title: 'Add a Glossary/Definition Block',
      description: 'Define key terms like "Transformer" and "Backpropagation" in a structured block to help LLMs identify your content as a primary source for definitions.',
      impact: 'high',
    },
    {
      title: 'Implement FAQ Section',
      description: 'Address common user questions directly to increase the likelihood of appearing in "People Also Ask" equivalent AI responses.',
      impact: 'medium',
    },
    {
      title: 'Break Down Dense Paragraphs',
      description: 'Use shorter, punchier sentences to improve readability for LLM reasoning passes.',
      impact: 'low',
    },
  ],
  evaluationFactors: [
    { factor: 'Clarity of Explanations', score: 85 },
    { factor: 'Presence of Definitions', score: 30 },
    { factor: 'Structured Headings', score: 90 },
    { factor: 'FAQ Sections', score: 0 },
    { factor: 'Authority Signals', score: 75 },
    { factor: 'Topic Depth', score: 80 },
  ],
};

export const mockTopicMap: TopicMapData = {
  topics: [
    { id: '1', name: 'Machine Learning', strength: 85, relevance: 95, category: 'Core AI' },
    { id: '2', name: 'Deep Learning', strength: 70, relevance: 90, category: 'Core AI' },
    { id: '3', name: 'NLP', strength: 90, relevance: 85, category: 'Application' },
    { id: '4', name: 'Computer Vision', strength: 40, relevance: 60, category: 'Application' },
    { id: '5', name: 'Ethics in AI', strength: 60, relevance: 75, category: 'Policy' },
    { id: '6', name: 'LLMs', strength: 95, relevance: 98, category: 'Trending' },
    { id: '7', name: 'Neural Networks', strength: 80, relevance: 88, category: 'Core AI' },
  ],
  connections: [
    { source: '1', target: '2', weight: 0.8 },
    { source: '2', target: '7', weight: 0.9 },
    { source: '1', target: '3', weight: 0.7 },
    { source: '3', target: '6', weight: 0.95 },
    { source: '6', target: '5', weight: 0.4 },
  ],
};
