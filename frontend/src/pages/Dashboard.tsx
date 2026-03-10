import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Gauge } from '../components/ui/Gauge';
import { aiService, DashboardMetrics, HistoryItem } from '../services/ai.service';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis
} from 'recharts';
import { 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  ArrowRight,
  CheckCircle2, 
  TrendingUp, 
  Loader2, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  History,
  ExternalLink,
  Zap,
  Shield,
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface DashboardProps {
  onNewAnalysis?: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
} as any;

const RADAR_TOOLTIPS: Record<string, string> = {
  'Clarity': 'Measures how easily AI models can parse and understand the primary message.',
  'Structure': 'Evaluates the use of semantic HTML and logical heading hierarchy.',
  'Authority': 'Assesses the presence of credible citations and expert-level terminology.',
  'Depth': 'Analyzes the comprehensiveness of information relative to the topic.',
  'Definitions': 'Detects structured definition blocks that improve AI indexing.'
};

export function Dashboard({ onNewAnalysis }: DashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedStrengths, setExpandedStrengths] = useState(false);
  const [expandedWeaknesses, setExpandedWeaknesses] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [metricsData, historyData] = await Promise.all([
          aiService.getDashboardMetrics(),
          aiService.getAnalysisHistory().catch(() => [])
        ]);
        setMetrics(metricsData);
        setHistory(historyData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 className="w-10 h-10 text-blue-500" />
        </motion.div>
        <p className="text-muted-foreground font-medium animate-pulse">Synchronizing AI Intelligence Engine...</p>
      </div>
    );
  }

  if (!metrics || (metrics.visibilityScore === 0 && !metrics.isDemo)) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4"
      >
        <div className="w-24 h-24 bg-blue-600/10 rounded-full flex items-center justify-center mb-6">
          <Zap className="w-12 h-12 text-blue-500" />
        </div>
        <h1 className="text-4xl font-black text-foreground mb-4">No Analysis Data Found</h1>
        <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
          EchoRank is ready to analyze your content's visibility in the AI ecosystem. 
          Start by running your first deep analysis.
        </p>
        <button 
          onClick={onNewAnalysis}
          className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 text-foreground rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20 flex items-center gap-3 hover:-translate-y-1 active:scale-95"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Run First Analysis
        </button>
      </motion.div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 40) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const renderTrendIndicator = (change: number) => {
    const isPositive = change >= 0;
    return (
      <div className={cn(
        "flex items-center gap-1.5 text-[10px] font-black px-2 py-0.5 rounded-full border",
        isPositive ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-red-500 bg-red-500/10 border-red-500/20"
      )}>
        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        <span>{Math.abs(change)}%</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Content */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">AI Visibility Dashboard</h1>
              {metrics.isDemo && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                  Demo Analysis
                </span>
              )}
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {metrics.isDemo 
                ? "Analyzing sample data for openai.com/blog"
                : "Real-time AI visibility and semantic authority metrics."}
            </p>
          </div>
          <button 
            onClick={onNewAnalysis}
            className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-foreground rounded-xl text-sm font-bold transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Analysis
          </button>
        </div>

        {/* Primary Insight & Radar */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="xl:col-span-2">
            <Card className="h-full border-2 border-zinc-800/50 relative overflow-hidden group bg-gradient-to-br from-zinc-900/50 to-transparent">
              <CardHeader className="pb-0 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-widest">Core AI Visibility Score</CardTitle>
                </div>
                {renderTrendIndicator(metrics.visibilityScoreChange)}
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative group/radar w-full md:w-[400px] h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={metrics.radarData}>
                        <PolarGrid stroke="#26262c" />
                        <PolarAngleAxis 
                          dataKey="subject" 
                          tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 'bold' }} 
                        />
                        <RechartsTooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-2xl max-w-[250px] animate-in zoom-in duration-200">
                                  <p className="text-sm font-bold text-white mb-2">{data.subject}</p>
                                  <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                                    {RADAR_TOOLTIPS[data.subject] || 'Evaluation metric for AI visibility.'}
                                  </p>
                                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-zinc-500">Performance</span>
                                    <span className={cn("text-sm font-black", getScoreColor(data.A))}>{data.A}%</span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Radar
                          name="Visibility"
                          dataKey="A"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.3}
                          strokeWidth={4}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-6 w-full py-4">
                    <div className="space-y-1">
                      <div className="flex items-end gap-2">
                        <p className={cn("text-8xl font-black tracking-tighter leading-none", getScoreColor(metrics.visibilityScore))}>
                          {metrics.visibilityScore}%
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground font-black uppercase tracking-widest">Overall Visibility Index</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                        <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-2">AI Summary</p>
                        <p className="text-sm text-foreground font-medium leading-relaxed">
                          {metrics.visibilityScore >= 70 ? "Your content demonstrates exceptional semantic alignment with RAG retrieval architectures." : 
                           metrics.visibilityScore >= 40 ? "Moderate visibility. We've detected critical semantic gaps in definition blocks and topic coverage." : 
                           "Critical visibility issues. Current content structure may cause LLMs to omit your information from generated responses."}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                          <p className="text-[10px] uppercase font-black text-muted-foreground mb-1">Global Rank</p>
                          <p className="text-xl font-bold text-foreground">Top 12%</p>
                        </div>
                        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                          <p className="text-[10px] uppercase font-black text-muted-foreground mb-1">Index Prob.</p>
                          <p className="text-xl font-bold text-foreground">94.2%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Metric Cards Column */}
          <div className="flex flex-col gap-6">
            <motion.div variants={itemVariants}>
              <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all hover:scale-[1.02]">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Citation Likelihood</p>
                      <p className={cn("text-4xl font-black", getScoreColor(metrics.citationProbability))}>{metrics.citationProbability}%</p>
                    </div>
                    <Gauge value={metrics.citationProbability} size={70} strokeWidth={7} color={metrics.citationProbability >= 70 ? '#10b981' : metrics.citationProbability >= 40 ? '#f59e0b' : '#ef4444'} />
                  </div>
                  <div className="flex items-center justify-between">
                    {renderTrendIndicator(metrics.citationProbabilityChange)}
                    <span className="text-[10px] font-bold text-muted-foreground">vs Last Week</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all hover:scale-[1.02]">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Topic Authority</p>
                      <p className={cn("text-4xl font-black", getScoreColor(metrics.topicAuthority))}>{metrics.topicAuthority}%</p>
                    </div>
                    <Gauge value={metrics.topicAuthority} size={70} strokeWidth={7} color={metrics.topicAuthority >= 70 ? '#8b5cf6' : metrics.topicAuthority >= 40 ? '#f59e0b' : '#ef4444'} />
                  </div>
                  <div className="flex items-center justify-between">
                    {renderTrendIndicator(metrics.topicAuthorityChange)}
                    <span className="text-[10px] font-bold text-muted-foreground">Expert Ranking</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all hover:scale-[1.02]">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Alerts</p>
                      <p className={cn("text-4xl font-black", metrics.optimizationAlerts > 0 ? 'text-red-500' : 'text-emerald-500')}>{metrics.optimizationAlerts}</p>
                    </div>
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12", metrics.optimizationAlerts > 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500')}>
                      <AlertCircle className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    {renderTrendIndicator(-metrics.optimizationAlertsChange)}
                    <span className="text-[10px] font-bold text-muted-foreground">Issues Detected</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Expandable Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <Card className="border-zinc-800 bg-zinc-900/30 overflow-hidden group">
              <button 
                onClick={() => setExpandedStrengths(!expandedStrengths)}
                className="w-full text-left"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="flex items-center gap-2 text-emerald-500 group-hover:translate-x-1 transition-transform">
                    <Shield className="w-5 h-5" />
                    Content Strengths
                  </CardTitle>
                  {expandedStrengths ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </CardHeader>
              </button>
              <AnimatePresence>
                {expandedStrengths && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <CardContent className="pt-0 pb-6">
                      <div className="space-y-4">
                        {metrics.strengths.map((strength, i) => (
                          <div key={i} className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <p className="text-sm text-foreground font-bold">{strength.title}</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">{strength.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
              {!expandedStrengths && (
                <CardContent className="pt-0 pb-4">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-2">
                    {metrics.strengths.length} critical strengths detected
                  </p>
                </CardContent>
              )}
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-zinc-800 bg-zinc-900/30 overflow-hidden group">
              <button 
                onClick={() => setExpandedWeaknesses(!expandedWeaknesses)}
                className="w-full text-left"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="flex items-center gap-2 text-red-500 group-hover:translate-x-1 transition-transform">
                    <AlertCircle className="w-5 h-5" />
                    Critical Weaknesses
                  </CardTitle>
                  {expandedWeaknesses ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </CardHeader>
              </button>
              <AnimatePresence>
                {expandedWeaknesses && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <CardContent className="pt-0 pb-6">
                      <div className="space-y-4">
                        {metrics.weaknesses.map((weakness, i) => (
                          <div key={i} className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors">
                            <div className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5 text-red-500">
                                <span className="text-[10px] font-black">!</span>
                              </div>
                              <div className="space-y-2">
                                <p className="text-sm text-foreground font-bold">{weakness.title}</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">{weakness.description}</p>
                                <div className="pt-2 flex items-center gap-2">
                                  <Zap className="w-3 h-3 text-amber-500" />
                                  <p className="text-[10px] font-black text-amber-500 uppercase">Recommendation: {weakness.recommendation}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
              {!expandedWeaknesses && (
                <CardContent className="pt-0 pb-4">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-2">
                    {metrics.weaknesses.length} critical weaknesses detected
                  </p>
                </CardContent>
              )}
            </Card>
          </motion.div>
        </div>

        {/* AI Optimization Opportunities */}
        <motion.div variants={itemVariants}>
          <Card className="border-zinc-800 bg-gradient-to-br from-blue-600/5 to-transparent relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Lightbulb className="w-32 h-32 text-blue-500" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                AI Optimization Opportunities
              </CardTitle>
              <CardDescription>Targeted improvements to boost visibility based on recent analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {metrics.optimizationOpportunities.map((opt, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 group hover:border-blue-500/50 transition-all hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-foreground group-hover:text-blue-400 transition-colors">{opt.title}</h4>
                      <span className={cn("text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded", opt.impact === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500')}>
                        {opt.impact} Impact
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-6">{opt.description}</p>
                    <button className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-black uppercase text-blue-500 hover:text-blue-400 transition-all rounded-lg flex items-center justify-center gap-2">
                      Execute Task
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trends */}
        <motion.div variants={itemVariants}>
          <Card className="border-zinc-800">
            <CardHeader>
              <CardTitle>Visibility Velocity</CardTitle>
              <CardDescription>Daily performance of content indexed by major LLMs over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.trendData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#26262c" vertical={false} />
                    <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorScore)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Sidebar - History & Quick Links */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-80 space-y-6"
      >
        <Card className="border-zinc-800 bg-zinc-900/50 sticky top-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
              <History className="w-4 h-4" />
              Analysis History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {history.length > 0 ? (
              history.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-foreground truncate w-40">{item.url}</p>
                    <span className={cn("text-[10px] font-black px-1.5 py-0.5 rounded", getScoreBg(item.visibilityScore), getScoreColor(item.visibilityScore))}>
                      {item.visibilityScore}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground">{new Date(item.timestamp).toLocaleDateString()}</p>
                    <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center space-y-2">
                <History className="w-8 h-8 text-zinc-800 mx-auto" />
                <p className="text-xs text-muted-foreground">No recent analyses found.</p>
              </div>
            )}
            
            <button className="w-full py-3 border border-dashed border-zinc-800 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:border-zinc-700 transition-all">
              View All History
            </button>

            <div className="pt-6 mt-6 border-t border-zinc-800 space-y-4">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Benchmarks</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Industry Avg.</span>
                  <span className="font-bold">54%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Competitors</span>
                  <span className="font-bold">61%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '61%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}