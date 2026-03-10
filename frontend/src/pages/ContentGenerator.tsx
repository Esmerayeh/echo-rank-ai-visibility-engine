import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { PenTool, Loader2, Sparkles, Copy, Download, ChevronRight, CheckCircle2 } from 'lucide-react';
import { aiService, GenerationResult } from '../services/ai.service';

export function ContentGenerator() {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [generated, setGenerated] = useState<GenerationResult | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const data = await aiService.generate({ topic, audience, goal });
      setGenerated(data);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    if (!generated) return;
    setIsExporting(true);
    try {
      const content = `
# ${generated.title}

## Article
${generated.article}

## FAQ
${generated.faq.map(item => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n')}

## Citation Paragraphs
${generated.citationReadyParagraphs.map(p => `- "${p}"`).join('\n')}
      `;
      const { url } = await aiService.exportContent(content, `${topic.replace(/\s+/g, '_')}_optimized.md`, 'text/markdown');
      if (url === '#') {
        const blob = new Blob([content], { type: 'text/markdown' });
        const dummyUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = dummyUrl;
        a.download = `${topic.replace(/\s+/g, '_')}_optimized.md`;
        a.click();
        URL.revokeObjectURL(dummyUrl);
      } else {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">AI Content Generator</h1>
        <p className="text-muted-foreground mt-1">Generate high-authority content engineered for LLM citation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Parameters</CardTitle>
              <CardDescription>Define your target topic and goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Main Topic</label>
                <input
                  type="text"
                  placeholder="e.g., Future of LLMs"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Target Audience</label>
                <input
                  type="text"
                  placeholder="e.g., CTOs and Tech Leaders"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Content Goal</label>
                <select 
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                >
                  <option value="">Select a goal</option>
                  <option value="informational">Informational Authority</option>
                  <option value="thought-leadership">Thought Leadership</option>
                  <option value="technical-deep-dive">Technical Deep Dive</option>
                  <option value="how-to-guide">How-To Guide</option>
                </select>
              </div>
              <button
                disabled={!topic || isGenerating}
                onClick={handleGenerate}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-foreground rounded-lg font-bold transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Optimized Content
                  </>
                )}
              </button>
            </CardContent>
          </Card>

          <Card className="bg-blue-600/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                </div>
                <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">EchoRank Engine</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our engine automatically injects structured definition blocks, semantic headings, and citation-ready fragments to maximize LLM visibility.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {generated ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-foreground">Generated Architecture</h3>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Copy className="w-4 h-4" />
                    Copy All
                  </button>
                  <button 
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-foreground rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Export
                  </button>
                </div>
              </div>

              <Card className="bg-card/30">
                <CardContent className="p-8 space-y-10">
                  <section className="space-y-4">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em]">SEO + LLM Optimized Title</span>
                    <h2 className="text-3xl font-bold text-foreground leading-tight">{generated.title}</h2>
                  </section>

                  <section className="space-y-4">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em]">Logical Article Outline</span>
                    <div className="grid grid-cols-1 gap-3">
                      {generated.outline.map((item: string, i: number) => (
                        <div key={i} className="flex items-center gap-4 p-3 bg-background/40 border border-border rounded-xl group hover:border-emerald-500/30 transition-colors">
                          <span className="w-6 h-6 flex items-center justify-center bg-card text-[10px] font-bold text-muted-foreground rounded-lg group-hover:text-emerald-500 transition-colors">0{i+1}</span>
                          <span className="text-sm text-zinc-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <span className="text-[10px] font-bold text-purple-500 uppercase tracking-[0.2em]">High-Authority Article</span>
                    <div className="p-6 bg-background/40 border border-border rounded-xl">
                      <p className="text-sm text-muted-foreground leading-loose whitespace-pre-wrap">{generated.article}</p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em]">Semantic FAQ Blocks</span>
                    <div className="space-y-4">
                      {generated.faq.map((item: any, i: number) => (
                        <div key={i} className="space-y-2 p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl">
                          <p className="text-sm font-bold text-foreground">Q: {item.question}</p>
                          <p className="text-sm text-muted-foreground">A: {item.answer}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em]">Citation-Ready Paragraphs</span>
                    <div className="space-y-4">
                      {generated.citationReadyParagraphs.map((para: string, i: number) => (
                        <div key={i} className="flex gap-4 p-4 bg-blue-600/5 border border-blue-600/10 rounded-xl">
                          <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                          <p className="text-sm text-zinc-300 italic leading-relaxed">"{para}"</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-2xl bg-card/10 text-center">
              <div className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center mb-6 border border-border">
                <PenTool className="w-8 h-8 text-border" />
              </div>
              <h3 className="text-lg font-bold text-muted-foreground">Ready to Generate</h3>
              <p className="text-sm text-muted-foreground max-w-xs mt-2">
                Configure your parameters on the left to generate content optimized for AI visibility and citation.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4 text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase">
                    <CheckCircle2 className="w-3 h-3" />
                    Structured
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">Engineered for logical LLM ingestion.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase">
                    <CheckCircle2 className="w-3 h-3" />
                    Authoritative
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">Formatted to maximize citation markers.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
