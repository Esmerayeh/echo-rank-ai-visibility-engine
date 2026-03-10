import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { MessageSquare, Loader2, Sparkles, Send, Target, AlertCircle, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { Gauge } from '../components/ui/Gauge';
import { aiService, SimulationResult } from '../services/ai.service';

export function AnswerSimulation() {
  const [question, setQuestion] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const data = await aiService.simulateAnswer(question);
      setResult(data);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">AI Answer Simulation</h1>
        <p className="text-muted-foreground mt-1">Test how likely your content is to be cited in real-world LLM responses.</p>
      </div>

      <Card className="bg-gradient-to-br from-card to-black border-border">
        <CardContent className="p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h3 className="text-xl font-bold text-foreground">Ask a targeted question</h3>
              <p className="text-sm text-muted-foreground">Simulate how ChatGPT or Claude would answer using your knowledge base.</p>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="How does AI visibility impact content strategy?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full bg-background border border-border rounded-2xl py-5 pl-6 pr-32 text-foreground text-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-2xl"
              />
              <button
                disabled={!question || isSimulating}
                onClick={handleSimulate}
                className="absolute right-3 top-3 bottom-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-foreground rounded-xl font-bold transition-all flex items-center gap-2"
              >
                {isSimulating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Simulate
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {['What is AI visibility?', 'How to improve citations?', 'Semantic SEO tips'].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuestion(q)}
                  className="px-3 py-1 bg-card hover:bg-muted border border-border rounded-full text-xs text-muted-foreground transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in zoom-in-95 duration-500">
          <Card className="lg:col-span-2 overflow-hidden border-blue-500/20 bg-blue-950/5">
            <CardHeader className="bg-blue-600/10 border-b border-blue-500/20 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Simulated AI Response</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shrink-0 flex items-center justify-center border border-white/10">
                  <MessageSquare className="w-5 h-5 text-foreground" />
                </div>
                <div className="space-y-6">
                  <p className="text-lg text-foreground leading-relaxed font-medium italic">
                    "{result.simulatedAnswer}"
                  </p>
                  
                  <div className="pt-6 border-t border-border/50">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Cited Sources in this response</h4>
                    <div className="space-y-3">
                      {result.citedSources.map((source: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-background/40 border border-border rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-border'}`}></div>
                            <span className={`text-sm ${i === 0 ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>{source.name}</span>
                          </div>
                          <span className="text-xs font-mono text-muted-foreground">{source.relevance}% relevance</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card className="p-8 flex flex-col items-center text-center bg-emerald-950/5 border-emerald-500/20">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-6">Ranking Probability</h3>
              <Gauge value={result.rankingProbability} size={160} strokeWidth={12} color="#10b981" />
              <div className="mt-6 flex items-center gap-2 text-emerald-500 font-bold">
                <ArrowUpRight className="w-5 h-5" />
                <span>HIGH VISIBILITY</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Your content has an 82% chance of being cited as a primary source.</p>
            </Card>

            <Card className="border-amber-500/20 bg-amber-950/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-500">
                  <AlertCircle className="w-5 h-5" />
                  Visibility Gaps
                </CardTitle>
                <CardDescription>Suggestions to reach 95%+ probability</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {result.visibilitySuggestions.map((suggestion: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 group">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500/50 shrink-0 group-hover:bg-amber-500 transition-colors"></div>
                      <span className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                        {suggestion}
                      </span>
                    </li>
                  ))}
                </ul>
                <button className="w-full mt-6 py-2.5 bg-card hover:bg-muted border border-border rounded-lg text-sm font-semibold text-foreground transition-all">
                  Apply Recommendations
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
