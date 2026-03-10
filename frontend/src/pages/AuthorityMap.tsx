import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { aiService, TopicMapData } from '../services/ai.service';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
  CartesianGrid
} from 'recharts';
import { Zap, Target, Layers, Loader2 } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

export function AuthorityMap() {
  const [topicMap, setTopicMap] = useState<TopicMapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopicMap = async () => {
      try {
        const data = await aiService.getTopicMap();
        setTopicMap(data);
      } catch (error) {
        console.error('Failed to fetch topic map:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopicMap();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-muted-foreground font-medium">Mapping semantic authority...</p>
      </div>
    );
  }

  if (!topicMap) return null;

  const scatterData = topicMap.topics.map((t, i) => ({
    name: t.name,
    strength: t.strength,
    relevance: t.relevance,
    z: t.strength * 2,
    category: t.category,
    fill: COLORS[i % COLORS.length]
  }));

  const radarData = topicMap.topics.slice(0, 6).map(t => ({
    subject: t.name,
    A: t.strength,
    B: t.relevance,
    fullMark: 100,
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Topic Authority Map</h1>
          <p className="text-muted-foreground mt-1">Visualize your semantic footprint and topical relevance across models.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg text-xs font-medium text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Topic Strength
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg text-xs font-medium text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Relevance
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="min-h-[500px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-500" />
              Semantic Authority Radar
            </CardTitle>
            <CardDescription>Multi-dimensional analysis of your top 6 categories</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#26262c" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Topic Strength"
                  dataKey="A"
                  stroke="#6B5CFF"
                  fill="#6B5CFF"
                  fillOpacity={0.4}
                />
                <Radar
                  name="Relevance"
                  dataKey="B"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.4}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#17171c', border: '1px solid #26262c', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="min-h-[500px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-500" />
              Topic Distribution Matrix
            </CardTitle>
            <CardDescription>Strength vs. Relevance distribution across your portfolio</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#26262c" />
                <XAxis 
                  type="number" 
                  dataKey="strength" 
                  name="Strength" 
                  stroke="#a1a1aa" 
                  fontSize={12} 
                  label={{ value: 'Strength', position: 'bottom', offset: 0, fill: '#a1a1aa' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="relevance" 
                  name="Relevance" 
                  stroke="#a1a1aa" 
                  fontSize={12}
                  label={{ value: 'Relevance', angle: -90, position: 'left', fill: '#a1a1aa' }}
                />
                <ZAxis type="number" dataKey="z" range={[50, 400]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  contentStyle={{ backgroundColor: '#17171c', border: '1px solid #26262c', borderRadius: '8px' }}
                />
                <Scatter name="Topics" data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topicMap.topics.slice(0, 3).map((topic, i) => (
          <Card key={topic.id} className="relative overflow-hidden group hover:border-blue-500/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{topic.category}</p>
                  <h3 className="text-xl font-bold text-foreground">{topic.name}</h3>
                </div>
                <div className="w-10 h-10 bg-card rounded-lg flex items-center justify-center border border-border">
                  <Zap className={`w-5 h-5 ${i === 0 ? 'text-blue-500' : i === 1 ? 'text-emerald-500' : 'text-purple-500'}`} />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Topic Strength</span>
                    <span className="text-foreground">{topic.strength}%</span>
                  </div>
                  <div className="h-1 w-full bg-muted rounded-full">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${topic.strength}%` }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Relevance Score</span>
                    <span className="text-foreground">{topic.relevance}%</span>
                  </div>
                  <div className="h-1 w-full bg-muted rounded-full">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${topic.relevance}%` }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
