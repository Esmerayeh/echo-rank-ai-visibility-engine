import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Gauge } from '../components/ui/Gauge';
import { aiService, DashboardMetrics } from '../services/ai.service';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis
} from 'recharts';
import { AlertCircle, ArrowUpRight, CheckCircle2, TrendingUp, Loader2 } from 'lucide-react';

interface DashboardProps {
  onNewAnalysis?: () => void;
}

export function Dashboard({ onNewAnalysis }: DashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await aiService.getDashboardMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch dashboard metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-muted-foreground font-medium">Synchronizing system metrics...</p>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">System Overview</h1>
            {metrics.isDemo && (
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest border border-amber-500/20">
                Demo Analysis
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            {metrics.isDemo 
              ? "Displaying sample analysis for openai.com/blog. Run your own analysis to see real results."
              : "Real-time AI visibility and citation metrics for your digital assets."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onNewAnalysis}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-foreground rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            New Analysis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-2 relative overflow-hidden group">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">AI Visibility Profile</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-[200px] w-full md:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={metrics.radarData}>
                    <PolarGrid stroke="#26262c" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                    <Radar
                      name="Score"
                      dataKey="A"
                      stroke="#6B5CFF"
                      fill="#6B5CFF"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-4 w-full">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-4xl font-black text-foreground">{metrics.visibilityScore}%</p>
                    <p className="text-xs text-muted-foreground font-medium">Overall Visibility Index</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>+4.2%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase tracking-tighter font-bold text-muted-foreground">
                    <span>Performance</span>
                    <span>{metrics.visibilityScore}nd Percentile</span>
                  </div>
                  <div className="h-1.5 w-full bg-card rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${metrics.visibilityScore}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Citation Probability</p>
                <p className="text-3xl font-bold text-foreground">{metrics.citationProbability}%</p>
              </div>
              <Gauge value={metrics.citationProbability} size={60} strokeWidth={6} color="#10b981" />
            </div>
            <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-medium">
              <ArrowUpRight className="w-3 h-3" />
              <span>+12% conversion lift</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Topic Authority</p>
                <p className="text-3xl font-bold text-foreground">{metrics.topicAuthority}%</p>
              </div>
              <Gauge value={metrics.topicAuthority} size={60} strokeWidth={6} color="#8b5cf6" />
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
              <span>Top 5% in AI & ML</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Opt. Alerts</p>
                <p className="text-3xl font-bold text-red-500">{metrics.optimizationAlerts}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertCircle className="text-red-500 w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
              <span>3 Critical, 9 Moderate</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Visibility Trends</CardTitle>
            <CardDescription>Daily performance of content indexed by major LLMs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.trendData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6B5CFF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6B5CFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#26262c" vertical={false} />
                  <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#17171c', border: '1px solid #26262c', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#6B5CFF" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Optimization Breakdown</CardTitle>
            <CardDescription>Performance by evaluation factor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#26262c" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#a1a1aa" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#17171c', border: '1px solid #26262c', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="#6B5CFF" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Content Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {metrics.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-3 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 transition-transform group-hover:scale-125"></div>
                  <span className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                    {strength}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Critical Weaknesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {metrics.weaknesses.map((weakness, i) => (
                <li key={i} className="flex items-start gap-3 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 transition-transform group-hover:scale-125"></div>
                  <span className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                    {weakness}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
