export interface VisibilityMetrics {
  visibilityScore: number;
  citationProbability: number;
  topicAuthority: number;
  optimizationAlerts: number;
}

export interface AnalysisResult {
  url?: string;
  content?: string;
  metrics: VisibilityMetrics;
  strengths: string[];
  weaknesses: string[];
  recommendations: {
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }[];
  evaluationFactors: {
    factor: string;
    score: number;
  }[];
}

export interface OptimizedContent {
  originalTitle: string;
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
  readabilityScore: number;
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

export interface GeneratedContent {
  title: string;
  outline: string[];
  article: string;
  faq: {
    question: string;
    answer: string;
  }[];
  citationReadyParagraphs: string[];
}

export interface AnswerSimulation {
  question: string;
  simulatedAnswer: string;
  rankingProbability: number;
  visibilitySuggestions: string[];
  citedSources: {
    name: string;
    relevance: number;
  }[];
}
