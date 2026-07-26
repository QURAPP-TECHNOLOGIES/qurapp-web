import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, ShieldCheck, FileText, Code2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";

const Research = () => {
  useSEO({
    title: "Research & Innovations - QurApp Technologies",
    description: "Explore QurApp Research Innovations: Whitepapers, Islamic NLP safety, vector search across Shamela library, and open source.",
    url: "/research",
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Banner */}
        <section className="py-20 border-b border-border/40 bg-gradient-to-b from-purple-500/10 via-background to-background">
          <div className="container text-center max-w-3xl space-y-6">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-purple-500/30 text-purple-400 bg-purple-500/10 text-xs font-semibold uppercase">
              QurApp Research Innovations
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight text-foreground">
              Advancing Islamic AI & Infrastructure
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Pioneering research in classical Arabic manuscript indexing, zero-hallucination vector search, and AI safety aligned with Islamic scholarship.
            </p>
          </div>
        </section>

        {/* Papers & Research Projects */}
        <section className="py-16">
          <div className="container max-w-5xl space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Research 1 */}
              <Card className="border-border/60 bg-card hover:border-purple-500/40 transition-all">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center mb-2">
                    <FileText className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-xl font-bold">Shamela Vector Indexing</CardTitle>
                  <CardDescription className="text-xs font-mono">Whitepaper • Published 2026</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Methodology for high-density embedding and retrieval across classical Fiqh and Hadith corpuses, maintaining exact manuscript citations.
                  </p>
                  <Button variant="outline" size="sm" className="gap-2">
                    Read Whitepaper <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </CardContent>
              </Card>

              {/* Research 2 */}
              <Card className="border-border/60 bg-card hover:border-purple-500/40 transition-all">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-xl font-bold">Scholar AI Guardrails</CardTitle>
                  <CardDescription className="text-xs font-mono">Safety Framework • Open Spec</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Benchmark evaluation suite designed to prevent AI hallucinations when answering complex religious and jurisprudential questions.
                  </p>
                  <Button variant="outline" size="sm" className="gap-2">
                    View Safety Benchmark <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Research;
