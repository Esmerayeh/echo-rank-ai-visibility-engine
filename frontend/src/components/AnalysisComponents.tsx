import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Zap, Shield, BarChart3, CheckCircle2, TrendingUp, Info } from 'lucide-react';

interface Insight {
  title: string;
  description: string;
  opportunity: string;
}

interface Recommendation {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

interface CitationSystem {
  system: string;
  likelihood: 'Low' | 'Medium' | 'High';
}

export const InsightCard = ({ insight, index }: { insight: Insight; index: number }) => (

  <Card className="border-l-4 border-l-blue-600 bg-card/40 backdrop-blur-sm group hover:bg-card/60 transition-all duration-300 shadow-xl shadow-blue-500/5">

    <CardHeader className="pb-2">

      <CardTitle className="text-lg flex items-center gap-3 text-foreground">

        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform shadow-inner shadow-blue-500/10">

          <Zap className="w-4 h-4" />

        </div>

        {insight.title}

      </CardTitle>

    </CardHeader>

    <CardContent className="space-y-4">

      <p className="text-sm text-muted-foreground leading-relaxed">

        {insight.description}

      </p>

      <div className="p-4 bg-muted/50 rounded-2xl border border-border/50 group-hover:border-blue-500/20 transition-colors">

        <div className="flex items-center gap-2 mb-2">

          <TrendingUp className="w-3 h-3 text-blue-500" />

          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Opportunity</p>

        </div>

        <p className="text-sm text-foreground font-medium leading-relaxed italic">"{insight.opportunity}"</p>

      </div>

    </CardContent>

  </Card>

);



export const RecommendationItem = ({ rec }: { rec: Recommendation }) => (

  <div className="flex items-start gap-4 p-5 rounded-2xl bg-card/50 border border-border/50 hover:border-emerald-500/30 hover:bg-muted/50 transition-all duration-300 group cursor-default">

    <div className="mt-1 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-all">

      <CheckCircle2 className="w-4 h-4" />

    </div>

    <div className="space-y-2 flex-1">

      <div className="flex justify-between items-start gap-2">

        <h4 className="text-sm font-bold text-foreground group-hover:text-emerald-400 transition-colors">{rec.title}</h4>

        <span className={`text-[8px] px-2 py-0.5 rounded-full uppercase font-black tracking-tighter shadow-sm ${

          rec.impact === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :

          rec.impact === 'medium' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' :

          'bg-blue-500/20 text-blue-400 border border-blue-500/20'

        }`}>

          {rec.impact} Impact

        </span>

      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">{rec.description}</p>

    </div>

  </div>

);



export const CitationRadar = ({ citationRadar }: { citationRadar: CitationSystem[] }) => (

  <Card className="bg-card/40 border-border shadow-2xl shadow-purple-500/5">

    <CardHeader>

      <CardTitle className="flex items-center gap-2 text-foreground">

        <BarChart3 className="w-5 h-5 text-purple-500" />

        AI Citation Radar

      </CardTitle>

      <CardDescription className="text-muted-foreground">Likelihood of content appearing as cited source</CardDescription>

    </CardHeader>

        <CardContent>

          <div className="space-y-10 py-4">

            {citationRadar?.map((sys, i) => (

              <div key={i} className="space-y-4">

                <div className="flex justify-between items-center">

                  <span className="text-xs font-black text-foreground uppercase tracking-widest">{sys.system}</span>

                  <div className="flex gap-1.5 items-end h-4">

                    {[1, 2, 3, 4, 5].map((bar) => {

                      const level = sys.likelihood === 'High' ? 5 : sys.likelihood === 'Medium' ? 3 : 1;

                      const isActive = bar <= level;

                      return (

                        <div 

                          key={bar} 

                          className={`w-1.5 rounded-t-sm transition-all duration-700 delay-[${bar * 100}ms] ${

                            isActive 

                              ? sys.likelihood === 'High' ? 'bg-emerald-500' : 

                                sys.likelihood === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'

                              : 'bg-muted'

                          }`}

                          style={{ height: `${bar * 20 + 20}%` }}

                        />

                      );

                    })}

                  </div>

                </div>

                <div className="flex justify-between items-center">

                  <span className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-tighter ${

                    sys.likelihood === 'High' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :

                    sys.likelihood === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :

                    'bg-red-500/10 text-red-500 border border-red-500/20'

                  }`}>

                    {sys.likelihood} Probability

                  </span>

                  <div className="h-1 flex-1 mx-4 bg-muted/50 rounded-full overflow-hidden">

                    <div 

                      className={`h-full rounded-full transition-all duration-1000 delay-500 ${

                        sys.likelihood === 'High' ? 'bg-emerald-500' :

                        sys.likelihood === 'Medium' ? 'bg-yellow-500' :

                        'bg-red-500'

                      }`}

                      style={{ width: sys.likelihood === 'High' ? '100%' : sys.likelihood === 'Medium' ? '60%' : '20%' }}

                    />

                  </div>

                </div>

              </div>

            ))}

          </div>

      <div className="mt-6 pt-6 border-t border-border flex items-start gap-3 bg-muted/20 -mx-6 -mb-6 p-6">

        <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />

        <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">

          Calculated using LLM semantic alignment patterns and retrieval-augmented generation (RAG) simulation models.

        </p>

      </div>

    </CardContent>

  </Card>

);


