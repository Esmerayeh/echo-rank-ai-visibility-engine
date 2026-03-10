import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { aiService, AnalysisPayload, AnalysisResult } from '../services/ai.service';
import { 
  Globe, 
  FileText, 
  Loader2, 
  ArrowRight, 
  Users, 
  ChevronLeft,
  LayoutDashboard,
  Zap,
  Shield,
  Target,
  Search,
  Activity,
  Award
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { InsightCard, RecommendationItem, CitationRadar } from '../components/AnalysisComponents';

type AnalysisType = 'url' | 'article' | 'competitor' | null;

export function WebsiteAnalyzer() {
  const [step, setStep] = useState<'select' | 'input' | 'results'>('select');
  const [type, setType] = useState<AnalysisType>(null);
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [progressStep, setProgressStep] = useState(0);
  const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null);
  const [analysisDuration, setAnalysisDuration] = useState<number | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const PROGRESS_STEPS = [
    'Scanning content structure',
    'Evaluating semantic authority',
    'Detecting definitional coverage',
    'Calculating citation probability',
    'Generating optimization insights'
  ];

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const handleSelectType = (selectedType: AnalysisType) => {
    setType(selectedType);
    setStep('input');
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisStartTime(Date.now());
    setProgressStep(0);
    setAnalysisProgress(0);
    setAnalysisDuration(null);

    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    try {
      const payload: AnalysisPayload = {
        type: type as any,
        url: type === 'url' ? url : undefined,
        content: type === 'article' ? content : undefined,
        targetUrl: type === 'competitor' ? targetUrl : undefined,
        competitorUrl: type === 'competitor' ? competitorUrl : undefined,
      };

      // 1. Get Instant Preliminary Score
      const data = await aiService.analyze(payload);
      setResult(data);
      setStep('results');

      if (!data.isDeepAnalysisComplete) {
        // 2. Poll for Deep Analysis
        progressIntervalRef.current = setInterval(() => {
          setProgressStep(prev => Math.min(prev + 1, PROGRESS_STEPS.length - 1));
          setAnalysisProgress(prev => Math.min(prev + 20, 95));
        }, 1500);

        pollIntervalRef.current = setInterval(async () => {
          try {
            const updatedData = await aiService.getAnalysisStatus(data.id);
            if (updatedData.isDeepAnalysisComplete) {
              setResult(updatedData);
              setIsAnalyzing(false);
              setAnalysisProgress(100);
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
              setAnalysisDuration(Math.round((Date.now() - (analysisStartTime || Date.now())) / 1000));
            }
          } catch (error) {
            console.error('Polling failed:', error);
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            setIsAnalyzing(false);
          }
        }, 3000);
      } else {
        setIsAnalyzing(false);
        setAnalysisProgress(100);
        setAnalysisDuration(Math.round((Date.now() - (analysisStartTime || Date.now())) / 1000));
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setStep('select');
    setType(null);
    setResult(null);
    setUrl('');
    setContent('');
    setTargetUrl('');
    setCompetitorUrl('');
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    setProgressStep(0);
    setAnalysisStartTime(null);
    setAnalysisDuration(null);
  };

  const renderSelectType = () => (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-3xl font-black text-foreground">Select Analysis Type</h2>
        <p className="text-muted-foreground">Choose how you want EchoRank to evaluate your content for AI visibility.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => handleSelectType('url')}
          className="group relative p-8 rounded-3xl bg-card/50 border border-border hover:border-blue-500/50 hover:bg-muted/50 transition-all text-left space-y-6 overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Globe className="w-24 h-24" />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
            <Globe className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">Website URL</h3>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">Audit an existing live website page for AI citation signals and retrieval patterns.</p>
          </div>
          <div className="flex items-center gap-2 text-blue-500 text-xs font-bold uppercase tracking-widest pt-4">
            Start Analysis <ArrowRight className="w-3 h-3" />
          </div>
        </button>

        <button 
          onClick={() => handleSelectType('article')}
          className="group relative p-8 rounded-3xl bg-card/50 border border-border hover:border-purple-500/50 hover:bg-muted/50 transition-all text-left space-y-6 overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FileText className="w-24 h-24" />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">Blog Article</h3>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">Paste your raw content or draft to optimize it for LLM comprehension before publishing.</p>
          </div>
          <div className="flex items-center gap-2 text-purple-500 text-xs font-bold uppercase tracking-widest pt-4">
            Start Analysis <ArrowRight className="w-3 h-3" />
          </div>
        </button>

        <button 
          onClick={() => handleSelectType('competitor')}
          className="group relative p-8 rounded-3xl bg-card/50 border border-border hover:border-emerald-500/50 hover:bg-muted/50 transition-all text-left space-y-6 overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-24 h-24" />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">Competitor</h3>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">Benchmark your authority against a competitor to find content gaps and citation opportunities.</p>
          </div>
          <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-widest pt-4">
            Start Analysis <ArrowRight className="w-3 h-3" />
          </div>
        </button>
      </div>
    </div>
  );

  const renderInput = () => (
    <Card className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden border-border bg-card/30 backdrop-blur-xl">
      <div className={`h-1.5 w-full ${
        type === 'url' ? 'bg-blue-600' : type === 'article' ? 'bg-purple-600' : 'bg-emerald-600'
      }`} />
      <CardContent className="p-10">
        <button onClick={() => setStep('select')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-10 transition-colors group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Selection
        </button>

        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              type === 'url' ? 'bg-blue-500/10 text-blue-500' :
              type === 'article' ? 'bg-purple-500/10 text-purple-500' :
              'bg-emerald-500/10 text-emerald-500'
            }`}>
              {type === 'url' ? <Globe className="w-6 h-6" /> : type === 'article' ? <FileText className="w-6 h-6" /> : <Users className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground capitalize">{type} Analysis</h3>
              <p className="text-muted-foreground text-sm">Provide the necessary details below to begin the AI engine crawl.</p>
            </div>
          </div>

          <div className="space-y-6">
            {type === 'url' && (
              <div className="space-y-4">
                <label className="text-sm font-black text-muted-foreground uppercase tracking-widest">Target URL</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type="url"
                    placeholder="https://yourwebsite.com/article"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-background/50 border border-border rounded-2xl py-5 pl-12 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all text-lg"
                  />
                </div>
              </div>
            )}

            {type === 'article' && (
              <div className="space-y-4">
                <label className="text-sm font-black text-muted-foreground uppercase tracking-widest">Article Content</label>
                <textarea
                  placeholder="Paste your full article content here for deep semantic analysis..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-background/50 border border-border rounded-2xl p-6 text-foreground min-h-[400px] focus:outline-none focus:ring-2 focus:ring-purple-600/50 transition-all resize-none text-lg leading-relaxed"
                />
              </div>
            )}

            {type === 'competitor' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-sm font-black text-muted-foreground uppercase tracking-widest">Your Website</label>
                  <div className="relative">
                    <LayoutDashboard className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                      type="url"
                      placeholder="https://yourwebsite.com"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      className="w-full bg-background/50 border border-border rounded-2xl py-5 pl-12 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-600/50 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-black text-muted-foreground uppercase tracking-widest">Competitor Website</label>
                  <div className="relative">
                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                      type="url"
                      placeholder="https://competitor.com"
                      value={competitorUrl}
                      onChange={(e) => setCompetitorUrl(e.target.value)}
                      className="w-full bg-background/50 border border-border rounded-2xl py-5 pl-12 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-600/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (type === 'url' && !url) || (type === 'article' && !content) || (type === 'competitor' && (!targetUrl || !competitorUrl))}
              className={`w-full py-6 rounded-2xl font-black text-foreground uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-2xl ${
                type === 'url' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20' :
                type === 'article' ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20' :
                'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isAnalyzing && step === 'input' ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Calibrating AI Models...
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6" />
                  Run AI Analysis
                </>
              )}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderResults = () => {
    if (!result) return null;

    return (
      <div className="space-y-10 animate-in fade-in duration-700">
        {isAnalyzing && (
          <div className="bg-card/50 border border-border p-6 rounded-3xl animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                <span className="text-sm font-bold uppercase tracking-widest text-foreground">
                  {PROGRESS_STEPS[progressStep]}...
                </span>
              </div>
              <span className="text-xs font-black text-blue-500">{analysisProgress}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                style={{ width: `${analysisProgress}%` }} 
              />
            </div>
          </div>
        )}

        {analysisDuration && (
          <div className="flex justify-center">
            <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-500 animate-in fade-in zoom-in duration-500">
              Analysis completed in {analysisDuration} seconds
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <button onClick={reset} className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors mb-2 group">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Start New Analysis
            </button>
            <h2 className="text-3xl font-black text-foreground">Analysis Insights</h2>
          </div>
          <div className="flex gap-4">
            <div className="px-5 py-2.5 bg-card border border-border rounded-2xl text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-3">
              <Activity className="w-4 h-4 text-blue-500" />
              Source: <span className="text-foreground">{type}</span>
            </div>
            <div className="px-5 py-2.5 bg-blue-600/10 border border-blue-600/20 rounded-2xl text-xs font-bold uppercase tracking-widest text-blue-500 flex items-center gap-3">
              <Award className="w-4 h-4" />
              Index: <span className="text-foreground">{result.metrics.visibilityScore}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Visibility Profile Card */}
          <div className="lg:col-span-1">
            <Card className="p-8 h-full bg-card/40 backdrop-blur-xl border-border">
              <div className="space-y-2 mb-8 text-center">
                <h3 className="text-lg font-black text-foreground uppercase tracking-widest">AI Visibility Profile</h3>
                <p className="text-xs text-muted-foreground">Multidimensional evaluation of content strength</p>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={result.radarData}>
                    <PolarGrid stroke="#26262c" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 'bold' }} />
                    <Radar
                      name="Score"
                      dataKey="A"
                      stroke="#6B5CFF"
                      fill="#6B5CFF"
                      fillOpacity={0.4}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#17171c', border: '1px solid #26262c', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-8 space-y-6 pt-8 border-t border-border">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                    <span className="text-muted-foreground">Overall Score</span>
                    <span className="text-blue-500 text-xl font-black">{result.metrics.visibilityScore}</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${result.metrics.visibilityScore}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Citation</p>
                    <p className="text-lg font-black text-emerald-500">{result.metrics.citationProbability}%</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Authority</p>
                    <p className="text-lg font-black text-purple-500">{result.metrics.topicAuthority}%</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Insights Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.insights.map((insight, i) => (
                <InsightCard key={i} insight={insight} index={i} />
              ))}
            </div>

            <Card className="bg-card/40 border-border overflow-hidden">
              <CardHeader className="border-b border-border/50 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black text-foreground">Recommended Improvements</CardTitle>
                    <CardDescription className="text-muted-foreground">Strategic roadmap for maximizing LLM citation probability</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.recommendations.map((rec, i) => (
                    <RecommendationItem key={i} rec={rec as any} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Citation Radar & Competitor Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <CitationRadar citationRadar={result.citationRadar as any} />
          </div>

          <Card className={`lg:col-span-2 bg-card/40 border-border overflow-hidden ${type !== 'competitor' ? 'opacity-50 grayscale' : ''}`}>
            <CardHeader className="border-b border-border/50 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black text-foreground">Competitor Comparison</CardTitle>
                    <CardDescription className="text-muted-foreground">Benchmarking semantic depth and domain authority</CardDescription>
                  </div>
                </div>
                {type !== 'competitor' && (
                  <span className="text-[10px] font-black uppercase bg-muted text-muted-foreground px-3 py-1 rounded-full">Available in Competitor Mode</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {result.competitorAnalysis ? (
                <div className="space-y-10">
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Depth', You: result.competitorAnalysis.userMetrics.depth, Competitor: result.competitorAnalysis.competitorMetrics.depth },
                          { name: 'Authority', You: result.competitorAnalysis.userMetrics.authority, Competitor: result.competitorAnalysis.competitorMetrics.authority },
                          { name: 'Citation', You: result.competitorAnalysis.userMetrics.citation, Competitor: result.competitorAnalysis.competitorMetrics.citation },
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        barGap={12}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#26262c" vertical={false} />
                        <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} tick={{ fontWeight: 'bold' }} />
                        <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} tick={{ fontWeight: 'bold' }} />
                        <Tooltip 
                          cursor={{ fill: '#26262c', opacity: 0.4 }}
                          contentStyle={{ backgroundColor: '#17171c', border: '1px solid #26262c', borderRadius: '12px' }}
                          itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '20px' }} />
                        <Bar dataKey="You" fill="#6B5CFF" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="Competitor" fill="#10b981" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-8">
                    {[
                      { label: 'Content Depth', you: result.competitorAnalysis.userMetrics.depth, comp: result.competitorAnalysis.competitorMetrics.depth },
                      { label: 'Topic Authority', you: result.competitorAnalysis.userMetrics.authority, comp: result.competitorAnalysis.competitorMetrics.authority },
                      { label: 'Citation Prob.', you: result.competitorAnalysis.userMetrics.citation, comp: result.competitorAnalysis.competitorMetrics.citation },
                    ].map((m, i) => (
                      <div key={i} className={`space-y-3 ${i !== 2 ? 'border-r border-border pr-8' : ''}`}>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest text-center">{m.label}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-center">
                            <p className="text-[8px] text-muted-foreground uppercase font-bold mb-1">You</p>
                            <p className="text-2xl font-black text-blue-500">{m.you}%</p>
                          </div>
                          <div className="h-8 w-px bg-muted rotate-12" />
                          <div className="text-center">
                            <p className="text-[8px] text-muted-foreground uppercase font-bold mb-1">Comp.</p>
                            <p className="text-2xl font-black text-emerald-500">{m.comp}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[350px] space-y-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center text-border">
                    <Search className="w-8 h-8" />
                  </div>
                  <div className="max-w-xs">
                    <p className="text-foreground font-bold">No Comparison Data</p>
                    <p className="text-muted-foreground text-sm mt-1">Select "Competitor" analysis type to enable side-by-side benchmarking.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border pb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-2 py-0.5 bg-blue-600/10 text-blue-500 rounded text-[10px] font-black uppercase tracking-widest">v2.0 Beta</div>
            <span className="h-1 w-1 rounded-full bg-muted" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Enterprise Analytics</span>
          </div>
          <h1 className="text-5xl font-black text-foreground tracking-tight">AI Visibility Engine</h1>
          <p className="text-muted-foreground mt-3 text-lg max-w-xl leading-relaxed">Quantify your digital footprint and optimize content for the next generation of AI-driven search and retrieval.</p>
        </div>
        {step !== 'select' && (
          <button onClick={reset} className="px-6 py-3 bg-card border border-border rounded-2xl text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
            Cancel Analysis
          </button>
        )}
      </div>

      {step === 'select' && renderSelectType()}
      {step === 'input' && renderInput()}
      {step === 'results' && renderResults()}
    </div>
  );
}