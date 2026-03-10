import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Sparkles, Loader2, CheckCircle2, Copy, ArrowRight, List, HelpCircle, Book } from 'lucide-react';
import { aiService, OptimizationResult } from '../services/ai.service';

export function ContentOptimizer() {
  const [content, setContent] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimized, setOptimized] = useState<OptimizationResult | null>(null);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const data = await aiService.optimize(content);
      setOptimized(data);
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">AI Content Optimizer</h1>
        <p className="text-muted-foreground mt-1">Transform your articles into AI-ready knowledge assets.</p>
      </div>

      {!optimized ? (
        <Card>
          <CardContent className="p-8">
            <div className="space-y-4">
              <label className="text-sm font-medium text-muted-foreground">Paste your article content</label>
              <textarea
                placeholder="Paste the text you want to optimize for AI visibility..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-background border border-border rounded-lg p-6 text-foreground min-h-[400px] focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all resize-none font-mono text-sm leading-relaxed"
              />
              <div className="flex justify-end">
                <button
                  disabled={!content || isOptimizing}
                  onClick={handleOptimize}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-foreground rounded-lg font-bold transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Optimization...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Optimize for AI Visibility
                    </>
                  )}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in zoom-in-95 duration-500">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-foreground">Original Content</h3>
              <button 
                onClick={() => setOptimized(null)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Reset & Edit
              </button>
            </div>
            <Card className="h-[calc(100vh-250px)] overflow-y-auto bg-background/30">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed font-mono">
                  {content}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-blue-500 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Optimized Architecture
              </h3>
              <div className="flex gap-2">
                <button className="p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="px-4 py-2 bg-blue-600 text-foreground rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                  Export Ready
                </button>
              </div>
            </div>

            <Card className="h-[calc(100vh-250px)] overflow-y-auto border-blue-900/30 bg-blue-950/5">
              <CardContent className="p-8 space-y-12">
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-500">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Improved Title</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground leading-tight">{optimized.improvedTitle}</h2>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-indigo-500">
                    <Book className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Structured Explanations</span>
                  </div>
                  {optimized.explanationSections.map((section: any, i: number) => (
                    <div key={i} className="space-y-3">
                      <h4 className="font-bold text-foreground flex items-center gap-2">
                        <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                        {section.heading}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
                    </div>
                  ))}
                </section>

                <section className="space-y-6 p-6 rounded-2xl bg-card/50 border border-border">
                  <div className="flex items-center gap-2 text-emerald-500">
                    <List className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Definition Blocks</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {optimized.definitionBlock.map((def: any, i: number) => (
                      <div key={i} className="space-y-1">
                        <dt className="text-sm font-bold text-foreground">{def.term}</dt>
                        <dd className="text-sm text-muted-foreground leading-relaxed italic">"{def.definition}"</dd>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-orange-500">
                    <HelpCircle className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Semantic FAQ Section</span>
                  </div>
                  <div className="space-y-6">
                    {optimized.faqSection.map((faq: any, i: number) => (
                      <div key={i} className="space-y-2">
                        <p className="text-sm font-bold text-foreground">Q: {faq.question}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">A: {faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-purple-500">
                    <ArrowRight className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">LLM Reasoning Bullets</span>
                  </div>
                  <ul className="grid grid-cols-1 gap-3">
                    {optimized.bulletInsights.map((bullet: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></div>
                        <span className="text-sm text-muted-foreground">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
